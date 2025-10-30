import { NextResponse, NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { sessions } from "@/lib/sessionModel";

export async function POST(request: NextRequest) {
    const { name } = await request.json();
    const sessionId = uuid();

    if (name.trim().length === 0) {
        return NextResponse.json(
            {error: "Session name cannot be empty" }, 
            {status: 400}
        );
    }

    const session = {
        id: sessionId,
        name,
        createdAt: new Date(),
        songs: [],
        removedSongs: [],
        voters: new Map(),
    }

    sessions.set(sessionId, session);

    return NextResponse.json(session);
}


export async function GET(request: NextRequest) {
    const sessionList = Array.from(sessions.values()).map(session => ({
        id: session.id,
        name: session.name,
        createdAt: session.createdAt,
        songsCount: session.songs.length,
    }));

    return NextResponse.json(sessionList);
}