from PIL import Image, ImageDraw
import math
import os

def draw_heart(size, color="#FF3366"):
    img = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    points = []
    for i in range(360):
        t = math.radians(i)
        x = 16 * math.sin(t)**3
        y = 13 * math.cos(t) - 5 * math.cos(2*t) - 2 * math.cos(3*t) - math.cos(4*t)
        
        scale = size / 35
        
        px = size/2 + x * scale
        py = size/2 - y * scale - size/8
        
        points.append((px, py))
        
    draw.polygon(points, fill=color)
    return img

def create_animation(filename):
    frames = []
    num_frames = 20
    base_size = 80
    canvas_size = 128
    
    for i in range(num_frames):
        t = i / num_frames
        
        # Double heartbeat pulse that syncs with bounce
        # Bounce: absolute sine wave makes it hit the ground and go up
        bounce_offset = abs(math.sin(t * math.pi)) * 15
        
        # Pulse: beating effect
        pulse_scale = 1.0 + math.sin(t * math.pi * 2) * 0.1
        
        current_size = int(base_size * pulse_scale)
        heart_img = draw_heart(current_size)
        
        # Create a transparent frame
        frame = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 0))
        
        paste_x = (canvas_size - current_size) // 2
        
        # Bounce goes UP, so we subtract offset. 
        # But we want it to hit the bottom.
        # Let's adjust so it looks like it's bouncing on a floor.
        baseline_y = canvas_size - base_size - 10
        paste_y = baseline_y - int(bounce_offset) + (base_size - current_size) // 2
        
        frame.paste(heart_img, (paste_x, paste_y), heart_img)
        frames.append(frame)
        
    frames[0].save(
        filename,
        save_all=True,
        append_images=frames[1:],
        duration=50,
        loop=0,
        disposal=2
    )
    print(f"Created {filename}")

if __name__ == "__main__":
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "slack_heart_bounce.gif")
    create_animation(output_path)
