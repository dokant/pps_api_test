from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        입찰 정보 검색 API
        
        파라미터:
        - keyword: 공고명 검색 (선택)
        - institution: 발주기관명 (선택)
        - company: 낙찰업체명 (선택)
        - min_amount: 최소 금액 (선택)
        - max_amount: 최대 금액 (선택)
        - min_rate: 최소 낙찰률 (선택)
        - max_rate: 최대 낙찰률 (선택)
        - start_date: 시작일 (선택, YYYY-MM-DD)
        - end_date: 종료일 (선택, YYYY-MM-DD)
        - limit: 조회 개수 (기본 50)
        - offset: 페이지 오프셋 (기본 0)
        """
        try:
            query = parse_qs(urlparse(self.path).query)
            
            keyword = query.get('keyword', [None])[0]
            institution = query.get('institution', [None])[0]
            company = query.get('company', [None])[0]
            min_amount = query.get('min_amount', [None])[0]
            max_amount = query.get('max_amount', [None])[0]
            min_rate = query.get('min_rate', [None])[0]
            max_rate = query.get('max_rate', [None])[0]
            start_date = query.get('start_date', [None])[0]
            end_date = query.get('end_date', [None])[0]
            limit = int(query.get('limit', [50])[0])
            offset = int(query.get('offset', [0])[0])
            
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            result = self._search_bids(
                cursor, keyword, institution, company,
                min_amount, max_amount, min_rate, max_rate,
                start_date, end_date, limit, offset
            )
            
            conn.close()
            
            self._send_response(200, result)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _search_bids(self, cursor, keyword, institution, company,
                     min_amount, max_amount, min_rate, max_rate,
                     start_date, end_date, limit, offset):
        """입찰 정보 검색"""
        
        conditions = ["1=1"]
        params = []
        
        if keyword:
            conditions.append("bid_ntce_nm LIKE %s")
            params.append(f"%{keyword}%")
        
        if institution:
            conditions.append("dminstt_nm LIKE %s")
            params.append(f"%{institution}%")
        
        if company:
            conditions.append("bidwinnr_nm LIKE %s")
            params.append(f"%{company}%")
        
        if min_amount:
            conditions.append("sucsf_bid_amt >= %s")
            params.append(int(min_amount))
        
        if max_amount:
            conditions.append("sucsf_bid_amt <= %s")
            params.append(int(max_amount))
        
        if min_rate:
            conditions.append("sucsf_bid_rate >= %s")
            params.append(float(min_rate))
        
        if max_rate:
            conditions.append("sucsf_bid_rate <= %s")
            params.append(float(max_rate))
        
        if start_date:
            conditions.append("rgst_dt::date >= %s")
            params.append(start_date)
        
        if end_date:
            conditions.append("rgst_dt::date <= %s")
            params.append(end_date)
        
        where_clause = " AND ".join(conditions)
        
        # 전체 건수 조회
        count_query = f"""
            SELECT COUNT(*) FROM bid_results WHERE {where_clause}
        """
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]
        
        # 데이터 조회
        data_query = f"""
            SELECT 
                bid_ntce_no,
                bid_ntce_nm,
                dminstt_nm,
                bidwinnr_nm,
                bidwinnr_bizno,
                sucsf_bid_amt,
                sucsf_bid_rate,
                prtcpt_cnum,
                rgst_dt::date,
                bid_type
            FROM bid_results
            WHERE {where_clause}
            ORDER BY rgst_dt DESC
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(data_query, params + [limit, offset])
        rows = cursor.fetchall()
        
        results = []
        for row in rows:
            results.append({
                "bid_no": row[0],
                "bid_name": row[1],
                "institution": row[2],
                "winner": row[3],
                "winner_bizno": row[4],
                "amount": int(row[5]) if row[5] else 0,
                "rate": float(row[6]) if row[6] else 0,
                "participants": row[7],
                "date": str(row[8]) if row[8] else None,
                "bid_type": row[9]
            })
        
        # 검색 통계
        if total_count > 0:
            stats_query = f"""
                SELECT 
                    ROUND(AVG(sucsf_bid_rate)::numeric, 2) as avg_rate,
                    ROUND(AVG(sucsf_bid_amt)::numeric, 0) as avg_amount,
                    SUM(sucsf_bid_amt) as total_amount,
                    ROUND(AVG(prtcpt_cnum)::numeric, 1) as avg_participants
                FROM bid_results
                WHERE {where_clause}
            """
            cursor.execute(stats_query, params)
            stats = cursor.fetchone()
            
            search_stats = {
                "avg_rate": float(stats[0]) if stats[0] else 0,
                "avg_amount": int(stats[1]) if stats[1] else 0,
                "total_amount": int(stats[2]) if stats[2] else 0,
                "avg_participants": float(stats[3]) if stats[3] else 0
            }
        else:
            search_stats = None
        
        return {
            "success": True,
            "total_count": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_count,
            "statistics": search_stats,
            "results": results
        }
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def _send_error(self, status_code, message):
        self._send_response(status_code, {"success": False, "error": message})
