from PIL import Image
from pathlib import Path
from typing import List, Tuple, Optional
from pdf2image import convert_from_path

def compress_images(input_paths: List[Path], output_dir: Path, quality: int = 85):
    """Compress images while maintaining quality"""
    for path in input_paths:
        img = Image.open(path)
        
        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Save with compression
        output_path = output_dir / f"{path.stem}_compressed.jpg"
        img.save(output_path, 'JPEG', quality=quality, optimize=True)

def images_to_pdf(input_paths: List[Path], output_path: Path):
    """Convert images to PDF"""
    images = []
    
    for path in input_paths:
        img = Image.open(path)
        
        # Convert to RGB
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        images.append(img)
    
    # Save as PDF
    if images:
        images[0].save(
            output_path,
            'PDF',
            save_all=True,
            append_images=images[1:] if len(images) > 1 else []
        )

def pdf_to_images(input_path: Path, output_dir: Path, output_format: str = 'PNG', dpi: int = 200):
    """Convert PDF pages to images"""
    # Convert PDF to images
    images = convert_from_path(input_path, dpi=dpi)
    
    output_paths = []
    for i, image in enumerate(images, start=1):
        output_path = output_dir / f"page_{i}.{output_format.lower()}"
        image.save(output_path, output_format)
        output_paths.append(output_path)
    
    return output_paths

def convert_image(input_path: Path, output_path: Path, output_format: str, quality: int = 95):
    """Convert image to different format"""
    img = Image.open(input_path)
    
    # Handle transparency for formats that don't support it
    if output_format.upper() == 'JPG' or output_format.upper() == 'JPEG':
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        img.save(output_path, 'JPEG', quality=quality, optimize=True)
    else:
        # PNG or other formats
        img.save(output_path, output_format.upper(), optimize=True)

def resize_image(input_path: Path, output_path: Path, width: Optional[int] = None, 
                height: Optional[int] = None, maintain_aspect: bool = True):
    """Resize image with optional aspect ratio preservation"""
    img = Image.open(input_path)
    original_width, original_height = img.size
    
    if maintain_aspect:
        if width and not height:
            # Calculate height based on width
            aspect_ratio = original_height / original_width
            height = int(width * aspect_ratio)
        elif height and not width:
            # Calculate width based on height
            aspect_ratio = original_width / original_height
            width = int(height * aspect_ratio)
        elif width and height:
            # Use thumbnail to maintain aspect ratio within bounds
            img.thumbnail((width, height), Image.Resampling.LANCZOS)
            img.save(output_path, optimize=True)
            return
    
    # Resize to exact dimensions
    if width and height:
        img = img.resize((width, height), Image.Resampling.LANCZOS)
    
    img.save(output_path, optimize=True)

def crop_image(input_path: Path, output_path: Path, left: int, top: int, right: int, bottom: int):
    """
    Crop image to specified coordinates
    
    Args:
        input_path: Path to input image
        output_path: Path to save cropped image
        left, top, right, bottom: Crop box coordinates
    """
    img = Image.open(input_path)
    cropped = img.crop((left, top, right, bottom))
    cropped.save(output_path, optimize=True)

