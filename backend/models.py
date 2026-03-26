from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, UniqueConstraint, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
from sqlalchemy.sql import func

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    # NEW COLUMNS
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True)
    video_url = Column(String, unique=True)  # or file path
    user_id = Column(Integer, ForeignKey("users.id"))
    transcript = Column(Text)

    user = relationship("UserDB", backref="videos")
    
class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    video_id = Column(Integer, ForeignKey("videos.id"))

    #qtype = Column(String)        # mcq / descriptive
    #bloom_level = Column(String)  # remember / understand / apply

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))

    question_text = Column(String)
    option1 = Column(String)
    option2 = Column(String)
    option3 = Column(String)
    option4 = Column(String)

    correct_answer = Column(String)

    quiz = relationship("Quiz", backref="questions") 

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))

    score = Column(Integer)

    # VERY IMPORTANT: prevent multiple attempts
    __table_args__ = (
        UniqueConstraint("user_id", "quiz_id", name="unique_user_quiz"),
    )

    user = relationship("UserDB", backref="attempts")
    quiz = relationship("Quiz", backref="attempts")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))

    selected_answer = Column(String)   # ✅ user response stored here
    is_correct = Column(Boolean)       # optional but usefulselected_answer = Column(String)
    #is_correct = Column(Integer)

    attempt = relationship("Attempt", backref="answers")