// app/api/school/teachers/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireRole } from "@/lib/routeHelper";

// GET /api/school/teachers  → apne school ke saare teachers
export async function GET() {
  const { session, error } = await requireRole(["school-admin"]);
  if (error) return error;

  try {
    await dbConnect();

    const teachers = await User.find({
      schoolId: session!.user.schoolId,
      role: "teacher",
    })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ teachers }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/school/teachers  → naya teacher add karo
export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["school-admin"]);
  if (error) return error;

  try {
    await dbConnect();

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const teacher = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "teacher",
      schoolId: session!.user.schoolId,
      isApproved: true, // school-admin directly approve karta hai teacher ko
    });

    const { password: _, ...teacherData } = teacher.toObject();

    return NextResponse.json(
      { message: "Teacher added successfully", teacher: teacherData },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}