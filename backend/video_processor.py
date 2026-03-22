from moviepy.editor import VideoFileClip

def extract_audio(video_path):

    audio_path = video_path.replace(".mp4", ".wav")

    video = VideoFileClip(video_path)

    video.audio.write_audiofile(audio_path)

    return audio_path

