from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        낙찰가 예측 API
        
        파라미터:
        - estimated_price: 예정가격 (필수)
        - institution: 발주기관명 (선택)
        - bid_type: 입찰유형 (선택)
        - participants: 예상 참가업체수 (선택)
        """
        try:
            # 파라미터 파싱
            query = parse_qs(urlparse(self.path).query)
            
            estimated_price = int(query.get('estimated_price', [0])[0])
            institution = query.get('institution', [None])[0]
            bid_type = query.get('bid_type', [None])[0]
            participants = query.get('participants', [None])[0]
            if participants:
                participants = int(participants)
            
            if not estimated_price:
                self._send_error(400, "estimated_price는 필수입니다")
                return
            
            # DB 연결
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            # 유사 조건 데이터 조회
            result = self._predict_bid_rate(
                cursor, 
                estimated_price, 
                institution, 
                bid_type, 
                participants
            )
            
            conn.close()
            
            self._send_response(200, result)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _predict_bid_rate(self, cursor, estimated_price, institution, bid_type, participants):
        """과거 데이터 기반 낙찰률 예측"""
        
        # 금액 범위 설정 (±30%)
        min_amount = int(estimated_price * 0.7)
        max_amount = int(estimated_price * 1.3)
        
        # 조건 구성
        conditions = [
            "sucsf_bid_rate IS NOT NULL",
            "sucsf_bid_amt > 0",
            "sucsf_bid_amt BETWEEN %s AND %s"
        ]
        params = [min_amount, max_amount]
        
        if institution:
            conditions.append("dminstt_nm LIKE %s")
            params.append(f"%{institution}%")
        
        if bid_type:
            conditions.append("bid_type = %s")
            params.append(bid_type)
        
        if participants:
            conditions.append("prtcpt_cnum BETWEEN %s AND %s")
            params.extend([max(1, participants - 5), participants + 5])
        
        where_clause = " AND ".join(conditions)
        
        # 통계 쿼리
        query = f"""
            SELECT 
                COUNT(*) as sample_count,
                ROUND(AVG(sucsf_bid_rate)::numeric, 3) as avg_rate,
                ROUND(STDDEV(sucsf_bid_rate)::numeric, 3) as std_rate,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as median_rate,
                ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q1_rate,
                ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q3_rate,
                ROUND(MIN(sucsf_bid_rate)::numeric, 3) as min_rate,
                ROUND(MAX(sucsf_bid_rate)::numeric, 3) as max_rate
            FROM bid_results
            WHERE {where_clause}
        """
        
        cursor.execute(query, params)
        stats = cursor.fetchone()
        
        sample_count = stats[0] or 0
        
        # 데이터 부족 시 조건 완화
        if sample_count < 10:
            return self._predict_with_relaxed_conditions(
                cursor, estimated_price, bid_type, participants
            )
        
        avg_rate = float(stats[1]) if stats[1] else 0
        std_rate = float(stats[2]) if stats[2] else 0
        median_rate = float(stats[3]) if stats[3] else 0
        q1_rate = float(stats[4]) if stats[4] else 0
        q3_rate = float(stats[5]) if stats[5] else 0
        min_rate = float(stats[6]) if stats[6] else 0
        max_rate = float(stats[7]) if stats[7] else 0
        
        # 참가업체수 보정
        adjustment = 0
        if participants:
            if participants <= 5:
                adjustment = 0.5
            elif participants <= 10:
                adjustment = 0
            elif participants <= 20:
                adjustment = -0.3
            else:
                adjustment = -0.5
        
        # 추천 투찰률 계산
        recommended_low = round(q1_rate + adjustment, 3)
        recommended_high = round(median_rate + adjustment, 3)
        optimal_rate = round((recommended_low + recommended_high) / 2, 3)
        
        # 추천 투찰금액 계산
        optimal_amount = int(estimated_price * optimal_rate / 100)
        low_amount = int(estimated_price * recommended_low / 100)
        high_amount = int(estimated_price * recommended_high / 100)
        
        # 유사 사례 조회
        similar_query = f"""
            SELECT 
                bid_ntce_nm,
                dminstt_nm,
                sucsf_bid_amt,
                sucsf_bid_rate,
                prtcpt_cnum,
                rgst_dt::date
            FROM bid_results
            WHERE {where_clause}
            ORDER BY rgst_dt DESC
            LIMIT 10
        """
        cursor.execute(similar_query, params)
        similar_cases = []
        for row in cursor.fetchall():
            similar_cases.append({
                "bid_name": row[0],
                "institution": row[1],
                "amount": row[2],
                "rate": float(row[3]) if row[3] else None,
                "participants": row[4],
                "date": str(row[5]) if row[5] else None
            })
        
        return {
            "success": True,
            "estimated_price": estimated_price,
            "sample_count": sample_count,
            "statistics": {
                "mean": avg_rate,
                "std": std_rate,
                "median": median_rate,
                "q1": q1_rate,
                "q3": q3_rate,
                "min": min_rate,
                "max": max_rate
            },
            "recommended_rate": {
                "optimal": optimal_rate,
                "low": recommended_low,
                "high": recommended_high
            },
            "recommended_amount": {
                "optimal": optimal_amount,
                "low": low_amount,
                "high": high_amount
            },
            "adjustment": adjustment,
            "similar_cases": similar_cases
        }
    
    def _predict_with_relaxed_conditions(self, cursor, estimated_price, bid_type, participants):
        """조건 완화하여 재검색"""
        
        min_amount = int(estimated_price * 0.5)
        max_amount = int(estimated_price * 1.5)
        
        conditions = [
            "sucsf_bid_rate IS NOT NULL",
            "sucsf_bid_amt BETWEEN %s AND %s"
        ]
        params = [min_amount, max_amount]
        
        if bid_type:
            conditions.append("bid_type = %s")
            params.append(bid_type)
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
            SELECT 
                COUNT(*) as sample_count,
                ROUND(AVG(sucsf_bid_rate)::numeric, 3) as avg_rate,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as median_rate,
                ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q1_rate,
                ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q3_rate
            FROM bid_results
            WHERE {where_clause}
        """
        
        cursor.execute(query, params)
        stats = cursor.fetchone()
        
        sample_count = stats[0] or 0
        
        if sample_count < 5:
            return {
                "success": False,
                "message": "유사한 과거 데이터가 부족합니다",
                "sample_count": sample_count
            }
        
        avg_rate = float(stats[1]) if stats[1] else 87.5
        median_rate = float(stats[2]) if stats[2] else 87.5
        q1_rate = float(stats[3]) if stats[3] else 86.0
        q3_rate = float(stats[4]) if stats[4] else 89.0
        
        optimal_rate = round((q1_rate + median_rate) / 2, 3)
        
        return {
            "success": True,
            "estimated_price": estimated_price,
            "sample_count": sample_count,
            "search_level": "완화된 조건",
            "statistics": {
                "mean": avg_rate,
                "median": median_rate,
                "q1": q1_rate,
                "q3": q3_rate
            },
            "recommended_rate": {
                "optimal": optimal_rate,
                "low": q1_rate,
                "high": median_rate
            },
            "recommended_amount": {
                "optimal": int(estimated_price * optimal_rate / 100),
                "low": int(estimated_price * q1_rate / 100),
                "high": int(estimated_price * median_rate / 100)
            }
        }
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def _send_error(self, status_code, message):
        self._send_response(status_code, {"success": False, "error": message})
