// app/api/chatbot/route.ts

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/dbConnect";
import Content from "@/models/Content";
import ChatHistory from "@/models/ChatHistory";
import { requireRole } from "@/lib/routeHelper";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["student", "teacher"]);
  if (error) return error;

  if (!session?.user.schoolId) {
    return NextResponse.json(
      { error: "School ID not found in session" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const { message, mode } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const recentContent = await Content.find({
      schoolId: session.user.schoolId,
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
              (c: any) =>
                `- [${c.contentType.toUpperCase()}] ${c.title} | Subject: ${
                  c.subject ?? "General"
                } | Grade: ${c.classGrade ?? "All"}\n  ${c.description}`
            )
            .join("\n")}`
        : "No study material available yet.";

    let chatHistory = await ChatHistory.findOne({
      userId: session.user.id,
      schoolId: session.user.schoolId,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: session.user.id,
        schoolId: session.user.schoolId,
        messages: [],
      });
    }

    const systemPrompts: Record<string, string> = {
      doubt: `You are EduBot, a helpful academic assistant for school students and teachers.
Help students understand concepts and solve doubts clearly.
Use simple language suitable for school students.
Relate answers to the provided school content when relevant.

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

    const previousMessages = chatHistory.messages.slice(-10).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: previousMessages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessage(message);
    const assistantMessage = result.response.text();

    chatHistory.messages.push(
      { role: "user", content: message, createdAt: new Date() },
      { role: "assistant", content: assistantMessage, createdAt: new Date() }
    );

    if (chatHistory.messages.length > 100) {
      chatHistory.messages = chatHistory.messages.slice(-100);
    }

    await chatHistory.save();

    return NextResponse.json(
      { reply: assistantMessage, mode: activeMode },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Chatbot error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const { session, error } = await requireRole(["student", "teacher"]);
  if (error) return error;

  if (!session?.user.schoolId) {
    return NextResponse.json(
      { error: "School ID not found in session" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const chatHistory = await ChatHistory.findOne({
      userId: session.user.id,
      schoolId: session.user.schoolId,
    }).lean();

    return NextResponse.json(
      { messages: chatHistory?.messages ?? [] },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}