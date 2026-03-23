import React, { useState } from "react";

export default function Login({ setScreen, darkMode, setDarkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setScreen("dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch {
      setError("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-md sticky top-0 z-50">

  {/* LOGO (Home) */}
  <h1
    onClick={() => setScreen("home")}
    className="text-xl font-bold text-gray-800 dark:text-white cursor-pointer hover:opacity-80 transition"
  >
    🚀 QuizAI
  </h1>

  <div className="flex gap-4 items-center">

    {/* Home link */}
    <button
      onClick={() => setScreen("home")}
      className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
    >
      Home
    </button>

    

            {/* Dashboard if logged in */}
            {token && (
              <button
                onClick={() => setScreen("dashboard")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Dashboard
              </button>
            )}

            {/* Only show Signup (no Login button here) */}
            {!token && (
              <button
                onClick={() => setScreen("signup")}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Signup
              </button>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 transition"
            >
              {darkMode ? "☀" : "🌙"}
            </button>
          </div>
        </nav>

        {/* LOGIN SECTION */}
        <div className="flex items-center justify-center px-6 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border border-white/20 shadow-2xl transition">

            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
              🔐 Welcome Back
            </h2>

            {error && (
              <div className="bg-red-100 text-red-600 dark:bg-red-200 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">

              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-xl border bg-white/70 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl border bg-white/70 dark:bg-gray-700 dark:text-white dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 transition"
              >
                {loading ? "⏳ Logging in..." : "Login"}
              </button>

            </form>

            <p className="text-center text-sm mt-6 text-gray-700 dark:text-gray-300">
              Don't have an account?{" "}
              <span
                onClick={() => setScreen("signup")}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Signup
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}