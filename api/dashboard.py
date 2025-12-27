from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """대시보드 통계 API"""
        try:
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            result = self._get_dashboard_stats(cursor)
            
            conn.close()
            
            self._send_response(200, result)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _get_dashboard_stats(self, cursor):
        """대시보드 통계 조회"""
        
        # 전체 요약
        cursor.execute("""
            SELECT 
                COUNT(*) as total_bids,
                COUNT(DISTINCT bidwinnr_bizno) as total_companies,
                COUNT(DISTINCT dminstt_nm) as total_institutions,
                SUM(sucsf_bid_amt) as total_amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate,
                ROUND(AVG(prtcpt_cnum)::numeric, 1) as avg_participants
            FROM bid_results
            WHERE sucsf_bid_amt > 0
        """)
        summary = cursor.fetchone()
        
        # 최근 30일 통계
        cursor.execute("""
            SELECT 
                COUNT(*) as recent_bids,
                SUM(sucsf_bid_amt) as recent_amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as recent_avg_rate
            FROM bid_results
            WHERE rgst_dt >= CURRENT_DATE - INTERVAL '30 days'
                AND sucsf_bid_amt > 0
        """)
        recent = cursor.fetchone()
        
        # 이전 30일 대비 증감
        cursor.execute("""
            SELECT COUNT(*) 
            FROM bid_results
            WHERE rgst_dt >= CURRENT_DATE - INTERVAL '60 days'
                AND rgst_dt < CURRENT_DATE - INTERVAL '30 days'
        """)
        prev_count = cursor.fetchone()[0] or 1
        
        recent_count = recent[0] or 0
        trend = round(((recent_count - prev_count) / prev_count) * 100, 1) if prev_count > 0 else 0
        
        # 월별 추이 (최근 6개월)
        cursor.execute("""
            SELECT 
                TO_CHAR(rgst_dt, 'YYYY-MM') as month,
                COUNT(*) as count,
                SUM(sucsf_bid_amt) as amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate
            FROM bid_results
            WHERE rgst_dt >= CURRENT_DATE - INTERVAL '6 months'
                AND rgst_dt IS NOT NULL
                AND sucsf_bid_rate IS NOT NULL
            GROUP BY TO_CHAR(rgst_dt, 'YYYY-MM')
            ORDER BY month
        """)
        monthly_trend = []
        for row in cursor.fetchall():
            monthly_trend.append({
                "month": row[0],
                "count": row[1],
                "amount": int(row[2]) if row[2] else 0,
                "avg_rate": float(row[3]) if row[3] else 0
            })
        
        # 입찰유형별 통계
        cursor.execute("""
            SELECT 
                COALESCE(bid_type, 'unknown') as bid_type,
                COUNT(*) as count,
                SUM(sucsf_bid_amt) as amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate
            FROM bid_results
            WHERE sucsf_bid_amt > 0
            GROUP BY bid_type
            ORDER BY count DESC
        """)
        by_type = []
        for row in cursor.fetchall():
            by_type.append({
                "type": row[0],
                "count": row[1],
                "amount": int(row[2]) if row[2] else 0,
                "avg_rate": float(row[3]) if row[3] else 0
            })
        
        # 상위 발주기관 TOP 5
        cursor.execute("""
            SELECT 
                dminstt_nm,
                COUNT(*) as count,
                SUM(sucsf_bid_amt) as amount
            FROM bid_results
            WHERE dminstt_nm IS NOT NULL 
                AND sucsf_bid_amt > 0
                AND dminstt_nm NOT LIKE '%수요기관%'
                AND dminstt_nm NOT LIKE '%각 %'
                AND LENGTH(dminstt_nm) > 2
            GROUP BY dminstt_nm
            ORDER BY count DESC
            LIMIT 5
        """)

        top_institutions = []
        for row in cursor.fetchall():
            top_institutions.append({
                "name": row[0],
                "count": row[1],
                "amount": int(row[2]) if row[2] else 0
            })
        
        # 상위 낙찰업체 TOP 5
        cursor.execute("""
            SELECT 
                bidwinnr_nm,
                COUNT(*) as count,
                SUM(sucsf_bid_amt) as amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate
            FROM bid_results
            WHERE bidwinnr_nm IS NOT NULL AND sucsf_bid_amt > 0
            GROUP BY bidwinnr_nm
            ORDER BY count DESC
            LIMIT 5
        """)
        top_companies = []
        for row in cursor.fetchall():
            top_companies.append({
                "name": row[0],
                "count": row[1],
                "amount": int(row[2]) if row[2] else 0,
                "avg_rate": float(row[3]) if row[3] else 0
            })
        
        # 최근 낙찰 5건
        cursor.execute("""
            SELECT 
                bid_ntce_nm,
                dminstt_nm,
                bidwinnr_nm,
                sucsf_bid_amt,
                sucsf_bid_rate,
                rgst_dt::date
            FROM bid_results
            WHERE rgst_dt IS NOT NULL
            ORDER BY rgst_dt DESC
            LIMIT 5
        """)
        recent_bids = []
        for row in cursor.fetchall():
            recent_bids.append({
                "bid_name": row[0],
                "institution": row[1],
                "winner": row[2],
                "amount": int(row[3]) if row[3] else 0,
                "rate": float(row[4]) if row[4] else 0,
                "date": str(row[5]) if row[5] else None
            })
        
        # 낙찰률 분포
        cursor.execute("""
            SELECT 
                CASE 
                    WHEN sucsf_bid_rate < 85 THEN '85% 미만'
                    WHEN sucsf_bid_rate < 88 THEN '85-88%'
                    WHEN sucsf_bid_rate < 90 THEN '88-90%'
                    WHEN sucsf_bid_rate < 95 THEN '90-95%'
                    ELSE '95% 이상'
                END as range,
                COUNT(*) as count
            FROM bid_results
            WHERE sucsf_bid_rate IS NOT NULL
            GROUP BY 
                CASE 
                    WHEN sucsf_bid_rate < 85 THEN '85% 미만'
                    WHEN sucsf_bid_rate < 88 THEN '85-88%'
                    WHEN sucsf_bid_rate < 90 THEN '88-90%'
                    WHEN sucsf_bid_rate < 95 THEN '90-95%'
                    ELSE '95% 이상'
                END
            ORDER BY MIN(sucsf_bid_rate)
        """)
        rate_distribution = []
        for row in cursor.fetchall():
            rate_distribution.append({
                "range": row[0],
                "count": row[1]
            })
        
        return {
            "success": True,
            "summary": {
                "total_bids": summary[0] if summary else 0,
                "total_companies": summary[1] if summary else 0,
                "total_institutions": summary[2] if summary else 0,
                "total_amount": int(summary[3]) if summary and summary[3] else 0,
                "avg_rate": float(summary[4]) if summary and summary[4] else 0,
                "avg_participants": float(summary[5]) if summary and summary[5] else 0
            },
            "recent_30days": {
                "bids": recent[0] if recent else 0,
                "amount": int(recent[1]) if recent and recent[1] else 0,
                "avg_rate": float(recent[2]) if recent and recent[2] else 0,
                "trend": trend
            },
            "monthly_trend": monthly_trend,
            "by_type": by_type,
            "top_institutions": top_institutions,
            "top_companies": top_companies,
            "recent_bids": recent_bids,
            "rate_distribution": rate_distribution
        }
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def _send_error(self, status_code, message):
        self._send_response(status_code, {"success": False, "error": message})
