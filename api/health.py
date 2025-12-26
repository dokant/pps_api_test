import json
import os
import psycopg2

def handler(request):
    """API 상태 및 DB 연결 테스트"""
    
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
        
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "success": True,
                "status": "healthy",
                "database": "connected",
                "total_records": total_count,
                "date_range": {
                    "min": str(date_range[0]) if date_range else None,
                    "max": str(date_range[1]) if date_range else None
                }
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "success": False,
                "status": "unhealthy",
                "error": str(e)
            }, ensure_ascii=False)
        }
