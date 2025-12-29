import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "200", 10), 1), 500);

  // cursor: 마지막으로 받은 (openg_rank, prcbdr_bizno)
  const cursorRankRaw = sp.get("cursor_rank"); // e.g. "3"
  const cursorBizno = sp.get("cursor_bizno");  // e.g. "1234567890"

  // openg_rank는 text라서 int 캐스팅이 필요함. 숫자 아닌 값은 NULL 처리.
  const baseSelect = `
    SELECT
      openg_rank,
      prcbdr_bizno,
      openg_rslt_div_nm,
      prcbdr_nm,
      prcbdr_ceo_nm,
      bidprc_amt,
      bidprcrt,
      rmrk,
      cnstty_accot_bid_amt_url,
      drwt_no1,
      drwt_no2,
      bidprc_dt,
      bid_prce_evl_val,
      tech_evl_natur_val,
      tech_evl_val,
      total_evl_amt_val,
      source_operation,
      source_fetched_at
    FROM pps_bid.opening_completed_rank
    WHERE bid_notice_id = $1::bigint
  `;

  // 첫 페이지
  if (!cursorRankRaw || !cursorBizno) {
    const sql = `
      ${baseSelect}
      ORDER BY
        CASE WHEN openg_rank ~ '^[0-9]+$' THEN openg_rank::int ELSE 2147483647 END,
        prcbdr_bizno
      LIMIT $2::int;
    `;
    const res = await query(sql, [id, limit]);
    return NextResponse.json({
      success: true,
      data: res.rows,
      next_cursor: res.rows.length
        ? { cursor_rank: res.rows[res.rows.length - 1].openg_rank, cursor_bizno: res.rows[res.rows.length - 1].prcbdr_bizno }
        : null,
    });
  }

  // 다음 페이지
  const cursorRank = parseInt(cursorRankRaw, 10);
  if (!Number.isFinite(cursorRank)) {
    return NextResponse.json({ success: false, error: "Invalid cursor_rank" }, { status: 400 });
  }

  const sql = `
    ${baseSelect}
      AND (
        (openg_rank ~ '^[0-9]+$' AND openg_rank::int > $3::int)
        OR (openg_rank ~ '^[0-9]+$' AND openg_rank::int = $3::int AND prcbdr_bizno > $4)
      )
    ORDER BY
      CASE WHEN openg_rank ~ '^[0-9]+$' THEN openg_rank::int ELSE 2147483647 END,
      prcbdr_bizno
    LIMIT $2::int;
  `;

  const res = await query(sql, [id, limit, cursorRank, cursorBizno]);

  return NextResponse.json({
    success: true,
    data: res.rows,
    next_cursor: res.rows.length
      ? { cursor_rank: res.rows[res.rows.length - 1].openg_rank, cursor_bizno: res.rows[res.rows.length - 1].prcbdr_bizno }
      : null,
  });
}
