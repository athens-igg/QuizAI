import React from "react";

export default function Dashboard({ setScreen, darkMode }) {
  const user = {
    name: "Ayisha", // later from auth
    email: "ayisha@email.com",
  };

  const recentQuizzes = [
    { title: "Computer Science Basics", score: 4, total: 5 },
    { title: "Networking Intro", score: 3, total: 5 },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900 transition">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          📊 Dashboard
        </h1>

        <button
          onClick={() => setScreen("home")}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg"
        >
          🏠 Home
        </button>
      </div>

      {/* USER CARD */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          👋 Welcome, {user.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-300">{user.email}</p>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
            Quizzes Taken
          </h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">12</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
            Avg Score
          </h3>
          <p className="text-2xl font-bold text-green-600 mt-2">78%</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow text-center">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
            Accuracy
          </h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">82%</p>
        </div>

      </div>

      {/* RECENT QUIZZES */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          📚 Recent Quizzes
        </h2>

        {recentQuizzes.map((quiz, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b py-3 last:border-none"
          >
            <span className="text-gray-700 dark:text-gray-300">
              {quiz.title}
            </span>

            <span className="font-semibold text-blue-600">
              {quiz.score}/{quiz.total}
            </span>
          </div>
        ))}
      </div>

      {/* ACTION */}
      <div className="text-center">
        <button
          onClick={() => setScreen("setup")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg shadow-lg"
        >
          🚀 Create New Quiz
        </button>
      </div>

    </div>
  );
}