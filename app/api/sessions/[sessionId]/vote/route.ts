import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/sessionModel";

const VOTE_COOLDOWN = 1000 * 60; // 1 minute

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await context.params;

    const session = sessions.get(sessionId);

    if (!session) {
        return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
        );
    }
    const { songId, userId } = await request.json();
    if (!songId || !userId) {
        return NextResponse.json(
            { error: "Missing songId or userId" },
            { status: 400 }
        );
    }

    const userLastVote = session.voters.get(userId);

    if (userLastVote && Date.now() - userLastVote.lastVotedAt.getTime() < VOTE_COOLDOWN) {
        const timeLeft = Math.ceil((VOTE_COOLDOWN - (Date.now() - userLastVote.lastVotedAt.getTime())) / 1000);
        return NextResponse.json(
            { error: `You can vote again in ${timeLeft} seconds` },
            { status: 429 }
        );
    }

    const song = session.songs.find((s) => s.id === songId);
    if (!song) {
        return NextResponse.json(
            { error: "Song not found in session" },
            { status: 404 }
        );
    }

    if (userLastVote && userLastVote.songId !== songId) {
        const previousSong = session.songs.find((s) => s.id === userLastVote.songId);
        if (previousSong) {
            previousSong.votes = Math.max(0, previousSong.votes - 1);
        }
    }

    if (!userLastVote || userLastVote.songId !== songId) {
        song.votes += 1;
        session.voters.set(userId, { songId, lastVotedAt: new Date() });
    }

    return NextResponse.json({
        success: true,
        newVoteCount: song.votes,
        nextVoteTime: new Date(Date.now() + VOTE_COOLDOWN),
    });

}