def add_watermark(input_path: Path, output_path: Path, watermark_text: str = None,
                 watermark_image_path: Path = None, position: str = 'bottom-right',
                 opacity: int = 128):
    """
    Add text or image watermark to image
    
    Args:
        input_path: Path to input image
        output_path: Path to save watermarked image
        watermark_text: Text to use as watermark
        watermark_image_path: Path to watermark image
        position: Position of watermark (center, top-left, top-right, bottom-left, bottom-right)
        opacity: Opacity of watermark (0-255)
    """
    from PIL import ImageDraw, ImageFont
    
    img = Image.open(input_path).convert('RGBA')
    
    if watermark_text:
        # Create text watermark
        txt_layer = Image.new('RGBA', img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(txt_layer)
        
        # Try to use a nice font, fallback to default
        try:
            font = ImageFont.truetype("arial.ttf", 36)
        except:
            font = ImageFont.load_default()
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Calculate position
        margin = 20
        positions = {
            'center': ((img.width - text_width) // 2, (img.height - text_height) // 2),
            'top-left': (margin, margin),
            'top-right': (img.width - text_width - margin, margin),
            'bottom-left': (margin, img.height - text_height - margin),
            'bottom-right': (img.width - text_width - margin, img.height - text_height - margin),
        }
        
        pos = positions.get(position, positions['bottom-right'])
        draw.text(pos, watermark_text, fill=(255, 255, 255, opacity), font=font)
        
        # Composite
        watermarked = Image.alpha_composite(img, txt_layer)
    
    elif watermark_image_path:
        # Use image watermark
        watermark = Image.open(watermark_image_path).convert('RGBA')
        
        # Resize watermark if too large (max 30% of image size)
        max_size = (img.width // 3, img.height // 3)
        watermark.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Adjust opacity
        alpha = watermark.split()[3]
        alpha = alpha.point(lambda p: int(p * opacity / 255))
        watermark.putalpha(alpha)
        
        # Calculate position
        margin = 20
        positions = {
            'center': ((img.width - watermark.width) // 2, (img.height - watermark.height) // 2),
            'top-left': (margin, margin),
            'top-right': (img.width - watermark.width - margin, margin),
            'bottom-left': (margin, img.height - watermark.height - margin),
            'bottom-right': (img.width - watermark.width - margin, img.height - watermark.height - margin),
        }
        
        pos = positions.get(position, positions['bottom-right'])
        
        # Paste watermark
        watermarked = img.copy()
        watermarked.paste(watermark, pos, watermark)
    else:
        raise ValueError("Either watermark_text or watermark_image_path must be provided")
    
    # Convert back to RGB if saving as JPEG
    if output_path.suffix.lower() in ['.jpg', '.jpeg']:
        watermarked = watermarked.convert('RGB')
    
    watermarked.save(output_path, optimize=True)

def extract_images_from_pdf(input_path: Path, output_dir: Path):
    """
    Extract embedded images from PDF
    
    Args:
        input_path: Path to PDF file
        output_dir: Directory to save extracted images
    
    Returns:
        List of extracted image paths
    """
    from PyPDF2 import PdfReader
    
    reader = PdfReader(input_path)
    image_count = 0
    extracted_paths = []
    
    for page_num, page in enumerate(reader.pages, start=1):
        if '/XObject' in page['/Resources']:
            xObject = page['/Resources']['/XObject'].get_object()
            
            for obj_name in xObject:
                obj = xObject[obj_name]
                
                if obj['/Subtype'] == '/Image':
                    image_count += 1
                    
                    # Get image data
                    size = (obj['/Width'], obj['/Height'])
                    data = obj.get_data()
                    
                    # Determine format
                    if '/Filter' in obj:
                        filter_type = obj['/Filter']
                        if filter_type == '/DCTDecode':
                            ext = 'jpg'
                        elif filter_type == '/FlateDecode':
                            ext = 'png'
                        elif filter_type == '/JPXDecode':
                            ext = 'jp2'
                        else:
                            ext = 'png'
                    else:
                        ext = 'png'
                    
                    # Save image
                    output_path = output_dir / f"image_{image_count}.{ext}"
                    
                    try:
                        if ext in ['jpg', 'jp2']:
                            # Save raw data for JPEG
                            with open(output_path, 'wb') as img_file:
                                img_file.write(data)
                        else:
                            # Use PIL for other formats
                            mode = "RGB" if obj.get('/ColorSpace') == '/DeviceRGB' else "P"
                            img = Image.frombytes(mode, size, data)
                            img.save(output_path)
                        
                        extracted_paths.append(output_path)
                    except Exception as e:
                        print(f"Failed to extract image {image_count}: {e}")
    
    return extracted_paths
