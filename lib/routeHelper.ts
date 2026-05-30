// lib/routeHelper.ts

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return await getServerSession(authOptions);
}

// role check karo — unauthorized ho toh error return karo
export async function requireRole(allowedRoles: string[]) {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  if (!allowedRoles.includes(session.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Access denied" }, { status: 403 }),
    };
  }

  return { session, error: null };
}