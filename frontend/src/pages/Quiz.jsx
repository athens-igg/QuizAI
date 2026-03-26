import React, { useState, useEffect } from "react";

export default function Quiz({
  quiz = [],
  quizId,
  answers = {},
  setAnswers,
  setResult,
  setScreen,
  mode,
  darkMode,
  setDarkMode,
}) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    setSelectedOption(answers[currentQ] || null);
  }, [currentQ, answers]);
  
  const handleSelect = (option) => {
    setSelectedOption(option);

    setAnswers((prev) => ({
      ...prev,
      [currentQ]: option,
    }));
  };

  const handleNext = () => setCurrentQ((prev) => prev + 1);
  const handlePrev = () => setCurrentQ((prev) => prev - 1);
  const token = localStorage.getItem("token");
  const submitQuiz = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token, 
          
        },
        body: JSON.stringify({ answers, quiz, quiz_id: quizId })
      });

      const data = await res.json();
      setResult(data);
      setScreen("result");
    } catch (err) {
      console.error("Error submitting quiz:", err);
    }
  };

  if (!quiz.length) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            ⏳ Loading quiz...
          </p>
        </div>
      </div>
    );
  }

  const q = quiz[currentQ];
  if (!q) return null;

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
            <button
              onClick={() => setScreen("home")}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
            >
              Home
            </button>

            <button
              onClick={() => setScreen("home")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105"
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
        <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">

          {/* PROGRESS */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span>
                Question {currentQ + 1} / {quiz.length}
              </span>
            </div>

            <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQ + 1) / quiz.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* QUESTION CARD */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl hover:scale-[1.01] transition">

            {/* QUESTION */}
            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              {currentQ + 1}. {q.question}
            </p>

            {/* LEVEL */}
            {q.level && (
              <span className="inline-block bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-white px-3 py-1 rounded-full text-xs mb-4">
                {q.level}
              </span>
            )}

            {/* OPTIONS */}
            {q.options && Array.isArray(q.options) ? (
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  const isSelected = selectedOption === opt;

                  return (
                    <div
                      key={i}
                      onClick={() => handleSelect(opt)}
                      className={`p-3 rounded-lg border cursor-pointer transition-transform duration-200 ease-in-out ${
  isSelected
    ? "bg-blue-500 text-white border-blue-600 scale-[1.02] shadow-lg "
    : "bg-gray-100 dark:bg-gray-700 dark:text-white hover:scale-105 hover:bg-gray-200"
}`}





                    >
                      {opt}
                    </div>
                  );
                })}
              </div>
            ) : (
              <input
                type="text"
                value={selectedOption || ""}
                onChange={(e) => handleSelect(e.target.value)}
                className="border p-3 w-full rounded-lg mt-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your answer..."
              />
            )}

            {/* LEARNING MODE */}
            {mode === "learning" && selectedOption && (
              <div className="mt-5 p-4 rounded-lg bg-yellow-100 dark:bg-yellow-700 text-gray-800 dark:text-white">
                <p className="font-semibold">💡 Explanation</p>
                <p className="text-sm mt-1">
                  {q.explanation || "No explanation available."}
                </p>
              </div>
            )}
          </div>

          {/* NAV BUTTONS */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentQ === 0}
              className="px-5 py-2 bg-gray-300 dark:bg-gray-700 dark:text-white rounded-lg disabled:opacity-50"
            >
              ⬅ Previous
            </button>

            {currentQ < quiz.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover:scale-105 transition"
              >
                Next ➡
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg hover:scale-105 transition"
              >
                Submit ✅
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}