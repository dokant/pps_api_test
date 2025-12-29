import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const from = sp.get("from");
  const to = sp.get("to");
  const days = sp.get("days");

  // 우선순위: from/to 있으면 기간조회, 아니면 days(기본 30)
  if (from && to) {
    const sql = `
      SELECT date, award_count, total_award_amt, avg_rate_vs_bssamt
      FROM pps_bid.daily_award_stats
      WHERE date >= $1::date AND date <= $2::date
      ORDER BY date DESC;
    `;
    const res = await query(sql, [from, to]);
    return NextResponse.json({ success: true, data: res.rows });
  }

  const nDays = Math.min(Math.max(parseInt(days || "30", 10), 1), 365);

  const sql = `
    SELECT date, award_count, total_award_amt, avg_rate_vs_bssamt
    FROM pps_bid.daily_award_stats
    WHERE date >= ((now() AT TIME ZONE 'Asia/Seoul')::date - $1::int)
    ORDER BY date DESC;
  `;
  const res = await query(sql, [nDays]);
  return NextResponse.json({ success: true, data: res.rows });
}
