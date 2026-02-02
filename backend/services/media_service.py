"""
Media Service - Audio and Video Processing
Handles audio conversion, video to audio, and video compression
"""
from pathlib import Path
import subprocess
import os

def check_ffmpeg():
    """Check if ffmpeg is installed"""
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def convert_audio(input_path: Path, output_path: Path, output_format: str):
    """
    Convert audio between formats (MP3, WAV, OGG)
    
    Args:
        input_path: Path to input audio file
        output_path: Path to output audio file
        output_format: Target format (mp3, wav, ogg)
    """
    if not check_ffmpeg():
        raise RuntimeError(
            "FFmpeg is not installed. Please install FFmpeg:\n"
            "Windows: Download from https://www.gyan.dev/ffmpeg/builds/ or use 'choco install ffmpeg'\n"
            "Linux: sudo apt install ffmpeg\n"
            "Mac: brew install ffmpeg"
        )
    
    format_lower = output_format.lower()
    if format_lower not in ['mp3', 'wav', 'ogg']:
        raise ValueError("Format must be mp3, wav, or ogg")
    
    # Use ffmpeg to convert
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-y',  # Overwrite output
        str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Audio conversion failed: {result.stderr}")

def video_to_audio(input_path: Path, output_path: Path):
    """
    Extract audio from video file as MP3
    
    Args:
        input_path: Path to input video file
        output_path: Path to output MP3 file
    """
    if not check_ffmpeg():
        raise RuntimeError(
            "FFmpeg is not installed. Please install FFmpeg:\n"
            "Windows: Download from https://www.gyan.dev/ffmpeg/builds/ or use 'choco install ffmpeg'\n"
            "Linux: sudo apt install ffmpeg\n"
            "Mac: brew install ffmpeg"
        )
    
    # Enhanced FFmpeg command with better compatibility
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-vn',  # No video
        '-acodec', 'libmp3lame',  # MP3 codec
        '-ab', '192k',  # Audio bitrate 192kbps
        '-ar', '44100',  # Sample rate 44.1kHz
        '-ac', '2',  # Stereo (2 channels)
        '-q:a', '2',  # High quality
        '-y',  # Overwrite output
        str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    
    if result.returncode != 0:
        # Check if video has no audio
        if 'does not contain any stream' in result.stderr or 'No audio' in result.stderr:
            raise RuntimeError("Video file does not contain any audio track")
        raise RuntimeError(f"Video to audio conversion failed: {result.stderr}")
    
    # Verify output file exists and has content
    if not output_path.exists() or output_path.stat().st_size == 0:
        raise RuntimeError("Conversion completed but output file is empty or missing")

def compress_video(input_path: Path, output_path: Path, quality: str = 'medium'):
    """
    Compress video file
    
    Args:
        input_path: Path to input video file
        output_path: Path to output video file
        quality: Compression level (low, medium, high)
    """
    if not check_ffmpeg():
        raise RuntimeError(
            "FFmpeg is not installed. Please install FFmpeg:\n"
            "Windows: Download from https://www.gyan.dev/ffmpeg/builds/ or use 'choco install ffmpeg'\n"
            "Linux: sudo apt install ffmpeg\n"
            "Mac: brew install ffmpeg"
        )
    
    # CRF values: lower = better quality, higher = more compression
    crf_values = {
        'low': '28',    # More compression
        'medium': '23',  # Balanced
        'high': '18'    # Less compression, better quality
    }
    
    crf = crf_values.get(quality.lower(), '23')
    
    cmd = [
        'ffmpeg',
        '-i', str(input_path),
        '-vcodec', 'libx264',
        '-crf', crf,
        '-preset', 'medium',
        '-y',
        str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Video compression failed: {result.stderr}")
