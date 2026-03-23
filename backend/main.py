from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from database import engine
from models import Base
import shutil
import os

from video_processor import extract_audio
from transcription import transcribe_audio
from quiz_generator import generate_quiz
from auth import router as auth_router

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound

import yt_dlp

app = FastAPI()

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.include_router(auth_router)

# THIS LINE CREATES TABLES
Base.metadata.create_all(bind=engine)

# =========================
# 🔥 UTILS
# =========================

def extract_video_id(url: str):
    if "watch?v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return None


def get_transcript_from_youtube(url):
    video_id = extract_video_id(url)

    if not video_id:
        raise Exception("Invalid YouTube URL")

    # =========================
    # ✅ TRY 1: Transcript API (FAST)
    # =========================
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript_list = ytt_api.list(video_id)

        transcript = transcript_list.find_transcript(['en', 'hi'])

        data = transcript.fetch()

        full_text = " ".join([t.text for t in data])

        print("✅ Transcript fetched using API")
        return full_text

    except (TranscriptsDisabled, NoTranscriptFound):
        print("⚠️ No captions available, switching to fallback...")

    except Exception as e:
        print("⚠️ Transcript API error:", e)

    # =========================
    # ✅ TRY 2: yt-dlp + Whisper (FALLBACK)
    # =========================
    try:
        output_path = f"{UPLOAD_DIR}/{video_id}.%(ext)s"

        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": output_path,
            "quiet": True,
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
            }],
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])

        audio_path = f"{UPLOAD_DIR}/{video_id}.wav"

        transcript = transcribe_audio(audio_path)

        print("✅ Transcript generated using Whisper fallback")
        return transcript

    except Exception as e:
        raise Exception(f"Both transcript and fallback failed: {str(e)}")


# =========================
# 📁 FILE UPLOAD
# =========================

@app.post("/process-video")
async def process_video(
    file: UploadFile = File(...),
    qtype: str = "mcq",
    bloom: str = "understand"
):
    try:
        video_path = f"{UPLOAD_DIR}/{file.filename}"

        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        audio = extract_audio(video_path)
        transcript = transcribe_audio(audio)

        quiz = generate_quiz(transcript, qtype, bloom, 5)

        return {
            "transcript": transcript,
            "quiz": quiz
        }

    except Exception as e:
        return {
            "error": str(e),
            "quiz": []
        }


# =========================
# 🚀 YOUTUBE
# =========================

@app.post("/process-youtube")
async def process_youtube(data: dict, qtype: str = "mcq", bloom: str = "understand"):
    try:
        url = data.get("url")

        transcript = get_transcript_from_youtube(url)

        if not transcript or len(transcript) < 50:
            return {"error": "Transcript too short", "quiz": []}

        quiz = generate_quiz(transcript, qtype, bloom, 5)

        return {
            "transcript": transcript,
            "quiz": quiz
        }

    except Exception as e:
        print("❌ ERROR:", e)
        return {
            "error": str(e),
            "quiz": []
        }


# =========================
# 🧠 EVALUATION
# =========================

@app.post("/evaluate")
async def evaluate(data: dict):
    answers = data.get("answers", {})
    quiz = data.get("quiz", [])

    correct = 0
    total = len(quiz)

    for i in range(total):
        user_ans = answers.get(str(i)) or answers.get(i)
        correct_ans = quiz[i]["answer"]

        if user_ans and user_ans.strip().lower() == correct_ans.strip().lower():
            correct += 1

    return {
        "score": correct,
        "total": total,
        "percentage": (correct / total) * 100 if total > 0 else 0
    }


# =========================
# 🌐 CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)