import React, { useState, useEffect, useMemo } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function Dashboard({ darkMode, setScreen }) {
  
  const [user, setUser] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterScore, setFilterScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
  // 🔐 Fetch Dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setScreen("login");
    fetch(`${API_URL}/dashboard`, {
      headers: {Authorization: "Bearer " + localStorage.getItem("token"), },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          setScreen("login");
          return null;
        }
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setUser(data.user);
        setRecentQuizzes(data.recent_quizzes || []);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [API_URL, setScreen]);
  // 🔄 Auto Refresh
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setRefreshing(true);
      fetch(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) return;
          return res.json();
        })
        .then((data) => {
          if (data) setRecentQuizzes(data.recent_quizzes || []);
        })
        .finally(() => setRefreshing(false));
    }, 10000);
    return () => clearInterval(interval);
  }, [API_URL]);
  const logout = () => {
    localStorage.removeItem("token");
    setScreen("login");
  };
  // 📊 Stats
  const stats = useMemo(() => {
    const total = recentQuizzes.length;
    const scores = recentQuizzes.map((q) =>
      q.total ? (q.score / q.total) * 100 : 0
    );
    const avg = total ? scores.reduce((a, b) => a + b, 0) / total : 0;
    const highest = Math.max(...scores, 0);
    return { total, avg, highest };
  }, [recentQuizzes]);
  // Weak quizzes
  const weakQuizzes = recentQuizzes.filter(
    (q) => (q.total ? q.score / q.total : 0) < 0.5
  );
  // 🔍 Filter
  const filtered = useMemo(() => {
    return recentQuizzes
      .filter((q) =>
        
        (q.title || "").toLowerCase().includes(search.toLowerCase())
      )
      .filter(
        (q) => (q.total ? (q.score / q.total) * 100 : 0) >= filterScore
      );
  }, [recentQuizzes, search, filterScore]);
  // 📈 Chart Data
  const chartData = recentQuizzes.map((q) => ({
     name: `Quiz ${q.id}`
      ? new Date(q.date).toLocaleDateString()
      : "Quiz",
    score: q.total ? (q.score / q.total) * 100 : 0,
  }));
  // 🔄 Loading
  if (loading) {
    return (
      <div className="min-h-screen p-6 animate-pulse">
        <div className="h-10 bg-gray-300 w-1/3 mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-300 rounded" />
          ))}
        </div>
      </div>
    );
  }
  if (error)
    return <div className="text-center text-red-500">{error}</div>;
  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🚀 Smart Dashboard</h1>
        <div className="flex gap-3">
          <button onClick={() => setScreen("/")}>🏠</button>
          <button onClick={logout}>🔐</button>
        </div>
      </div>
      {/* USER */}
      <div
        className={`p-5 rounded-xl shadow mb-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-lg">Welcome {user?.name}</h2>
        <p className="text-gray-500">{user?.email}</p>
      </div>
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Quizzes", value: stats.total },
          { label: "Average Score", value: `${stats.avg.toFixed(0)}%` },
          { label: "Highest Score", value: `${stats.highest.toFixed(0)}%` },
        ].map((item, i) => (
          <div
            key={i}
            className={`p-5 rounded-xl shadow ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {item.label}
            <h2 className="text-2xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>
      {/* GRAPH */}
      <div
        className={`p-5 rounded-xl shadow mb-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="mb-3 font-semibold">Performance Analytics</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v.toFixed(0)}%`} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                fill="#c7d2fe"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p>No data for analytics</p>
        )}
      </div>
      {/* AI INSIGHT */}
      <div className="bg-blue-100 p-4 rounded-xl mb-6">
        {weakQuizzes.length > 0 ? (
          <p>
            ⚠️ Focus on:{" "}
            <b>
              {weakQuizzes
                .map((q) => q.title)
                .slice(0, 2)
                .join(", ")}
            </b>
          </p>
        ) : (
          <p>🔥 Excellent performance trend!</p>
        )}
      </div>
      {/* SEARCH */}
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 w-full border rounded"
        />
        <input
          type="number"
          placeholder="Min %"
          onChange={(e) => setFilterScore(Number(e.target.value))}
          className="p-2 border rounded"
        />
      </div>
      {/* LIST */}
      <div
        className={`p-5 rounded-xl shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {filtered.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No quizzes found</p>
            </div>
            
        ) : (
          filtered.map((q) => (
            <div
              key={q.id || q.title}
              onClick={() => {setScreen("quiz");}}
              className="flex justify-between py-2 border-b cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <span>{q.title}</span>
              <span>
                {q.score}/{q.total}
              </span>
            </div>
          ))
        )}
        <div className="text-center mt-4">
        <button
              onClick={() => setScreen("setup")}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Create New Quiz
            </button>
          </div>
      </div>
      {/* REFRESH INDICATOR */}
      {refreshing && (
        <p className="text-sm mt-2 text-gray-500">Updating...</p>
      )}
    </div>
  );
}