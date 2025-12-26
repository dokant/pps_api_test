from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        낙찰 확률 계산 API
        
        파라미터:
        - my_rate: 내 투찰률 (필수)
        - estimated_price: 예정가격 (선택)
        - institution: 발주기관명 (선택)
        - bid_type: 입찰유형 (선택)
        - participants: 예상 참가업체수 (선택)
        """
        try:
            # 파라미터 파싱
            query = parse_qs(urlparse(self.path).query)
            
            my_rate = float(query.get('my_rate', [0])[0])
            estimated_price = query.get('estimated_price', [None])[0]
            if estimated_price:
                estimated_price = int(estimated_price)
            institution = query.get('institution', [None])[0]
            bid_type = query.get('bid_type', [None])[0]
            participants = query.get('participants', [None])[0]
            if participants:
                participants = int(participants)
            
            if not my_rate:
                self._send_error(400, "my_rate는 필수입니다")
                return
            
            # DB 연결
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            # 확률 계산
            result = self._calculate_probability(
                cursor, my_rate, estimated_price, institution, bid_type, participants
            )
            
            conn.close()
            
            self._send_response(200, result)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _calculate_probability(self, cursor, my_rate, estimated_price, institution, bid_type, participants):
        """과거 데이터 기반 낙찰 확률 계산"""
        
        # 조건 구성
        conditions = ["sucsf_bid_rate IS NOT NULL", "sucsf_bid_amt > 0"]
        params = []
        
        if estimated_price:
            min_amount = int(estimated_price * 0.5)
            max_amount = int(estimated_price * 1.5)
            conditions.append("sucsf_bid_amt BETWEEN %s AND %s")
            params.extend([min_amount, max_amount])
        
        if institution:
            conditions.append("dminstt_nm LIKE %s")
            params.append(f"%{institution}%")
        
        if bid_type:
            conditions.append("bid_type = %s")
            params.append(bid_type)
        
        if participants:
            conditions.append("prtcpt_cnum BETWEEN %s AND %s")
            params.extend([max(1, participants - 10), participants + 10])
        
        where_clause = " AND ".join(conditions)
        
        # 통계 쿼리
        stats_query = f"""
            SELECT 
                COUNT(*) as total,
                ROUND(AVG(sucsf_bid_rate)::numeric, 3) as avg_rate,
                ROUND(STDDEV(sucsf_bid_rate)::numeric, 3) as std_rate,
                ROUND(PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q1,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as median,
                ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY sucsf_bid_rate)::numeric, 3) as q3
            FROM bid_results
            WHERE {where_clause}
        """
        
        cursor.execute(stats_query, params)
        stats = cursor.fetchone()
        
        total = stats[0] or 0
        
        if total < 10:
            return {
                "success": False,
                "message": "확률 계산을 위한 데이터가 부족합니다",
                "sample_count": total
            }
        
        avg_rate = float(stats[1]) if stats[1] else 0
        std_rate = float(stats[2]) if stats[2] else 1
        q1 = float(stats[3]) if stats[3] else 0
        median = float(stats[4]) if stats[4] else 0
        q3 = float(stats[5]) if stats[5] else 0
        
        # 내 투찰률보다 높은(덜 경쟁적인) 비율 계산
        percentile_query = f"""
            SELECT 
                COUNT(*) FILTER (WHERE sucsf_bid_rate > %s) as higher_count
            FROM bid_results
            WHERE {where_clause}
        """
        
        cursor.execute(percentile_query, [my_rate] + params)
        higher_count = cursor.fetchone()[0] or 0
        
        # 백분위 계산 (낮은 투찰률 = 높은 경쟁력)
        percentile = round((higher_count / total) * 100, 1)
        
        # 낙찰 확률 계산
        if participants and participants > 1:
            # 상위 percentile%에 들 확률 기반
            base_probability = percentile
            # 참가업체수 반영 (1등해야 낙찰)
            win_probability = min(95, base_probability * (1.5 / participants) * 2)
        else:
            win_probability = percentile
        
        win_probability = round(max(5, min(95, win_probability)), 1)
        
        # Z-score 계산
        z_score = round((my_rate - avg_rate) / std_rate, 2) if std_rate > 0 else 0
        
        # 예상 순위
        estimated_rank = max(1, int(((100 - percentile) / 100) * (participants or 10)) + 1)
        
        # 리스크 레벨 및 추천
        if my_rate < q1 - 2:
            risk_level = "높음"
            risk_color = "red"
            recommendation = "⚠️ 투찰률이 너무 낮습니다. 덤핑 의심을 받거나 수익성이 낮을 수 있습니다."
        elif my_rate < q1:
            risk_level = "적정-공격적"
            risk_color = "yellow"
            recommendation = "✅ 공격적인 투찰입니다. 낙찰 가능성이 높지만 마진이 적을 수 있습니다."
        elif my_rate < median:
            risk_level = "적정"
            risk_color = "green"
            recommendation = "✅ 적정 수준의 투찰입니다. 낙찰 가능성과 수익성의 균형이 좋습니다."
        elif my_rate < q3:
            risk_level = "보수적"
            risk_color = "yellow"
            recommendation = "⚡ 보수적인 투찰입니다. 수익성은 좋지만 낙찰 가능성이 낮아질 수 있습니다."
        else:
            risk_level = "낮음"
            risk_color = "red"
            recommendation = "⚠️ 투찰률이 높습니다. 낙찰 가능성이 낮을 수 있으니 재검토를 권장합니다."
        
        return {
            "success": True,
            "my_rate": my_rate,
            "my_amount": int(estimated_price * my_rate / 100) if estimated_price else None,
            "win_probability": win_probability,
            "percentile": percentile,
            "estimated_rank": estimated_rank,
            "total_participants": participants or "미지정",
            "risk": {
                "level": risk_level,
                "color": risk_color
            },
            "recommendation": recommendation,
            "z_score": z_score,
            "sample_count": total,
            "distribution": {
                "mean": avg_rate,
                "std": std_rate,
                "median": median,
                "q1": q1,
                "q3": q3
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
