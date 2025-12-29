import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  const sql = `
    SELECT
      ofl.openg_rslt_div_nm AS failing_div,
      ofl.nobid_rsn,
      ofl.source_fetched_at AS failing_fetched_at,

      orb.openg_rslt_div_nm AS rebid_div,
      orb.rbid_rsn,
      orb.bid_clse_dt,
      orb.openg_dt,
      orb.cmmn_spldmd_agrmnt_clse_dt,
      orb.source_fetched_at AS rebid_fetched_at
    FROM pps_bid.bid_notice bn
    LEFT JOIN pps_bid.opening_failing ofl ON ofl.bid_notice_id = bn.bid_notice_id
    LEFT JOIN pps_bid.opening_rebid orb ON orb.bid_notice_id = bn.bid_notice_id
    WHERE bn.bid_notice_id = $1::bigint;
  `;

  const res = await query(sql, [id]);
  if (res.rows.length === 0) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: res.rows[0] });
}
