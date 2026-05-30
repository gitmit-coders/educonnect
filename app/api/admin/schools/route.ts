// app/api/admin/schools/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import School from "@/models/School";
import { requireRole } from "@/lib/routeHelper";

// GET /api/admin/schools?status=pending  OR  ?status=approved
export async function GET(req: Request) {
  const { session, error } = await requireRole(["master-admin"]);
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "pending";

    const isApproved = status === "approved";

    const schools = await School.find({ isApproved })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ schools }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}