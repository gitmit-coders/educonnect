// app/api/admin/schools/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import School from "@/models/School";
import User from "@/models/User";
import { requireRole } from "@/lib/routeHelper";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise add kiya
) {
  const { session, error } = await requireRole(["master-admin"]);
  if (error) return error;

  try {
    await dbConnect();

    const { id } = await params;  // ← await karo
    const { action } = await req.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const school = await School.findById(id);
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    if (action === "approve") {
      school.isApproved = true;
      school.approvedBy = session!.user.id as any;
      await school.save();

      await User.findOneAndUpdate(
        { schoolId: school._id, role: "school-admin" },
        { isApproved: true }
      );

      return NextResponse.json(
        { message: "School approved successfully" },
        { status: 200 }
      );
    }

    if (action === "reject") {
      await User.findOneAndDelete({ schoolId: school._id, role: "school-admin" });
      await School.findByIdAndDelete(id);

      return NextResponse.json(
        { message: "School rejected and removed" },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}