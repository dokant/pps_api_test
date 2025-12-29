import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  const sp = req.nextUrl.searchParams;
  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "200", 10), 1), 500);

  const sql = `
    SELECT
      compno_rsrvtn_prce_sno,
      plnprc,
      bssamt,
      tot_rsrvtn_prce_num,
      drwt_yn,
      drwt_num,
      rl_openg_dt,
      compno_rsrvtn_prce_mkng_dt,
      inpt_dt,
      prearng_prce_purcnstcst,
      source_operation,
      source_fetched_at
    FROM pps_bid.reserve_price_detail
    WHERE bid_notice_id = $1::bigint
    ORDER BY compno_rsrvtn_prce_sno
    LIMIT $2::int;
  `;

  const res = await query(sql, [id, limit]);
  return NextResponse.json({ success: true, data: res.rows });
}
