from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # DB 연결 테스트
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            # 전체 건수 조회
            cursor.execute("SELECT COUNT(*) FROM bid_results")
            total_count = cursor.fetchone()[0]
            
            # 데이터 기간 조회
            cursor.execute("""
                SELECT 
                    MIN(rgst_dt)::date as min_date,
                    MAX(rgst_dt)::date as max_date
                FROM bid_results
                WHERE rgst_dt IS NOT NULL
            """)
            date_range = cursor.fetchone()
            
            conn.close()
            
            response = {
                "success": True,
                "status": "healthy",
                "database": "connected",
                "total_records": total_count,
                "date_range": {
                    "min": str(date_range[0]) if date_range else None,
                    "max": str(date_range[1]) if date_range else None
                }
            }
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
            
        except Exception as e:
            response = {
                "success": False,
                "status": "unhealthy",
                "error": str(e)
            }
            
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
