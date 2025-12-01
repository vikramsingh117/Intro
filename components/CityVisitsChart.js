"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from "recharts";
import styles from "../styles/CityVisitsChart.module.css";

export default function TestChart() {
  const [range, setRange] = useState("7");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [cityData, setCityData] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityError, setCityError] = useState(null);
  const [isClicked, setIsClicked] = useState(false);

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

  // Handle point click on line chart
  const handlePointClick = async (state) => {
    if (!state || !state.activeLabel) return;
    const date = state.activeLabel; // X-axis label, e.g. "2025-11-30"

    try {
      setIsClicked(true);
      setSelectedDate(date);
      setCityLoading(true);
      setCityError(null);
      setCityData([]);

      const response = await fetch(
        `/api/graph?breakdown=city&date=${encodeURIComponent(date)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch city breakdown");
      }
      const data = await response.json();
      setCityData(data);
    } catch (err) {
      console.error("Error fetching city breakdown:", err);
      setCityError(err.message);
    } finally {
      setCityLoading(false);
      setTimeout(() => {
          setSelectedDate(null);
          setCityData([]);
          setCityLoading(false);
          setCityError(null);
          setIsClicked(false);
      }, 5000);
    }
  };

  return (
    <div className={styles.chartContainer}>
      {/* <h2 className={styles.chartTitle}>Visits Timeline</h2> */}

      {loading && <p className={styles.loadingText}>Loading...</p>}
      {error && <p className={styles.errorText}>Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* RANGE BUTTONS */}
          

          {/* CHARTS CONTAINER - SIDE BY SIDE */}
          {filtered.length > 0 ? (
            <div className={styles.chartsWrapper}>
              {/* LINE CHART */}
              <div className={styles.lineChartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filtered} onClick={handlePointClick}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="visits" stroke="#834bbe" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* CITY BAR CHART FOR SELECTED DATE - SIDE BY SIDE */}
              {selectedDate && (
                <div className={styles.barChartContainer}>

                  {cityLoading && (
                    <p className={styles.loadingText}>Loading city data...</p>
                  )}
                  {cityError && (
                    <p className={styles.errorText}>Error: {cityError}</p>
                  )}
                  {!cityLoading && !cityError && cityData.length === 0 && (
                    <p className={styles.noDataText}>
                      No city data available for this date.
                    </p>
                  )}
                  {!cityLoading && !cityError && cityData.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="visits">
                          {cityData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`}
                              fill={entry.isBot ? "#ff4d4f" : "#834bbe"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
              
            </div>
          ) : (
            <p className={styles.noDataText}>No data available for the selected range.</p>
          )}
          <div className={styles.rangeButtons}>
            <button
              onClick={() => setRange("7")}
              className={`${styles.rangeButton} ${
                range === "7" ? styles.rangeButtonActive : ""
              }`}
            >
              Last 7 Days
            </button>

            <button
              onClick={() => setRange("30")}
              className={`${styles.rangeButton} ${
                range === "30" ? styles.rangeButtonActive : ""
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </>
      )}
    </div>
  );
}
