"use client"

export default function Sessions() {
    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/sessions', {method: 'GET'});
            if (!res.ok) {
                throw new Error("Cannot Get SessionList");
            }
            const data = await res.json();
            console.log(data);
        } catch(err) {
            console.log(err);
        }
    }
    return (
        <div>
            <div>Session List: </div>
            <button
                onClick={() => fetchSessions()}
            >Get sessions</button>
            
        </div>
    )
}