declare global {
    var __sessions:
        | Map<string, {
            id: string;
            name: string;
            createdAt: Date;
            songs: Array<{
                id: string;
                name: string;
                artist: string;
                albumImage: string;
                votes: number;
                addedBy: string;
                addedAt: Date;
                songLink: string;
            }>;
            removedSongs: Array<{
                id: string;
                removedAt: Date;
            }>;
            voters: Map<string, {
                lastVotedAt: Date;
                songId: string;
            }>;

        }>
        | undefined;
}

export const sessions = globalThis.__sessions ??
    new Map<string, {
        id: string;
        name: string;
        createdAt: Date;
        songs: Array<{
            id: string;
            name: string;
            artist: string;
            albumImage: string;
            votes: number;
            addedBy: string;
            addedAt: Date;
            songLink: string;
        }>;
        removedSongs: Array<{
            id: string;
            removedAt: Date;
        }>;
        voters: Map<string, {
            lastVotedAt: Date;
            songId: string;
        }>;

    }>();


if (process.env.NODE_ENV !== "production") {
    globalThis.__sessions = sessions;
}
