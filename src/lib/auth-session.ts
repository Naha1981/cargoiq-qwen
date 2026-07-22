import { db } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

export interface Session {
  userId: string;
  tenantId: string;
  email: string;
  name: string | null;
  role: string;
}

export async function getSession(): Promise<Session | null> {
  if (!db) return null;

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("ciq_session")?.value;
    if (!sessionToken) return null;

    const session = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionToken),
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.userId),
    });

    if (!user) return null;

    return {
      userId: user.id,
      tenantId: session.tenantId,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch {
    return null;
  }
}
