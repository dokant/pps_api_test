from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.parse


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """낙찰정보서비스 API 테스트"""
        try:
            api_key = os.getenv("G2B_API_KEY")

            if not api_key:
                self._send_response(200, {
                    "success": False,
                    "error": "G2B_API_KEY 환경변수가 없습니다."
                })
                return

            masked_key = api_key[:10] + "..." + api_key[-5:] if len(api_key) > 15 else "***"

            # 문서 기준 정확한 End Point
            # https://apis.data.go.kr/1230000/as/ScsbidInfoService
            
            test_apis = [
                {
                    "name": "낙찰된 목록 현황 물품조회 (getScsbidListSttusThng)",
                    "url": "https://apis.data.go.kr/1230000/as/ScsbidInfoService/getScsbidListSttusThng",
                    "params": {
                        "numOfRows": "1",
                        "pageNo": "1",
                        "inqryDiv": "1",
                        "type": "json",
                        "inqryBgnDt": "202412010000",
                        "inqryEndDt": "202412312359"
                    }
                },
                {
                    "name": "개찰결과 개찰완료 목록 조회 (getOpengResultListInfoOpengCompt)",
                    "url": "https://apis.data.go.kr/1230000/as/ScsbidInfoService/getOpengResultListInfoOpengCompt",
                    "params": {
                        "numOfRows": "1",
                        "pageNo": "1",
                        "inqryDiv": "1",
                        "type": "json",
                        "bidNtceNo": "20241200000"
                    }
                }
            ]

            results = []

            for api in test_apis:
                other_params = urllib.parse.urlencode(api["params"])
                url = f"{api['url']}?serviceKey={api_key}&{other_params}"

                try:
                    req = urllib.request.Request(url)
                    req.add_header("User-Agent", "Mozilla/5.0")
                    with urllib.request.urlopen(req, timeout=30) as response:
                        raw_data = response.read().decode('utf-8')
                        data = json.loads(raw_data)

                        if "response" in data:
                            header = data["response"].get("header", {})
                            body = data["response"].get("body", {})

                            results.append({
                                "api_name": api["name"],
                                "status": "success",
                                "result_code": header.get("resultCode"),
                                "result_msg": header.get("resultMsg"),
                                "total_count": body.get("totalCount", 0)
                            })
                        else:
                            results.append({
                                "api_name": api["name"],
                                "status": "unexpected",
                                "raw": str(data)[:300]
                            })

                except urllib.error.HTTPError as e:
                    error_body = ""
                    try:
                        error_body = e.read().decode('utf-8')[:300]
                    except:
                        pass
                    results.append({
                        "api_name": api["name"],
                        "status": "http_error",
                        "error_code": e.code,
                        "error_body": error_body
                    })
                except Exception as e:
                    results.append({
                        "api_name": api["name"],
                        "status": "error",
                        "error": str(e)
                    })

            self._send_response(200, {
                "success": True,
                "api_key_masked": masked_key,
                "api_key_length": len(api_key),
                "endpoint": "https://apis.data.go.kr/1230000/as/ScsbidInfoService",
                "test_results": results
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
