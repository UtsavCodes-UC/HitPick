"use client";

import { useState, useEffect } from "react";

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

interface SongListProps {
  songs: Song[];
  onVote: (songId: string) => void;
  onRemove: (songId: string) => void;
  userId: string;
  userVotes: Record<string, { lastVotedAt: string; songId: string }>;
  voteCooldownTime: number | null;
}

export default function SongList({
  songs,
  onVote,
  onRemove,
  userId,
  userVotes,
  voteCooldownTime,
}: SongListProps) {
  const [cooldownDisplay, setCooldownDisplay] = useState<string>("");

  useEffect(() => {
    if (!voteCooldownTime || voteCooldownTime <= 0) {
      setCooldownDisplay("");
      return;
    }

    const updateCooldown = () => {
      const timeLeft = voteCooldownTime - (Date.now() - Date.now());
      if (timeLeft <= 0) {
        setCooldownDisplay("");
        return;
      }

      const minutes = Math.floor(timeLeft / (60 * 1000));
      const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
      setCooldownDisplay(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [voteCooldownTime]);

  const userLastVote = userVotes[userId];
  const canVote = !voteCooldownTime || voteCooldownTime <= 0;

  function playSong(url:string) {
    const popupFeatures = "top=100,left=40,width=500,height=500"
    window.open(url, 'popup', popupFeatures);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-spotify-green">🎵 Song Queue</h2>
        {!canVote && (
          <div className="text-sm text-yellow-400">
            Next vote in: {cooldownDisplay}
          </div>
        )}
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">
            No songs in the queue yet
          </p>
          <p className="text-gray-500 text-sm">
            Search and add some songs to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {songs.map((song, index) => {
            const hasVotedForThis = userLastVote?.songId === song.id;
            const isTopSong = index === 0;

            return (
              <div
                key={song.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  isTopSong
                    ? "bg-spotify-green/10 border-spotify-green shadow-lg"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`text-lg font-bold ${
                      isTopSong ? "text-spotify-green" : "text-gray-400"
                    }`}
                  >
                    #{index + 1}
                  </div>
                  <img
                    src={song.albumImage}
                    alt="Album cover"
                    className="w-12 h-12 rounded object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium truncate ${
                      isTopSong ? "text-spotify-green" : "text-white"
                    }`}
                  >
                    {song.name}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {song.artist}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div
                      className={`text-lg font-bold ${
                        isTopSong ? "text-spotify-green" : "text-white"
                      }`}
                    >
                      {song.votes}
                    </div>
                    <div className="text-xs text-gray-400">votes</div>
                  </div>
                  
                  <button
                    onClick={() => onVote(song.id)}
                    disabled={!canVote}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      hasVotedForThis
                        ? "bg-spotify-green text-white"
                        : canVote
                        ? "bg-gray-600 hover:bg-gray-500 text-white cursor-pointer"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {hasVotedForThis
                      ? "✓ Voted"
                      : canVote
                      ? "Vote"
                      : "Cooldown"}
                  </button>

                  <button
                    onClick={() => playSong(song.songLink)}
                    className={"px-4 py-2 rounded-lg font-medium transition-all bg-gray-600 hover:bg-gray-500 text-white cursor-pointer"
                    }
                  >  Play Song
                  </button>

                  <button
                    onClick={() => onRemove(song.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                    title="Remove song"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {songs.length > 0 && (
        <div className="mt-4 text-xs text-white text-center">
          Songs are sorted by votes • Removed songs have a 30-seconds cooldown
        </div>
      )}
    </div>
  );
}