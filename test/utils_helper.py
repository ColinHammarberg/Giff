import re

def is_youtube_url(url):
    youtube_regex = r'(https?://)?(www\.)?(youtube\.com|youtu\.?be)/.+'
    return re.match(youtube_regex, url) is not None

def is_vimeo_url(url):
    vimeo_regex = r'(https?://)?(www\.)?(vimeo\.com)/.+'
    return re.match(vimeo_regex, url) is not None