from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        경쟁사 분석 API
        
        파라미터:
        - institution: 발주기관명 (선택)
        - bid_type: 입찰유형 (선택)
        - limit: 조회 개수 (기본 10)
        """
        try:
            # 파라미터 파싱
            query = parse_qs(urlparse(self.path).query)
            
            institution = query.get('institution', [None])[0]
            bid_type = query.get('bid_type', [None])[0]
            limit = int(query.get('limit', [10])[0])
            
            # DB 연결
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            # 경쟁사 분석
            result = self._analyze_competitors(cursor, institution, bid_type, limit)
            
            conn.close()
            
            self._send_response(200, result)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _analyze_competitors(self, cursor, institution, bid_type, limit):
        """상위 낙찰업체 분석"""
        
        # 조건 구성
        conditions = ["bidwinnr_nm IS NOT NULL", "sucsf_bid_amt > 0"]
        params = []
        
        if institution:
            conditions.append("dminstt_nm LIKE %s")
            params.append(f"%{institution}%")
        
        if bid_type:
            conditions.append("bid_type = %s")
            params.append(bid_type)
        
        where_clause = " AND ".join(conditions)
        
        # 상위 낙찰업체 조회
        query = f"""
            SELECT 
                bidwinnr_nm,
                bidwinnr_bizno,
                COUNT(*) as win_count,
                SUM(sucsf_bid_amt) as total_amount,
                ROUND(AVG(sucsf_bid_amt)::numeric, 0) as avg_amount,
                ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate,
                ROUND(MIN(sucsf_bid_rate)::numeric, 2) as min_rate,
                ROUND(MAX(sucsf_bid_rate)::numeric, 2) as max_rate,
                ROUND(AVG(prtcpt_cnum)::numeric, 1) as avg_participants
            FROM bid_results
            WHERE {where_clause}
            GROUP BY bidwinnr_nm, bidwinnr_bizno
            ORDER BY win_count DESC
            LIMIT %s
        """
        
        cursor.execute(query, params + [limit])
        rows = cursor.fetchall()
        
        competitors = []
        for row in rows:
            competitors.append({
                "company_name": row[0],
                "bizno": row[1],
                "win_count": row[2],
                "total_amount": int(row[3]) if row[3] else 0,
                "avg_amount": int(row[4]) if row[4] else 0,
                "avg_rate": float(row[5]) if row[5] else 0,
                "min_rate": float(row[6]) if row[6] else 0,
                "max_rate": float(row[7]) if row[7] else 0,
                "avg_participants": float(row[8]) if row[8] else 0
            })
        
        # 전체 통계
        total_query = f"""
            SELECT 
                COUNT(DISTINCT bidwinnr_bizno) as total_companies,
                COUNT(*) as total_bids,
                SUM(sucsf_bid_amt) as total_amount,
                ROUND(AVG(prtcpt_cnum)::numeric, 1) as avg_participants
            FROM bid_results
            WHERE {where_clause}
        """
        
        cursor.execute(total_query, params)
        total_stats = cursor.fetchone()
        
        # 시장 집중도 (상위 3개 업체 점유율)
        if competitors and total_stats[2]:
            top3_amount = sum(c['total_amount'] for c in competitors[:3])
            concentration = round((top3_amount / int(total_stats[2])) * 100, 1)
        else:
            concentration = 0
        
        # 경쟁 강도 판단
        avg_participants = float(total_stats[3]) if total_stats[3] else 0
        if avg_participants <= 5:
            intensity = {"level": "낮음", "color": "green"}
        elif avg_participants <= 10:
            intensity = {"level": "보통", "color": "yellow"}
        elif avg_participants <= 20:
            intensity = {"level": "높음", "color": "orange"}
        else:
            intensity = {"level": "매우 높음", "color": "red"}
        
        return {
            "success": True,
            "filter": {
                "institution": institution,
                "bid_type": bid_type
            },
            "summary": {
                "total_companies": total_stats[0] if total_stats[0] else 0,
                "total_bids": total_stats[1] if total_stats[1] else 0,
                "total_amount": int(total_stats[2]) if total_stats[2] else 0,
                "avg_participants": avg_participants,
                "market_concentration": concentration,
                "competition_intensity": intensity
            },
            "competitors": competitors
        }
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def _send_error(self, status_code, message):
        self._send_response(status_code, {"success": False, "error": message})
