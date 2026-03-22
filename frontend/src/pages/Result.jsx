import React from "react";

export default function Result({
  result,
  quiz = [],
  answers = [],
  setScreen,
  darkMode,
  setDarkMode,
}) {
  if (!result) return null;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md sticky top-0 z-50">
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

            <button
              onClick={() => setScreen("home")}
              className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition-all hover:scale-105"
            >
              Logout
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800"
            >
              {darkMode ? "☀" : "🌙"}
            </button>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <div className="max-w-3xl mx-auto pt-8 px-4 pb-16">

          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
            🎯 Your Result
          </h2>

          {/* SCORE CARD */}
          <div className="mt-6 text-center p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-900 hover:scale-[1.02] transition">
            <p className="text-2xl font-bold text-green-600">
              {result.score} / {result.total}
            </p>

            <p className="text-lg text-gray-800 dark:text-gray-300">
              {result.percentage.toFixed(2)}%
            </p>

            <p className="text-lg text-gray-800 dark:text-gray-300">
              {result.percentage > 80
                ? "🔥 Excellent!"
                : result.percentage > 50
                ? "👍 Good job!"
                : "💪 Keep improving!"}
            </p>
          </div>

          {/* REVIEW */}
          <div className="mt-8 space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Review Answers
            </h3>

            {quiz.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">
                No questions available.
              </p>
            ) : (
              quiz.map((q, i) => {
                const userAns = answers[i];
                const correctAns = q.answer;

                const isCorrect =
                  userAns?.toLowerCase().trim() ===
                  correctAns?.toLowerCase().trim();

                return (
                  <div
                    key={i}
                    className="p-5 rounded-xl shadow bg-white dark:bg-gray-900 hover:scale-[1.02] transition"
                  >
                    <p className="font-medium text-gray-800 dark:text-white">
                      {i + 1}. {q.question}
                    </p>

                    {/* LEVEL */}
                    {q.level && (
                      <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-white">
                        {q.level}
                      </span>
                    )}

                    {/* USER ANSWER */}
                    <p
                      className={`mt-3 font-medium ${
                        isCorrect ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      Your Answer: {userAns || "Not answered"}
                    </p>

                    {/* CORRECT ANSWER */}
                    {!isCorrect && (
                      <p className="text-green-600">
                        Correct: {correctAns}
                      </p>
                    )}

                    {/* EXPLANATION */}
                    {q.explanation && (
                      <div className="mt-3 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-800 text-sm text-gray-800 dark:text-white">
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-center gap-4 mt-10">
            <button
              onClick={() => setScreen("setup")}
              className="bg-gray-600 hover:bg-blue-800 text-white px-8 py-4 rounded-xl shadow-md hover:scale-105 transition"
            >
              🔁 New Quiz
            </button>

            <button
              onClick={() => setScreen("home")}
              className="bg-purple-600 hover:bg-purple-800 text-white px-8 py-4 rounded-xl shadow-md hover:scale-105 transition"
            >
              🏠 Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}