import { NextRequest, NextResponse } from "next/server";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

async function fetchAccessToken(): Promise<string> {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error("Spotify client ID or secret is not set in environment variables");
    }

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch access token from Spotify");
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in - 600) * 1000;
        if (!accessToken) {
            throw new Error("No access token received from Spotify");
        }
        return accessToken;
    } catch (error) {
        throw new Error("Error fetching access token: " + (error instanceof Error ? error.message : String(error)));
    }
}

async function searchTracks(query: string): Promise<any[]> {
    try {
        const token = await fetchAccessToken();
        const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error("Failed to search tracks on Spotify");
        }

        const data = await res.json();
        return data.tracks.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            artists: item.artists.map((artist: any) => artist.name).join(", "),
            album: item.album.name,
            previewUrl: item.preview_url,
            songLink: item.external_urls.spotify,
            albumImage: item.album.images[0]?.url || null,
            durationMs: item.duration_ms,
        }));
    } catch (error) {
        throw new Error("Error searching tracks: " + (error instanceof Error ? error.message : String(error)));
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
        return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    // Check if Spotify credentials are configured
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.warn("Spotify credentials not configured, using mock data");

        // Fallback to mock data if credentials not set
        const mockResults = [
        {
            id: "mock_track1",
            name: "Blinding Lights",
            artist: "The Weeknd",
            album: "After Hours",
            albumImage:
            "https://i.scdn.co/image/ab67616d0000b273c06f0e8b33d2d5bb0f36c8de",
            preview_url: null,
            external_url: "https://open.spotify.com/track/0VjIjW4GlULA64jZtv6X1N",
            duration_ms: 200040,
        },
        {
            id: "mock_track2",
            name: "Watermelon Sugar",
            artist: "Harry Styles",
            album: "Fine Line",
            albumImage:
            "https://i.scdn.co/image/ab67616d0000b273d9985092cd88399b68fe3f85",
            preview_url: null,
            external_url: "https://open.spotify.com/track/6UelLqGlWMcVH1E5c4H7lY",
            duration_ms: 174000,
        },
        {
            id: "mock_track3",
            name: "Levitating",
            artist: "Dua Lipa",
            album: "Future Nostalgia",
            albumImage:
            "https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856",
            preview_url: null,
            external_url: "https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9",
            duration_ms: 203064,
        },
        ];

        const filteredResults = mockResults.filter(
        (track) =>
            track.name.toLowerCase().includes(query.toLowerCase()) ||
            track.artist.toLowerCase().includes(query.toLowerCase()) ||
            track.album.toLowerCase().includes(query.toLowerCase())
        );

        return NextResponse.json({ tracks: filteredResults });
    }


    try {
        const tracks = await searchTracks(query);
        return NextResponse.json({ tracks });
    } catch(err) {
        return NextResponse.json({error: err});
    }
}