// app/api/auth/student-register/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import School from "@/models/School";

// POST /api/auth/student-register
// Student apne schoolCode se register karega
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, schoolCode } = await req.json();

    if (!name || !email || !password || !schoolCode) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // school dhundo by schoolCode
    const school = await School.findOne({
      schoolCode: schoolCode.toUpperCase(),
      isApproved: true,  // sirf approved school mein register ho sakta hai
    });

    if (!school) {
      return NextResponse.json(
        { error: "Invalid or unapproved school code" },
        { status: 404 }
      );
    }

    // email already exists?
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      schoolId: school._id,
      isApproved: false, // school-admin approve karega
    });

    return NextResponse.json(
      { message: "Registration successful! Waiting for school admin approval." },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}