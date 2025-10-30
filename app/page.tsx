"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {

  const joinSession = () => {
    router.push('/sessions');
  }
 
  const createSession = async () => {
    if (sessionName.trim().length === 0) {
      alert("Session name cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: sessionName}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        setIsLoading(false);
        return;
      }
      try {
        const { id } = await response.json();
        if (id) {
          router.push(`/sessions/${id}`);
        } else {
          alert("Error: Invalid response from server");
          setIsLoading(false);
        }
      } catch (err) {
        alert("Error: Unable to parse server response");
        setIsLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const router = useRouter();
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-spotify-black via-spotify-dark to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-spotify-green mb-4">
              🎵 Spotify Music Selector
            </h1>
            <p className="text-gray-300">
              Create collaborative playlists where everyone can vote for their
              favorite songs
            </p>
          </div>

          <div className="card space-y-6">
            <div>
              <label
                htmlFor="sessionName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Session Display Name
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spotify-green focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && createSession()}
              />
            </div>

            <button
              onClick={createSession}
              disabled={!sessionName.trim() || isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Session"}
            </button>

            <button
              onClick={joinSession}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Session
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-400">
            <p>✨ Features:</p>
            <ul className="mt-2 space-y-1">
              <li>• Real-time voting system</li>
              <li>• Spotify integration</li>
              <li>• Vote cooldown (5 minutes)</li>
              <li>• Song removal cooldown (20 minutes)</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
