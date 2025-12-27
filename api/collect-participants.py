from http.server import BaseHTTPRequestHandler
import json
import os
import psycopg2
import urllib.request
import urllib.parse
from urllib.parse import parse_qs, urlparse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """
        입찰참가업체 정보 수집 API
        - getOpengResultListInfoOpengCompt: 개찰결과 개찰완료 목록 조회
        """
        try:
            query = parse_qs(urlparse(self.path).query)
            
            bid_no = query.get('bid_no', [None])[0]
            limit = int(query.get('limit', [10])[0])
            
            api_key = os.getenv("G2B_API_KEY")
            if not api_key:
                self._send_error(500, "G2B_API_KEY 환경변수가 설정되지 않았습니다.")
                return
            
            conn = psycopg2.connect(os.getenv("DATABASE_URL"))
            cursor = conn.cursor()
            
            if bid_no:
                result = self._collect_single(cursor, conn, api_key, bid_no)
            else:
                result = self._collect_recent(cursor, conn, api_key, limit)
            
            conn.close()
            
            self._send_response(200, result)
            
        except Exception as e:
            self._send_error(500, str(e))
    
    def _collect_single(self, cursor, conn, api_key, bid_no):
        """특정 입찰건 참가업체 수집"""
        
        cursor.execute("""
            SELECT bid_ntce_no, bid_ntce_ord, bid_clsfc_no, bid_ntce_nm, bid_type
            FROM bid_results
            WHERE bid_ntce_no = %s
            LIMIT 1
        """, [bid_no])
        
        bid = cursor.fetchone()
        if not bid:
            return {"success": False, "message": f"입찰번호 {bid_no}를 찾을 수 없습니다."}
        
        result = self._fetch_and_save_participants(
            cursor, conn, api_key,
            bid[0], bid[1] or "00", bid[2] or "00"
        )
        
        return {
            "success": True,
            "bid_no": bid_no,
            "bid_name": bid[3],
            "bid_type": bid[4],
            "collected_count": result.get("saved", 0),
            "debug": result.get("debug")
        }
    
    def _collect_recent(self, cursor, conn, api_key, limit):
        """최근 낙찰건 기준 참가업체 수집"""
        
        cursor.execute("""
            SELECT b.bid_ntce_no, b.bid_ntce_ord, b.bid_clsfc_no, b.bid_ntce_nm, b.bid_type
            FROM bid_results b
            LEFT JOIN bid_participants p ON b.bid_ntce_no = p.bid_ntce_no
            WHERE p.id IS NULL
                AND b.prtcpt_cnum > 1
                AND b.prtcpt_cnum <= 100
            GROUP BY b.bid_ntce_no, b.bid_ntce_ord, b.bid_clsfc_no, b.bid_ntce_nm, b.bid_type, b.rgst_dt
            ORDER BY b.rgst_dt DESC
            LIMIT %s
        """, [limit])
        
        bids = cursor.fetchall()
        
        results = []
        total_collected = 0
        
        for bid in bids:
            try:
                result = self._fetch_and_save_participants(
                    cursor, conn, api_key,
                    bid[0], bid[1] or "00", bid[2] or "00"
                )
                collected = result.get("saved", 0)
                results.append({
                    "bid_no": bid[0],
                    "bid_name": bid[3],
                    "bid_type": bid[4],
                    "collected": collected,
                    "status": "success" if collected > 0 else "no_data",
                    "debug": result.get("debug")
                })
                total_collected += collected
            except Exception as e:
                results.append({
                    "bid_no": bid[0],
                    "bid_name": bid[3],
                    "error": str(e),
                    "status": "failed"
                })
        
        return {
            "success": True,
            "processed_count": len(bids),
            "total_collected": total_collected,
            "results": results
        }
    
    def _fetch_and_save_participants(self, cursor, conn, api_key, bid_ntce_no, bid_ntce_ord, bid_clsfc_no):
        """
        나라장터 API에서 참가업체 조회 후 저장
        - getOpengResultListInfoOpengCompt: 개찰결과 개찰완료 목록 조회
        """
        
        # 개찰결과 개찰완료 목록 조회 API (정확한 엔드포인트)
        base_url = "https://apis.data.go.kr/1230000/as/ScsbidInfoService/getOpengResultListInfoOpengCompt"

        params = {
            "numOfRows": "100",
            "pageNo": "1",
            "bidNtceNo": bid_ntce_no,
            "bidNtceOrd": bid_ntce_ord,
            "type": "json"
        }
        
        other_params = urllib.parse.urlencode(params)
        url = f"{base_url}?serviceKey={api_key}&{other_params}"
        
        debug_info = {
            "bid_no": bid_ntce_no,
            "bid_ntce_ord": bid_ntce_ord,
            "api": "getOpengResultListInfoOpengCompt"
        }
        
        try:
            req = urllib.request.Request(url)
            req.add_header("User-Agent", "Mozilla/5.0")
            with urllib.request.urlopen(req, timeout=30) as response:
                raw_data = response.read().decode('utf-8')
                data = json.loads(raw_data)
        except urllib.error.HTTPError as e:
            error_body = ""
            try:
                error_body = e.read().decode('utf-8')[:300]
            except:
                pass
            debug_info["error"] = f"HTTP {e.code}: {error_body}"
            return {"saved": 0, "debug": debug_info}
        except Exception as e:
            debug_info["error"] = str(e)
            return {"saved": 0, "debug": debug_info}
        
        # 응답 파싱
        items = []
        try:
            response_data = data.get("response", {})
            header = response_data.get("header", {})
            debug_info["result_code"] = header.get("resultCode")
            debug_info["result_msg"] = header.get("resultMsg")
            
            body = response_data.get("body", {})
            total_count = body.get("totalCount", 0)
            debug_info["total_count"] = total_count
            
            item_list = body.get("items", [])
            
            if isinstance(item_list, dict):
                items = item_list.get("item", [])
            elif isinstance(item_list, list):
                items = item_list
                
            if isinstance(items, dict):
                items = [items]
                
            debug_info["items_count"] = len(items)
            
            # 첫 번째 아이템 구조 확인용
            if items:
                debug_info["sample_keys"] = list(items[0].keys())
                
        except Exception as e:
            debug_info["parse_error"] = str(e)
            items = []
        
        if not items:
            return {"saved": 0, "debug": debug_info}
        
        # DB에 저장
        saved_count = 0
        for idx, item in enumerate(items):
            try:
                # 사업자번호 추출
                prtcpt_bizno = (
                    item.get("sucsfbidBznsrgnNo") or
                    item.get("bznsrgnNo") or
                    item.get("prtcptBznsrgnNo")
                )
                
                if not prtcpt_bizno:
                    continue
                
                # 순위 추출
                rank = self._parse_int(item.get("opengRnk") or item.get("rnk")) or (idx + 1)
                
                cursor.execute("""
                    INSERT INTO bid_participants (
                        bid_ntce_no, bid_ntce_ord, bid_clsfc_no,
                        prtcpt_nm, prtcpt_bizno, prtcpt_ceo_nm,
                        bid_amt, bid_rate, rank, is_winner, openg_dt
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (bid_ntce_no, bid_ntce_ord, prtcpt_bizno) DO NOTHING
                """, [
                    bid_ntce_no,
                    bid_ntce_ord,
                    item.get("bidClsfcNo") or bid_clsfc_no,
                    item.get("sucsfbidCorpNm") or item.get("corpNm"),
                    prtcpt_bizno,
                    item.get("sucsfbidCorpCeoNm") or item.get("ceoNm"),
                    self._parse_int(item.get("bidprcAmt")),
                    self._parse_float(item.get("bidprcRt")),
                    rank,
                    rank == 1,
                    item.get("opengDt")
                ])
                saved_count += 1
            except Exception as e:
                if "save_errors" not in debug_info:
                    debug_info["save_errors"] = []
                debug_info["save_errors"].append(str(e)[:100])
                continue
        
        conn.commit()
        return {"saved": saved_count, "debug": debug_info}
    
    def _parse_int(self, val):
        if val is None:
            return None
        try:
            return int(float(str(val).replace(",", "")))
        except:
            return None
    
    def _parse_float(self, val):
        if val is None:
            return None
        try:
            return float(str(val).replace(",", ""))
        except:
            return None
    
    def _send_response(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def _send_error(self, status_code, message):
        self._send_response(status_code, {"success": False, "error": message})
