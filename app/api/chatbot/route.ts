// app/api/chatbot/route.ts

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import ChatHistory from "@/models/ChatHistory";
import { requireRole } from "@/lib/routeHelper";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["student", "teacher"]);
  if (error) return error;

  try {
    await dbConnect();

    const { message, mode } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const schoolId = session!.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 400 }
      );
    }

    // school ke recent notes fetch karo context ke liye
    const recentContent = await Content.find({
      schoolId: schoolId,
      isVisible: true,
      contentType: { $in: ["note", "assignment"] },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title description subject classGrade contentType")
      .lean();

    const contentContext =
      recentContent.length > 0
        ? `Available study material:\n${recentContent
            .map(
              (c) =>
                `- [${c.contentType.toUpperCase()}] ${c.title} | Subject: ${c.subject ?? "General"} | Grade: ${c.classGrade ?? "All"}\n  ${c.description}`
            )
            .join("\n")}`
        : "No study material available yet.";

    // chat history fetch karo
    let chatHistory = await ChatHistory.findOne({
      userId: session!.user.id,
      schoolId: schoolId,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: session!.user.id,
        schoolId: schoolId,
        messages: [],
      });
    }

    const systemPrompts: Record<string, string> = {
      doubt: `You are EduBot, a helpful academic assistant for school students and teachers.
Help students understand concepts and solve doubts clearly.
Use simple language suitable for school students.
Relate answers to the provided school content when relevant.
If no specific content is available, still answer the question helpfully.

${contentContext}`,

      "generate-notes": `You are EduBot, an expert note-making assistant for teachers.
Generate well-structured notes with headings, bullet points, and key takeaways.
Include: Introduction, Key Concepts, Important Points, Summary.

${contentContext}`,

      summarize: `You are EduBot, a summarization assistant.
Summarize content clearly for school students.
Highlight the most important points to remember.

${contentContext}`,
    };

    const activeMode = mode ?? "doubt";
    const systemPrompt = systemPrompts[activeMode] ?? systemPrompts.doubt;

    // last 10 messages history ke liye
    const previousMessages = chatHistory.messages.slice(-10).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Groq API call
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...previousMessages,
        { role: "user", content: message },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content ||
      "Sorry, I could not process that.";

    // history save karo
    chatHistory.messages.push(
      { role: "user", content: message, createdAt: new Date() },
      { role: "assistant", content: assistantMessage, createdAt: new Date() }
    );

    // max 100 messages
    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100);
    }

    await chatHistory.save();

    return NextResponse.json(
      { reply: assistantMessage, mode: activeMode },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Chatbot error:", err?.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const { session, error } = await requireRole(["student", "teacher"]);
  if (error) return error;

  try {
    await dbConnect();

    const schoolId = session!.user.schoolId;

    if (!schoolId) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: session!.user.id,
      schoolId: schoolId,
    }).lean();

    return NextResponse.json(
      { messages: chatHistory?.messages ?? [] },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}