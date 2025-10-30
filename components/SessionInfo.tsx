"use client";

import { useState } from "react";

interface Song {
    id: string;
    name: string;
    artist: string;
    albumImage: string;
    votes: number;
    addedBy: string;
    addedAt: string;
    songLink: string;
}

interface Session {
    id: string;
    name: string;
    createdAt: string;
    songs: Song[];
    userVotes: Record<string, { lastVotedAt: string; songId: string; }>;
}

interface SessionInfoProps {
    sessionData: Session;
    sessionId: string;
    voteCoolDownTime: number | null;
}

export default function SessionInfo({ 
    sessionData,
    sessionId,
    voteCoolDownTime,
}: SessionInfoProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = sessionId ? `${window.location.origin}/sessions/${sessionId}` : "";

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold text-spotify-green mb-2">
                {sessionData.name}
            </h1>
            <div className="text-gray-400 text-sm space-y-1">
                <p>Created: {formatDate(sessionData.createdAt)}</p>
                <p>Songs in queue: {sessionData.songs.length}</p>
                {voteCoolDownTime && voteCoolDownTime > 0 && (
                <p className="text-yellow-400">
                    ⏱️ You can vote again in{" "}
                    {Math.ceil(voteCoolDownTime / (60 * 1000))} minutes
                </p>
                )}
            </div>
            </div>

            <div className="flex flex-col gap-3">
            <button
                onClick={copyToClipboard}
                className={`btn-primary transition-all ${
                copied ? "bg-green-600" : "text-xl text-amber-200"
                }`}
            >
                {copied ? "✓ Copied!" : "📋 Share Session"}
            </button>

            <div className="text-s text-white">
                Share this URL with others to let them Join and Vote
            </div>
            </div>
        </div>

        {/* Session Rules */}
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-3">
            📋 Session Rules
            </h3>
            <ul className="text-sm text-gray-300 space-y-2">
            <li>• Users can vote once every 5 minutes</li>
            <li>• Songs are sorted by vote count in real-time</li>
            <li>• Removed songs cannot be re-added for 20 minutes</li>
            <li>• Anyone with the link can join and participate</li>
            </ul>
        </div>
        </div>
    );
}