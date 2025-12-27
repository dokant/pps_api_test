from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """나라장터 API 키 테스트"""
        try:
            api_key = os.getenv("G2B_API_KEY")
            
            if not api_key:
                self._send_response(200, {
                    "success": False,
                    "error": "G2B_API_KEY 환경변수가 없습니다."
                })
                return
            
            # API 키 일부만 표시 (보안)
            masked_key = api_key[:10] + "..." + api_key[-5:] if len(api_key) > 15 else "***"
            
            # 간단한 API 테스트 - 낙찰결과 조회 (최근 1건)
            base_url = "http://apis.data.go.kr/1230000/BidResultInfoService/getScsbidListSttusThng"
            
            params = {
                "numOfRows": "1",
                "pageNo": "1",
                "inqryDiv": "1",
                "type": "json"
            }
            
            other_params = urllib.parse.urlencode(params)
            url = f"{base_url}?serviceKey={api_key}&{other_params}"
            
            test_result = {}
            
            try:
                req = urllib.request.Request(url)
                req.add_header("User-Agent", "Mozilla/5.0")
                with urllib.request.urlopen(req, timeout=30) as response:
                    raw_data = response.read().decode('utf-8')
                    data = json.loads(raw_data)
                    
                    # 응답 구조 확인
                    if "response" in data:
                        header = data["response"].get("header", {})
                        result_code = header.get("resultCode")
                        result_msg = header.get("resultMsg")
                        
                        body = data["response"].get("body", {})
                        total_count = body.get("totalCount", 0)
                        
                        test_result = {
                            "api_call": "success",
                            "result_code": result_code,
                            "result_msg": result_msg,
                            "total_count": total_count
                        }
                    else:
                        test_result = {
                            "api_call": "unexpected_response",
                            "raw_response": str(data)[:500]
                        }
                        
            except urllib.error.HTTPError as e:
                test_result = {
                    "api_call": "http_error",
                    "error_code": e.code,
                    "error_reason": e.reason,
                    "error_body": e.read().decode('utf-8')[:500] if e.fp else None
                }
            except Exception as e:
                test_result = {
                    "api_call": "error",
                    "error": str(e)
                }
            
            self._send_response(200, {
                "success": True,
                "api_key_masked": masked_key,
                "api_key_length": len(api_key),
                "test_result": test_result
            })
            
        except Exception as e:
            self._send_response(500, {
                "success": False,
                "error": str(e)
            })
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
