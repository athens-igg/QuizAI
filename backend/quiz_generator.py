import google.generativeai as genai
import json
import re
import os
from dotenv import load_dotenv
import time
load_dotenv()  # Load environment variables from .env file

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    model = None

def generate_quiz(transcript, qtype="mcq", bloom="understand", num=5):
    if not model:
        raise RuntimeError("GEMINI_API_KEY is not set")

    transcript = transcript[:10000]

    prompt = f"""
You are an AI that generates quiz questions.

REQUIREMENTS:
- Generate {num} questions
- Question type: {qtype}
- Bloom's taxonomy level: {bloom}

QUESTION TYPES:
- mcq → 4 options
- truefalse → True/False
- fill → short answer
- mixed → mix all types

BLOOM LEVEL GUIDE:
- remember → factual recall
- understand → explanation
- apply → real-world use
- analyze → compare/contrast
- evaluate → judgment
- create → new ideas

STRICT RULES:
- Output ONLY valid JSON
- NO text outside JSON
- Each question must include:
  - question
  - answer
  - explanation
  - type
  - level

FORMAT:

[
  {{
    "question": "string",
    "options": ["A", "B", "C", "D"],  // only for mcq
    "answer": "correct answer",
    "type": "mcq / truefalse / fill",
    "level": "{bloom}",
    "explanation": "short explanation"
  }}
]

TEXT:
{transcript}
"""

    for attempt in range(3):
        try:
            response = model.generate_content(prompt)
            content = (response.text or "").strip()

            # 🔥 CLEAN RESPONSE
            content = re.sub(r"```json|```", "", content).strip()

            quiz = json.loads(content)

            # ✅ VALIDATION
            if isinstance(quiz, list) and len(quiz) > 0:
                return quiz

        except Exception as e:
            print("Retrying due to:", e)
            time.sleep(2)

    return [
    {
        "question": "What is the main idea of the video?",
        "options": ["Concept", "Story", "Experiment", "Data"],
        "answer": "Concept",
        "type": "mcq",
        "level": bloom,
        "explanation": "This is a fallback question."
    },
    {
        "question": "Is the topic explained clearly?",
        "options": ["True", "False"],
        "answer": "True",
        "type": "truefalse",
        "level": bloom,
        "explanation": "Fallback explanation."
    },
    {
        "question": "Fill in the blank: The video discusses ______.",
        "answer": "concept",
        "type": "fill",
        "level": bloom,
        "explanation": "Fallback fill question."
    },
    {
        "question": "Which option best describes the content?",
        "options": ["Theory", "Application", "History", "Math"],
        "answer": "Theory",
        "type": "mcq",
        "level": bloom,
        "explanation": "Fallback."
    },
    {
        "question": "Is this topic practical?",
        "options": ["True", "False"],
        "answer": "True",
        "type": "truefalse",
        "level": bloom,
        "explanation": "Fallback."
    }
]
