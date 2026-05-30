// app/api/content/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import { requireRole } from "@/lib/routeHelper";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise add kiya
) {
  const { session, error } = await requireRole(["teacher"]);
  if (error) return error;

  try {
    await dbConnect();

    const { id } = await params;  // ← await karo
    const body = await req.json();

    const content = await Content.findOne({
      _id: id,
      uploadedBy: session!.user.id,
    });

    if (!content) {
      return NextResponse.json(
        { error: "Content not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await Content.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Content updated", content: updated },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise add kiya
) {
  const { session, error } = await requireRole(["teacher", "school-admin"]);
  if (error) return error;

  try {
    await dbConnect();

    const { id } = await params;  // ← await karo

    const filter: any = { _id: id };

    if (session!.user.role === "teacher") {
      filter.uploadedBy = session!.user.id;
    } else {
      filter.schoolId = session!.user.schoolId;
    }

    const content = await Content.findOneAndDelete(filter);

    if (!content) {
      return NextResponse.json(
        { error: "Content not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Content deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}