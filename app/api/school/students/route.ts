import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireRole } from "@/lib/routeHelper";

export async function GET(req: Request) {
  const { session, error } = await requireRole(["school-admin"]);
  if (error) return error;

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "pending";
    const isApproved = status === "approved";

    const students = await User.find({
      schoolId: session!.user.schoolId,
      role: "student",
      isApproved,
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ students }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}