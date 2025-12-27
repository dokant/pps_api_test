from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        기관별 패턴 분석 API
        
        파라미터:
        - name: 기관명 검색 (선택, 없으면 전체 기관 목록)
        - limit: 조회 개수 (기본 20)
        """
        try:
            query = parse_qs(urlparse(self.path).query)
            
            name = query.get('name', [None])[0]
            limit = int(query.get('limit', [20])[0])
            
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            if name:
                result = self._analyze_institution(cursor, name)
            else:
                result = self._get_institution_list(cursor, limit)
            
            conn.close()
            
            self._send_response(200, result)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _get_institution_list(self, cursor, limit):
        """상위 발주기관 목록"""
        
        query = """
            SELECT 
                dminstt_nm,
                COUNT(*) as bid_count,
                SUM(sucsf_bid_amt) as total_amount,
                ROUND(AVG(sucsf_bid_amt)::numeric, 0) as avg_amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate,
                ROUND(MIN(sucsf_bid_rate)::numeric, 2) as min_rate,
                ROUND(MAX(sucsf_bid_rate)::numeric, 2) as max_rate,
                ROUND(AVG(prtcpt_cnum)::numeric, 1) as avg_participants,
                COUNT(DISTINCT bidwinnr_bizno) as unique_winners
            FROM bid_results
            WHERE dminstt_nm IS NOT NULL 
                AND sucsf_bid_amt > 0
                AND sucsf_bid_rate IS NOT NULL
                AND dminstt_nm NOT LIKE '%%수요기관%%'
                AND dminstt_nm NOT LIKE '%%각 %%'
                AND char_length(dminstt_nm) > 2
            GROUP BY dminstt_nm
            ORDER BY bid_count DESC
            LIMIT %s
        """
        
        cursor.execute(query, [limit])
        rows = cursor.fetchall()
        
        institutions = []
        for row in rows:
            institutions.append({
                "name": row[0],
                "bid_count": row[1],
                "total_amount": int(row[2]) if row[2] else 0,
                "avg_amount": int(row[3]) if row[3] else 0,
                "avg_rate": float(row[4]) if row[4] else 0,
                "min_rate": float(row[5]) if row[5] else 0,
                "max_rate": float(row[6]) if row[6] else 0,
                "avg_participants": float(row[7]) if row[7] else 0,
                "unique_winners": row[8]
            })
        
        # 전체 통계
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT dminstt_nm) as total_institutions,
                COUNT(*) as total_bids,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as overall_avg_rate
            FROM bid_results
            WHERE dminstt_nm IS NOT NULL 
                AND sucsf_bid_rate IS NOT NULL
                AND dminstt_nm NOT LIKE '%%수요기관%%'
                AND dminstt_nm NOT LIKE '%%각 %%'
                AND char_length(dminstt_nm) > 2
        """)
        total_stats = cursor.fetchone()
        
        return {
            "success": True,
            "summary": {
                "total_institutions": total_stats[0] if total_stats else 0,
                "total_bids": total_stats[1] if total_stats else 0,
                "overall_avg_rate": float(total_stats[2]) if total_stats and total_stats[2] else 0
            },
            "institutions": institutions
        }
    
    def _analyze_institution(self, cursor, name):
        """특정 기관 상세 분석"""
        
        # 기본 통계
        stats_query = """
            SELECT 
                dminstt_nm,
                COUNT(*) as bid_count,
                SUM(sucsf_bid_amt) as total_amount,
                ROUND(AVG(sucsf_bid_amt)::numeric, 0) as avg_amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 3) as avg_rate,
                ROUND(STDDEV(sucsf_bid_rate)::numeric, 3) as std_rate,
                ROUND(MIN(sucsf_bid_rate)::numeric, 3) as min_rate,
                ROUND(MAX(sucsf_bid_rate)::numeric, 3) as max_rate,
                ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q1_rate,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as median_rate,
                ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q3_rate,
                ROUND(AVG(prtcpt_cnum)::numeric, 1) as avg_participants,
                COUNT(DISTINCT bidwinnr_bizno) as unique_winners
            FROM bid_results
            WHERE dminstt_nm LIKE %s
                AND sucsf_bid_amt > 0
                AND sucsf_bid_rate IS NOT NULL
            GROUP BY dminstt_nm
            ORDER BY COUNT(*) DESC
            LIMIT 1
        """
        
        cursor.execute(stats_query, [f"%{name}%"])
        stats = cursor.fetchone()
        
        if not stats:
            return {
                "success": False,
                "message": f"'{name}' 기관을 찾을 수 없습니다."
            }
        
        # 상위 낙찰업체
        top_winners_query = """
            SELECT 
                bidwinnr_nm,
                bidwinnr_bizno,
                COUNT(*) as win_count,
                SUM(sucsf_bid_amt) as total_amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate
            FROM bid_results
            WHERE dminstt_nm LIKE %s
                AND bidwinnr_nm IS NOT NULL
            GROUP BY bidwinnr_nm, bidwinnr_bizno
            ORDER BY win_count DESC
            LIMIT 10
        """
        
        cursor.execute(top_winners_query, [f"%{name}%"])
        top_winners = []
        for row in cursor.fetchall():
            top_winners.append({
                "company_name": row[0],
                "bizno": row[1],
                "win_count": row[2],
                "total_amount": int(row[3]) if row[3] else 0,
                "avg_rate": float(row[4]) if row[4] else 0
            })
        
        # 월별 추이
        monthly_query = """
            SELECT 
                TO_CHAR(rgst_dt, 'YYYY-MM') as month,
                COUNT(*) as count,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate,
                SUM(sucsf_bid_amt) as total_amount
            FROM bid_results
            WHERE dminstt_nm LIKE %s
                AND rgst_dt IS NOT NULL
                AND sucsf_bid_rate IS NOT NULL
            GROUP BY TO_CHAR(rgst_dt, 'YYYY-MM')
            ORDER BY month DESC
            LIMIT 12
        """
        
        cursor.execute(monthly_query, [f"%{name}%"])
        monthly_trend = []
        for row in cursor.fetchall():
            monthly_trend.append({
                "month": row[0],
                "count": row[1],
                "avg_rate": float(row[2]) if row[2] else 0,
                "total_amount": int(row[3]) if row[3] else 0
            })
        monthly_trend.reverse()
        
        # 최근 낙찰 내역
        recent_query = """
            SELECT 
                bid_ntce_nm,
                bidwinnr_nm,
                sucsf_bid_amt,
                sucsf_bid_rate,
                prtcpt_cnum,
                rgst_dt::date
            FROM bid_results
            WHERE dminstt_nm LIKE %s
            ORDER BY rgst_dt DESC
            LIMIT 10
        """
        
        cursor.execute(recent_query, [f"%{name}%"])
        recent_bids = []
        for row in cursor.fetchall():
            recent_bids.append({
                "bid_name": row[0],
                "winner": row[1],
                "amount": int(row[2]) if row[2] else 0,
                "rate": float(row[3]) if row[3] else 0,
                "participants": row[4],
                "date": str(row[5]) if row[5] else None
            })
        
        # 추천 투찰률 계산
        avg_rate = float(stats[4]) if stats[4] else 0
        q1_rate = float(stats[8]) if stats[8] else 0
        median_rate = float(stats[9]) if stats[9] else 0
        
        recommended_rate = {
            "optimal": round((q1_rate + median_rate) / 2, 2),
            "low": round(q1_rate, 2),
            "high": round(median_rate, 2)
        }
        
        return {
            "success": True,
            "institution": {
                "name": stats[0],
                "bid_count": stats[1],
                "total_amount": int(stats[2]) if stats[2] else 0,
                "avg_amount": int(stats[3]) if stats[3] else 0,
                "unique_winners": stats[12],
                "avg_participants": float(stats[11]) if stats[11] else 0
            },
            "rate_statistics": {
                "mean": avg_rate,
                "std": float(stats[5]) if stats[5] else 0,
                "min": float(stats[6]) if stats[6] else 0,
                "max": float(stats[7]) if stats[7] else 0,
                "q1": q1_rate,
                "median": median_rate,
                "q3": float(stats[10]) if stats[10] else 0
            },
            "recommended_rate": recommended_rate,
            "top_winners": top_winners,
            "monthly_trend": monthly_trend,
            "recent_bids": recent_bids
        }
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def _send_error(self, status_code, message):
        self._send_response(status_code, {"success": False, "error": message})
