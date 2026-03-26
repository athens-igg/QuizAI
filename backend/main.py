from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Depends
from database import engine, get_db
from sqlalchemy.orm import Session
from models import Base, Video, Quiz, Question, Attempt, Answer
from models import UserDB
import shutil
import os
from sqlalchemy import func

from video_processor import extract_audio
from transcription import transcribe_audio
from quiz_generator import generate_quiz
from auth import router as auth_router
from auth import get_current_user

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
    import time
    video_id = extract_video_id(url)

    if not video_id:
        raise Exception("Invalid YouTube URL")

    # ⏳ Delay BEFORE hitting YouTube
    time.sleep(1.5)

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
async def process_youtube(
    data: dict,
    qtype: str = "mcq",
    bloom: str = "understand",
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    try:
        url = data.get("url")

        if not url:
            return {"error": "URL missing", "quiz": []}

        # ✅ CACHE FIRST
        existing_video = db.query(Video).filter(Video.video_url == url).first()

        if existing_video:
            print("⚡ Using cached transcript")
            transcript = existing_video.transcript
        else:
            try:
                transcript = get_transcript_from_youtube(url)
            except Exception as e:
                print("⚠️ Transcript failed:", e)
                return {"error": "Could not fetch transcript", "quiz": []}

        # ✅ VALIDATE
        if not transcript or len(transcript) < 50:
            return {"error": "Transcript too short", "quiz": []}

        # ✅ GENERATE QUIZ
        try:
            quiz = generate_quiz(transcript, qtype, bloom, 5)
        except Exception as e:
            print("❌ Quiz generation failed:", e)
            return {"error": "Quiz generation failed", "quiz": []}

        # ✅ SAVE VIDEO ONLY IF NEW
        if not existing_video:
            new_video = Video(
                user_id=current_user.id,
                video_url=url,
                transcript=transcript
            )
            db.add(new_video)
            db.commit()
            db.refresh(new_video)
        else:
            new_video = existing_video

        # ✅ SAVE QUIZ
        new_quiz = Quiz(
            user_id=current_user.id,
            video_id=new_video.id
        )
        db.add(new_quiz)
        db.commit()
        db.refresh(new_quiz)

        # ✅ SAVE QUESTIONS
        for q in quiz:
            options = q.get("options", [])

            if len(options) < 4:
                print("⚠️ Skipping invalid question:", q)
                continue
            new_question = Question(
                quiz_id=new_quiz.id,
                question_text=q["question"],
                option1=q["options"][0],
                option2=q["options"][1],
                option3=q["options"][2],
                option4=q["options"][3],
                correct_answer=q["answer"]
            )
            db.add(new_question)

        db.commit()

        return {
            "quiz_id": new_quiz.id,
            "transcript": transcript,
            "quiz": quiz
        }

    except Exception as e:
        print("❌ ERROR:", e)
        return {
            "error": str(e),
            "quiz": []
        }

"""
@app.post("/process-youtube")
async def process_youtube(data: dict, qtype: str = "mcq", bloom: str = "understand", db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    try:
        url = data.get("url")
        transcript=None
        try:
            transcript = get_transcript_from_youtube(url)
        except Exception as e:
            print("⚠️ Transcript API failed:", e)
            #transcript = None   

        #if not transcript or len(transcript) < 50:
        #if len(transcript) < 50:
        #    return {"error": "Transcript too short", "quiz": []}

        if not transcript:
            return {"error": "Could not fetch transcript", "quiz": []}
        #    try:
        #        transcript = get_transcript_with_ytdlp(url)
        #    except Exception as e:
        #        print("❌ Fallback failed:", e)
        #        return {"error": "Could not fetch transcript", "quiz": []}    
        if len(transcript) < 50:
            return {"error": "Transcript too short", "quiz": []}
        quiz = generate_quiz(transcript, qtype, bloom, 5)

        # ✅ SAVE TO DATABASE
        new_video = Video(
            #user_id=1,  # 🔥 replace later with logged-in user
            user_id = current_user.id,
            video_url=url,
            transcript=transcript
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)

        # ✅ SAVE QUIZ
        new_quiz = Quiz(
            #user_id=1   # 🔥 replace later with logged-in user
            user_id = current_user.id,
            video_id=new_video.id
        )
        #uncomment if needed
        db.add(new_quiz)
        db.commit()
        db.refresh(new_quiz)

        for q in quiz:
            new_question = Question(
                quiz_id=new_quiz.id,
                question_text=q["question"],
                option1=q["options"][0],
                option2=q["options"][1],
                option3=q["options"][2],
                option4=q["options"][3],
                correct_answer=q["answer"]
            )
        
            db.add(new_question)
        
        db.commit()
        #db.add(new_quiz)
        #db.commit()
        #db.refresh(new_quiz)


        return {
            "quiz_id": new_quiz.id,  # 🔥 useful for later
            "transcript": transcript,
            "quiz": quiz
        }

    except Exception as e:
        print("❌ ERROR:", e)
        return {
            "error": str(e),
            "quiz": []
        }
"""

# =========================
# 🧠 EVALUATION
# =========================
@app.post("/evaluate")
async def evaluate(
    data: dict,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    answers = data.get("answers", {})
    quiz_id = data.get("quiz_id")

    # ✅ FETCH QUESTIONS FROM DB
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    total = len(questions)

    correct = 0

    # ✅ CREATE ATTEMPT
    attempt = Attempt(
        user_id=current_user.id,
        quiz_id=quiz_id,
        score=0
    )
    db.add(attempt)
    db.flush()  # get attempt.id

    # ✅ LOOP THROUGH QUESTIONS
    for i, q in enumerate(questions):
        user_ans = answers.get(str(i)) or answers.get(i)

        is_correct = (
            user_ans and user_ans.strip().lower() == str(q.correct_answer).strip().lower()
        )

        if is_correct:
            correct += 1

        db.add(Answer(
            attempt_id=attempt.id,
            question_id=q.id,   # ✅ correct
            selected_answer=user_ans,
            is_correct=is_correct
        ))

    # ✅ FINAL SCORE UPDATE
    attempt.score = correct

    db.commit()

    return {
        "score": correct,
        "total": total,
        "percentage": (correct / total) * 100 if total > 0 else 0
    }
"""
@app.post("/evaluate")
async def evaluate(
    data: dict,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    answers = data.get("answers", {})
    quiz = data.get("quiz", [])
    quiz_id = data.get("quiz_id")

    correct = 0
    total = len(quiz)

    # 🔥 REMOVE OLD ATTEMPTS (important)
    #db.query(Attempt).filter(
    #    Attempt.quiz_id == quiz_id,
    #    Attempt.user_id == current_user.id
    #).delete()

    

    for i in range(total):
        user_ans = answers.get(str(i)) or answers.get(i)
        correct_ans = quiz[i]["answer"]


        is_correct = (
            user_ans and user_ans.strip().lower() == correct_ans.strip().lower()
        )

        if is_correct:
            correct += 1
        # Calculate total score first
        
        # Check if the user already has an attempt for this quiz
        existing_attempt = db.query(Attempt).filter(
            Attempt.user_id == current_user.id,
            Attempt.quiz_id == quiz_id
        ).first()

        if existing_attempt:
            # Update the existing attempt
            existing_attempt.score = correct
        else:    
            db.add(Attempt(
                user_id=current_user.id,
                quiz_id=quiz_id,
                score=1 if is_correct else 0
            ))

    db.commit()    

    # ✅ UPDATE quiz_score (SUM of attempts)
    total_score = db.query(func.sum(Attempt.score)).filter(
        Attempt.quiz_id == quiz_id
    ).scalar() or 0

    quiz_db = db.query(Quiz).filter(Quiz.id == quiz_id).first()

    if quiz_db:
        quiz_db.quiz_score = total_score
        db.commit()
    return {
        "score": correct,
        "total": total,
        "percentage": (correct / total) * 100 if total > 0 else 0
    }
"""
@app.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    quizzes = (
        db.query(Quiz)
        .filter(Quiz.user_id == current_user.id)
        .order_by(Quiz.id.desc())
        .all()
    )

    result = []

    for quiz in quizzes:
        questions = db.query(Question).filter(Question.quiz_id == quiz.id).all()

        total = len(questions)

        # ⚠️ You can improve this later with real scores
        result.append({
            "id": quiz.id,
            "title": f"Quiz {quiz.id}",
            "score": quiz.quiz_score or 0,   # placeholder for now
            "total": total
        })

    return {
        "user": {
            "name": current_user.name,
            "email": current_user.email
        },
        "recent_quizzes": result
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