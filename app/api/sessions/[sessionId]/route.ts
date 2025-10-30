import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/sessionModel";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Sort songs by votes (descending)
  const sortedSongs = [...session.songs].sort((a, b) => b.votes - a.votes);

  return NextResponse.json({
    ...session,
    songs: sortedSongs,
    userVotes: Object.fromEntries(session.voters),
  });
}