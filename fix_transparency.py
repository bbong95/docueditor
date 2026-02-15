from PIL import Image
import os

def remove_white_bg(path):
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    print(f"Processing {path}...")
    try:
        img = Image.open(path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check if pixel is nearly white
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))  # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(path, "PNG")
        print(f"Successfully processed {path}")
    except Exception as e:
        print(f"Error processing {path}: {e}")

if __name__ == "__main__":
    remove_white_bg("public/assets/logo.png")
    remove_white_bg("public/assets/favicon.png")
