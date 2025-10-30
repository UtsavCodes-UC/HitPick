import { NextResponse, NextRequest } from "next/server";
import { sessions } from "@/lib/sessionModel";
import { use } from "react";

const SONG_REMOVAL_COOLDOWN = 1000 * 60 * 5; // 5 minutes

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
    
    const {songId, name, artist, albumImage, userId, songLink} = await request.json();

    if (!songId || !name || !albumImage || !userId) {
        console.log(songId, name, artist, albumImage, userId, songLink);
        return NextResponse.json(
            { error: "Missing song information" },
            { status: 400 }
        );
    }

    const recentlyRemovedSong = session.removedSongs.find(
        (removedSong) => removedSong.id === songId && 
        Date.now() - removedSong.removedAt.getTime() < SONG_REMOVAL_COOLDOWN
    );

    if (recentlyRemovedSong) {
        const timeLeft = Math.ceil((SONG_REMOVAL_COOLDOWN - (Date.now() - recentlyRemovedSong.removedAt.getTime())) / (1000*60));
        return NextResponse.json(
            { error: `This song was recently removed. Please wait ${timeLeft} minutes before adding it again.` },
            { status: 400 }
        );
    }

    const existingSong = session.songs.find(song => song.id === songId);
    if (existingSong) {
        return NextResponse.json(
            { error: "Song already exists in the session" },
            { status: 400 }
        );
    }

    const newSong = {
        id: songId,
        name,
        artist,
        albumImage,
        votes: 0,
        addedBy: userId, // In a real app, you'd get this from the authenticated user
        addedAt: new Date(),
        songLink
    };

    session.songs.push(newSong);

    return NextResponse.json(newSong, { status: 201 });
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await context.params;

    const url = new URL(request.url);
    const songId = url.searchParams.get("songId");

    if (!songId) {
        return NextResponse.json(
            { error: "Missing songId parameter" },
            { status: 400 }
        );
    }

    const session = sessions.get(sessionId);

    if (!session) {
        return NextResponse.json(
            { error: "Session not found" },
            { status: 404 }
        );
    }

    const songIndex = session.songs.findIndex(song => song.id === songId);

    if (songIndex === -1) {
        return NextResponse.json(
            { error: "Song not found in session" },
            { status: 404 }
        );
    }

    const [removedSong] = session.songs.splice(songIndex, 1);
    session.removedSongs.push({ 
        id: removedSong.id,
         removedAt: new Date() 
    });

    session.removedSongs = session.removedSongs.filter(
        rs => Date.now() - rs.removedAt.getTime() < SONG_REMOVAL_COOLDOWN
    ); // Clean up old removed songs
    return NextResponse.json({ message: "Song removed successfully" });
}