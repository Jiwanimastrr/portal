from rembg import remove
from PIL import Image
input_path = "trainee.png"
output_path = "trainee_rmbg.png"
input = Image.open(input_path)
output = remove(input)
output.save(output_path)
