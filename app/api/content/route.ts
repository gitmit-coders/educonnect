// app/api/content/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import { requireRole } from "@/lib/routeHelper";

export async function GET(req: NextRequest) {
  const { session, error } = await requireRole([
    "teacher",
    "school-admin",
    "student",
  ]);
  if (error) return error;

  if (!session?.user.schoolId) {
    return NextResponse.json(
      { error: "School ID not found in session" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const grade = searchParams.get("grade");

    const filter: any = {
      schoolId: session.user.schoolId,
    };

    if (session.user.role === "student") {
      filter.isVisible = true;
    }

    if (type) filter.contentType = type;
    if (grade) filter.classGrade = grade;

    const contents = await Content.find(filter)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ contents }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["teacher"]);
  if (error) return error;

  if (!session?.user.schoolId) {
    return NextResponse.json(
      { error: "School ID not found in session" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const body = await req.json();
    const {
      title,
      description,
      fileUrl,
      contentType,
      subject,
      classGrade,
      isVisible,
    } = body;

    if (!title || !description || !contentType) {
      return NextResponse.json(
        { error: "Title, description and contentType are required" },
        { status: 400 }
      );
    }

    if (contentType !== "announcement" && !fileUrl) {
      return NextResponse.json(
        { error: "File URL is required for this content type" },
        { status: 400 }
      );
    }

    const content = await Content.create({
      title,
      description,
      fileUrl: fileUrl ?? null,
      contentType,
      subject: subject ?? null,
      classGrade: classGrade ?? null,
      isVisible: isVisible ?? true,
      schoolId: session.user.schoolId,
      uploadedBy: session.user.id,
    });

    return NextResponse.json(
      { message: "Content uploaded successfully", content },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}