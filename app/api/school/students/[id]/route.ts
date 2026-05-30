// app/api/school/students/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireRole } from "@/lib/routeHelper";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise add kiya
) {
  const { session, error } = await requireRole(["school-admin"]);
  if (error) return error;

  try {
    await dbConnect();

    const { id } = await params;  // ← await karo
    const { action } = await req.json();

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const student = await User.findOne({
      _id: id,
      schoolId: session!.user.schoolId,
      role: "student",
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (action === "approve") {
      student.isApproved = true;
      await student.save();
      return NextResponse.json({ message: "Student approved" }, { status: 200 });
    }

    if (action === "reject") {
      await User.findByIdAndDelete(id);
      return NextResponse.json(
        { message: "Student rejected and removed" },
        { status: 200 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}