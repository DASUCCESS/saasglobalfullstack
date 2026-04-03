from io import BytesIO
from PIL import Image


def compress_image_to_target(file_obj, target_kb: int = 50) -> BytesIO:
    image = Image.open(file_obj).convert('RGB')
    output = BytesIO()
    quality = 85
    while quality >= 30:
        output.seek(0)
        output.truncate(0)
        image.save(output, format='JPEG', optimize=True, quality=quality)
        if output.tell() <= target_kb * 1024:
            break
        quality -= 5
    output.seek(0)
    return output
