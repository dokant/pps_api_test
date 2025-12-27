from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """DB 테이블 구조 확인 API"""
        try:
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            # 테이블 목록 조회
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """)
            tables = [row[0] for row in cursor.fetchall()]
            
            # 각 테이블의 컬럼 정보
            table_info = {}
            for table in tables:
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable
                    FROM information_schema.columns
                    WHERE table_name = %s
                    ORDER BY ordinal_position
                """, [table])
                columns = []
                for row in cursor.fetchall():
                    columns.append({
                        "name": row[0],
                        "type": row[1],
                        "nullable": row[2]
                    })
                
                # 레코드 수
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                
                table_info[table] = {
                    "columns": columns,
                    "record_count": count
                }
            
            conn.close()
            
            self._send_response(200, {
                "success": True,
                "tables": tables,
                "table_info": table_info
            })
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def _send_error(self, status_code, message):
        self._send_response(status_code, {"success": False, "error": message})
