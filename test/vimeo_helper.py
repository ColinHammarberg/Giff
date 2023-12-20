import youtube_dl

def download_vimeo_video(url):
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': '%(id)s.%(ext)s',
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(url, download=True)
        video_id = info_dict.get('id', None)
        video_ext = info_dict.get('ext', None)
        video_path = f"{video_id}.{video_ext}" if video_id and video_ext else None

    return video_path