import React, { useState } from "react";

export default function Signup({ setScreen, darkMode, setDarkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be 8+ chars, include uppercase & special character"
      );
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await res.json();

      if (data.message) {
        setSuccess(true);

        setTimeout(() => {
          setScreen("login");
        }, 2000);
      } else {
        setError("Signup failed");
      }
    } catch {
      setError("Server error");
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

            {/* Show Login (NOT Signup here) */}
            {!token && (
              <button
                onClick={() => setScreen("login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Login
              </button>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? "☀" : "🌙"}
            </button>
          </div>
        </nav>

        {/* SIGNUP SECTION */}
        <div className="flex items-center justify-center px-6 min-h-[calc(100vh-80px)]">
          <div className="w-full max-w-md p-8 rounded-3xl backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border border-white/20 shadow-2xl">

            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
              📝 Create Account
            </h2>

            {error && (
              <div className="bg-red-100 text-red-600 dark:bg-red-200 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 text-green-600 dark:bg-green-200 p-3 rounded mb-4 text-sm">
                Signup successful! Redirecting...
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">

              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded-xl border bg-white/70 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 rounded-xl border bg-white/70 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-3 rounded-xl border bg-white/70 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                onChange={(e) => setConfirm(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-green-500 to-blue-500 hover:scale-105 transition"
              >
                {loading ? "⏳ Creating..." : "Signup"}
              </button>
            </form>

            <p className="text-center text-sm mt-6 text-gray-700 dark:text-gray-300">
              Already have an account?{" "}
              <span
                onClick={() => setScreen("login")}
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}