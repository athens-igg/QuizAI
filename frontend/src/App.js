import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  const [screen, setScreen] = useState("home");

 // const [file, setFile] = useState(null);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  const [quizType, setQuizType] = useState("mcq");
  const [bloomLevel, setBloomLevel] = useState("understand");
  const [mode, setMode] = useState("quiz");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (screen === "dashboard" && !token) {
      setScreen("login");
    }
  }, [screen, token]);

  return (
    <div className={darkMode ? "dark" : ""}>
      {/* 🌍 Global Background */}
      <div className="min-h-screen transition-all duration-300 bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">

        {/* Screens */}
        {screen === "home" && <Home setScreen={setScreen} darkMode={darkMode} setDarkMode={setDarkMode} />}
        {screen === "login" && <Login setScreen={setScreen} darkMode={darkMode} setDarkMode={setDarkMode} />}
        {screen === "signup" && <Signup setScreen={setScreen} darkMode={darkMode} setDarkMode={setDarkMode} />}
        {screen === "dashboard" && <Dashboard setScreen={setScreen} darkMode={darkMode} setDarkMode={setDarkMode} />}

        {screen === "setup" && (
          <Setup
            setScreen={setScreen}
            //setFile={setFile}
            quizType={quizType}
            setQuizType={setQuizType}
            bloomLevel={bloomLevel}
            setBloomLevel={setBloomLevel}
            mode={mode}
            setMode={setMode}
            setQuiz={setQuiz}
            darkMode={darkMode} setDarkMode={setDarkMode}
          />
        )}

        {screen === "quiz" && (
          <Quiz
            quiz={quiz}
            answers={answers}
            setAnswers={setAnswers}
            setResult={setResult}
            setScreen={setScreen}
            mode={mode}
            darkMode={darkMode} setDarkMode={setDarkMode}
          />
        )}

        {screen === "result" && (
          <Result
            result={result}
            quiz={quiz}
            answers={answers}
            setScreen={setScreen}
            darkMode={darkMode} setDarkMode={setDarkMode}
          />
        )}
      </div>
    </div>
  );
}

export default App;