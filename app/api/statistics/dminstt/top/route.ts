import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const date = sp.get("date");
  const from = sp.get("from");
  const to = sp.get("to");
  const limit = Math.min(Math.max(parseInt(sp.get("limit") || "50", 10), 1), 200);

  if (date) {
    const sql = `
      SELECT date, dminstt_nm, award_count, total_award_amt, avg_rate_vs_bssamt
      FROM pps_bid.daily_award_stats_by_dminstt
      WHERE date = $1::date
      ORDER BY award_count DESC
      LIMIT $2::int;
    `;
    const res = await query(sql, [date, limit]);
    return NextResponse.json({ success: true, data: res.rows });
  }

  if (from && to) {
    const sql = `
      SELECT
        dminstt_nm,
        SUM(award_count)::bigint AS award_count,
        SUM(total_award_amt)::numeric AS total_award_amt,
        AVG(avg_rate_vs_bssamt)::numeric AS avg_rate_vs_bssamt
      FROM pps_bid.daily_award_stats_by_dminstt
      WHERE date >= $1::date AND date <= $2::date
      GROUP BY dminstt_nm
      ORDER BY award_count DESC
      LIMIT $3::int;
    `;
    const res = await query(sql, [from, to, limit]);
    return NextResponse.json({ success: true, data: res.rows });
  }

  return NextResponse.json(
    { success: false, error: "Provide either ?date=YYYY-MM-DD or ?from=...&to=..." },
    { status: 400 }
  );
}
