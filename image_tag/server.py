from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from models import generate_caption, kw_model, image_embedding
import pickle, faiss, numpy as np
from pathlib import Path

app = Flask(__name__)
CORS(app, resources={
    r"/predict": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

DATA_DIR = Path(__file__).resolve().parent
IMG_DIR = DATA_DIR / "images"

# Load assets once at startup
index = faiss.read_index(str(DATA_DIR / "image_index.faiss"))
with open(DATA_DIR / "metadata_with_paths.pkl", "rb") as f:
    metadata = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' in request.files:
        file = request.files['file']
        img = Image.open(file.stream).convert("RGB")
    else:
        # Accept raw image bytes (for fetch with octet-stream)
        img = Image.open(io.BytesIO(request.get_data())).convert("RGB")

    caption = generate_caption(img)
    keywords = kw_model.extract_keywords(caption, keyphrase_ngram_range=(1,2), stop_words="english", top_n=5)
    tags = [k[0] for k in keywords]

    # Optionally: add to index/metadata (commented out for stateless prediction)
    # emb = image_embedding(img)
    # index.add(emb)
    # ...

    return jsonify({"tags": tags, "caption": caption})

import subprocess
import sys
import os

if __name__ == "__main__":
    # Start the FastAPI recommendation service in the background
    rec_api_path = os.path.join(os.path.dirname(__file__), "recommendation_api.py")
    subprocess.Popen([sys.executable, rec_api_path])
    # Start the Flask server as usual
    app.run(host="0.0.0.0", port=5000, debug=True)
