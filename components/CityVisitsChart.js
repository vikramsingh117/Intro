"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TestChart() {
  const [range, setRange] = useState("7");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/graph");
        if (!response.ok) {
          throw new Error("Failed to fetch graph data");
        }
        const data = await response.json();
        setRawData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching graph data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------- FILTER FUNCTION ----------
  const filtered = rawData.filter((d) => {
    const today = new Date();
    const date = new Date(d.date);
    const diff = (today - date) / (1000 * 60 * 60 * 24); // days difference
    return diff <= Number(range);
  });

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Visits Timeline</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Visits Timeline</h2>
        <p style={{ color: "red" }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Visits Timeline</h2>

      {/* RANGE BUTTONS */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <button
          onClick={() => setRange("7")}
          style={{
            padding: "6px 12px",
            background: range === "7" ? "#8884d8" : "#ddd",
            color: range === "7" ? "white" : "black",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Last 7 Days
        </button>

        <button
          onClick={() => setRange("30")}
          style={{
            padding: "6px 12px",
            background: range === "30" ? "#8884d8" : "#ddd",
            color: range === "30" ? "white" : "black",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Last 30 Days
        </button>
      </div>

      {/* CHART */}
      {filtered.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filtered}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="visits" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>No data available for the selected range.</p>
      )}
    </div>
  );
}
