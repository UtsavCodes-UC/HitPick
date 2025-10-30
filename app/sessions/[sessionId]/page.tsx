"use client";

import React, { use, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { v4 as uuid } from "uuid";
import SpotifySearch from "@/components/SpotifySearch";
import SongList from "@/components/SongList";
import SessionInfo from "@/components/SessionInfo";

export default function SessionPage() {
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

    const vote_coolDown_time = 0.5 * 60 * 1000;
    const params = useParams();
    const sessionId = params.sessionId as string;
    const [sessionData, setSessionData] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            let storedUserId = localStorage.getItem('userId');
            if (!storedUserId) {
                storedUserId = uuid();
                localStorage.setItem('userId', storedUserId);
            }
            return storedUserId;
        }
        return uuid();
    });

    const updateData = async () => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}`, { method: 'GET' });
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await res.json();
            setSessionData(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/sessions/${sessionId}`, { method: 'GET' });
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await res.json();
                setSessionData(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
        const intervalId = setInterval(fetchData, 1000); // Refresh every 1 seconds
        return () => clearInterval(intervalId);
    }, [sessionId]);

    const handleSongAdded = async () => {
        await updateData();
    }

    const handleVote = async (songId: string) => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ songId, userId }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
                return;
            }

            await updateData();
        } catch (err) {
            console.error("Error voting:", err);
        }
    }

    const handleRemoveSong = async (songId: string) => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/songs/?songId=${songId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errorData = await res.json();
                alert(`Error: ${errorData.error}`);
                return;
            }
            await updateData();
        } catch (err) {
            console.error("Error removing song:", err);
        }
    }

    const getVoteCooldownTime = () => {
        if (!sessionData?.userVotes[userId]) return null;

        const lastVoteTime = new Date(
            sessionData.userVotes[userId].lastVotedAt
        ).getTime();
        const cooldownEnd = lastVoteTime + vote_coolDown_time; // 1 minutes
        const timeLeft = cooldownEnd - Date.now();

        return timeLeft > 0 ? timeLeft : null;
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="w-full max-w-3xl animate-pulse">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-4 items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                                <div className="w-14 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!sessionData) return null;

    return (
        <div className="px-4 py-6">
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div className="min-h-screen bg-gradient-to-br from-spotify-black via-spotify-dark to-gray-900">
                <div className="container mx-auto px-4">
                    <SessionInfo
                        sessionData={sessionData}
                        sessionId={sessionId}
                        voteCoolDownTime={getVoteCooldownTime()}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        <div>
                            <SpotifySearch
                                sessionId={sessionId}
                                userId={userId}
                                onSongAdded={handleSongAdded}
                            />
                        </div>

                        <div>
                            <SongList
                                songs={sessionData.songs}
                                onVote={handleVote}
                                onRemove={handleRemoveSong}
                                userId={userId}
                                userVotes={sessionData.userVotes}
                                voteCooldownTime={getVoteCooldownTime()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}