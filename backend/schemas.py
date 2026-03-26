from pydantic import BaseModel

class VideoCreate(BaseModel):
    youtube_url: str

class QuizResponse(BaseModel):
    id: int
    user_id: int    