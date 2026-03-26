import React, { useState } from "react";

export default function Setup({
  setScreen,
  setFile,
  quizType,
  setQuizType,
  bloomLevel,
  setBloomLevel,
  mode,
  setMode,
  setQuiz, darkMode, setDarkMode
}) {
  const [loading, setLoading] = useState(false);
  const [fileLocal, setFileLocal] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  //const [embedUrl, setEmbedUrl] = useState("");

  const isValidYouTube = (url) => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

const getEmbedUrl = (url) => {
  try {
    const videoId = url.split("v=")[1]?.split("&")[0] 
      || url.split("youtu.be/")[1]?.split("?")[0];

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return "";
  }
};

  const handleUpload = async () => {
  const token = localStorage.getItem("token");  
  console.log("TOKEN SENT:", token);
  if (!fileLocal && !youtubeUrl) {
    alert("Upload video OR paste YouTube link!");
    return;
  }

  if (youtubeUrl && !isValidYouTube(youtubeUrl)) {
    alert("Please enter a valid YouTube URL.");
    return;
  }

  setLoading(true);

  let res;

  try {
    if (youtubeUrl) {
      res = await fetch(
        `http://127.0.0.1:8000/process-youtube?qtype=${quizType}&bloom=${bloomLevel}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token 
          },
          body: JSON.stringify({ url: youtubeUrl }),
        }
      );
    } else {
      const formData = new FormData();
      formData.append("file", fileLocal);

      res = await fetch(
        `http://127.0.0.1:8000/process-video?qtype=${quizType}&bloom=${bloomLevel}`,
        {
          method: "POST",
          headers: {
        "Authorization": "Bearer " + token   // 👈 ADD THIS
        },
          body: formData,
        }
      );
    }

    const data = await res.json();

    if (!data.quiz || data.quiz.length === 0) {
      alert("Failed to generate quiz.");
      setLoading(false);
      return;
    }

    setQuiz(data.quiz);
    setScreen("quiz");
  } catch (err) {
    alert("Something went wrong!");
  }

  setLoading(false);
};

  return (
  <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">

    {/* NAVBAR */}
    <nav className="flex justify-between items-center px-8 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <h1
        /*onClick={() => setScreen("home")}*/
        onClick={() => {
        localStorage.removeItem("token");
        setScreen("home");
        }}
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
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105"
        >
          Logout
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          {darkMode ? "☀" : "🌙"}
        </button>
      </div>
    </nav>

    {/* CENTER CONTAINER */}
    <div className="flex items-center justify-center px-6 py-10 min-h-[calc(100vh-80px)]">

      <div className="w-full max-w-2xl p-8 rounded-3xl backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border border-white/20 shadow-2xl transition">

        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">
          ⚙️ Setup Your Quiz
        </h2>

        <div className="space-y-6">

          {/* TYPE */}
          <div>
            <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              1. Select Question Type
            </p>
            <div className="flex flex-wrap gap-2">
              {["mcq", "truefalse", "fill", "mixed"].map((t) => (
                <button
                  key={t}
                  onClick={() => setQuizType(t)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    quizType === t
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200"
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* BLOOM */}
          <div>
            <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              2. Select Bloom Level
            </p>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value)}
              className="w-full border p-3 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="remember">Remember</option>
              <option value="understand">Understand</option>
              <option value="apply">Apply</option>
              <option value="analyze">Analyze</option>
              <option value="evaluate">Evaluate</option>
              <option value="create">Create</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* MODE */}
          <div>
            <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              3. Select Mode
            </p>
            <div className="flex gap-2">
              {["learning", "quiz"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg transition ${
                    mode === m
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200"
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* FILE */}
          <div>
            <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
              4. Upload Video
            </p>
            <input
              type="file"
              disabled={youtubeUrl}
              onChange={(e) => {setFileLocal(e.target.files[0]);
  setYoutubeUrl("");
}}
              className="border p-3 rounded-lg w-full bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* OR Divider */}
<div className="text-center my-4 text-gray-500 dark:text-gray-400">
  — OR —
</div>

{/* YOUTUBE LINK */}
<div>
  <p className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
    5. Paste YouTube Link
  </p>

  <input
    type="text"
    disabled={fileLocal}
    placeholder="https://youtube.com/..."
    value={youtubeUrl}
    onChange={(e) => {setYoutubeUrl(e.target.value);
  setFileLocal(null);}}
    className="w-full border p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
  />
</div>
{youtubeUrl && isValidYouTube(youtubeUrl) && (
  <iframe
    className="w-full h-48 rounded-lg mt-4"
    src={getEmbedUrl(youtubeUrl)}
    title="YouTube preview"
    allowFullScreen
  />
)}

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${
  loading
    ? "bg-gray-400 cursor-not-allowed"
    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 hover:shadow-xl"
}`}
          >
            {loading ? "⏳ Processing..." : "🚀 Generate Quiz"}
          </button>

          {/* LOADING */}
          {loading && (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>

              <p className="mt-4 text-blue-600 dark:text-blue-400 font-semibold">
                🤖 Processing your video...
              </p>

              <p className="text-gray-500 dark:text-gray-300 text-sm">
                Extracting audio → Generating quiz → Almost done...
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
    </div>
  </div>
);
}