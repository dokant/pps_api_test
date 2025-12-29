import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  const sql = `SELECT * FROM pps_bid.v_notice_header WHERE bid_notice_id = $1::bigint;`;
  const res = await query(sql, [id]);

  if (res.rows.length === 0) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: res.rows[0] });
}
