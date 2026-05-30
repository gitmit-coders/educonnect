// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import School from "@/models/School";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, email, password, schoolName, schoolCode, phone, address } = body;

    // basic validation
    if (!name || !email || !password || !schoolName || !schoolCode || !phone || !address) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // check if school code already exists
    const existingSchool = await School.findOne({ schoolCode: schoolCode.toUpperCase() });
    if (existingSchool) {
      return NextResponse.json(
        { error: "School code already taken" },
        { status: 409 }
      );
    }

    // create school (pending approval)
    const school = await School.create({
      schoolName,
      schoolCode,
      email,
      phone,
      address,
      isApproved: false,
    });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create school-admin user (also pending approval)
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "school-admin",
      schoolId: school._id,
      isApproved: false,
    });

    return NextResponse.json(
      { message: "Registration successful! Waiting for master admin approval." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}