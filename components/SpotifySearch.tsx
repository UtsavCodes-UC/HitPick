"use client";

import { useState } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumImage: string;
  songLink: string;
}

interface SpotifySearchProps {
  sessionId: string;
  userId: string;
  onSongAdded: () => void;
}

export default function SpotifySearch({
  sessionId,
  userId,
  onSongAdded,
}: SpotifySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const searchTracks = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/spotify?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.tracks || []);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addSong = async (track: Track) => {
    setAdding(track.id);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/songs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          songId: track.id,
          name: track.name,
          artist: track.artist,
          albumImage: track.albumImage,
          userId,
          songLink: track.songLink
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      onSongAdded();
      // Don't clear results so user can add more songs
    } catch (error) {
      console.error("Failed to add song:", error);
      alert("Failed to add song. Please try again.");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-spotify-green mb-6">
        🔍 Search Songs
      </h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs, artists, or albums..."
          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
          onKeyPress={(e) => e.key === "Enter" && searchTracks()}
        />
        <button
          onClick={searchTracks}
          disabled={loading || !query.trim()}
          className="btn-primary px-6 disabled:opacity-50"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {results.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <img
              src={track.albumImage}
              alt={track.album}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{track.name}</h3>
              <p className="text-gray-400 text-sm truncate">{track.artist}</p>
            </div>

            <button
              onClick={() => addSong(track)}
              disabled={adding === track.id}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
            >
              {adding === track.id ? "Adding..." : "Add"}
            </button>
          </div>
        ))}
      </div>

      {results.length === 0 && query && !loading && (
        <p className="text-gray-400 text-center py-8">
          No results found. Try a different search term.
        </p>
      )}
    </div>
  );
}