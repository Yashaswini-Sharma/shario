from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from models import generate_caption, kw_model, image_embedding
import pickle, faiss, numpy as np
from pathlib import Path
import tempfile
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).resolve().parent.parent / '.env')

# Define DATA_DIR first
DATA_DIR = Path(__file__).resolve().parent
IMG_DIR = DATA_DIR / "images"

# Import the search engine from search.py
try:
    # Add the current directory to Python path
    import sys
    sys.path.append(str(DATA_DIR))
    
    from search import SearchEngine
    SEARCH_ENGINE_AVAILABLE = True
    print("SearchEngine import successful")
except ImportError as e:
    SEARCH_ENGINE_AVAILABLE = False
    print(f"Warning: SearchEngine not available - {e}")
except Exception as e:
    SEARCH_ENGINE_AVAILABLE = False
    print(f"Warning: SearchEngine initialization error - {e}")

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load assets once at startup
index = faiss.read_index(str(DATA_DIR / "image_index.faiss"))
with open(DATA_DIR / "metadata_with_paths.pkl", "rb") as f:
    metadata = pickle.load(f)

# Initialize search engine
search_engine = None
if SEARCH_ENGINE_AVAILABLE:
    try:
        # Get Gemini API key from environment
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        use_gemini = bool(gemini_api_key)
        
        # Initialize with Gemini if API key is available
        search_engine = SearchEngine(
            base_dir=str(DATA_DIR), 
            use_gemini=use_gemini, 
            gemini_key=gemini_api_key
        )
        print(f"SearchEngine initialized successfully (Gemini: {'enabled' if use_gemini else 'disabled'})")
    except Exception as e:
        print(f"Failed to initialize SearchEngine: {e}")
        search_engine = None
        SEARCH_ENGINE_AVAILABLE = False

@app.route('/', methods=['GET'])
def health():
    return jsonify({
        "status": "running",
        "search_engine_available": SEARCH_ENGINE_AVAILABLE,
        "faiss_index_loaded": index is not None if 'index' in globals() else False,
        "metadata_loaded": len(metadata) if 'metadata' in globals() else 0
    })

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

@app.route('/search_by_image', methods=['POST'])
def search_by_image():
    """Search for similar images using the uploaded image and existing FAISS index"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Load the image and get embedding using existing models
        img = Image.open(file.stream).convert("RGB")
        
        # Get image embedding using existing function
        embedding = image_embedding(img)
        
        # Get query parameters
        k = int(request.form.get('k', 10))
        
        # Search using existing FAISS index
        distances, indices = index.search(embedding, k)
        
        # Get results from metadata
        results = []
        for idx in indices[0]:
            if idx < len(metadata):
                result_path = metadata[idx].get("image_path", f"image_{idx}")
                results.append(result_path)
        
        return jsonify({
            "results": results,
            "count": len(results),
            "distances": distances[0].tolist()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search_by_text', methods=['GET'])
def search_by_text():
    """Search for images using text query with basic keyword matching"""
    try:
        query_text = request.args.get('q', '').lower()
        k = int(request.args.get('k', 10))
        
        if not query_text:
            return jsonify({"error": "No query text provided"}), 400
        
        # Use SearchEngine if available (with CLIP-based text search)
        if SEARCH_ENGINE_AVAILABLE and search_engine:
            try:
                results = search_engine.search(query_text=query_text, k=k)
                return jsonify({
                    "results": results,
                    "count": len(results),
                    "query_text": query_text,
                    "method": "clip_search"
                })
            except Exception as e:
                print(f"SearchEngine search failed: {e}")
                # Fall back to basic text matching
        
        # Fallback: Simple text-based filtering using metadata
        matching_results = []
        query_words = query_text.split()
        
        for i, item in enumerate(metadata):
            # Check if any query word appears in the image metadata
            item_text = str(item).lower()
            if any(word in item_text for word in query_words):
                result_path = item.get("image_path", f"image_{i}")
                matching_results.append(result_path)
                if len(matching_results) >= k:
                    break
        
        return jsonify({
            "results": matching_results,
            "count": len(matching_results),
            "query_text": query_text,
            "method": "keyword_search"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search_multimodal', methods=['POST'])
def search_multimodal():
    """Search using both text and image inputs with the SearchEngine"""
    try:
        if not (SEARCH_ENGINE_AVAILABLE and search_engine):
            return jsonify({"error": "SearchEngine not available"}), 503
        
        query_text = request.form.get('q', '')
        k = int(request.form.get('k', 10))
        
        # Handle image input
        query_image_path = None
        if 'file' in request.files and request.files['file'].filename != '':
            file = request.files['file']
            # Save temporarily for processing
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
                file.save(tmp.name)
                query_image_path = tmp.name
        
        if not query_text and not query_image_path:
            return jsonify({"error": "Provide either text query or image"}), 400
        
        # Use SearchEngine for multimodal search
        results = search_engine.search(
            query_text=query_text if query_text else None,
            query_image=query_image_path,
            k=k
        )
        
        # Clean up temporary file
        if query_image_path and os.path.exists(query_image_path):
            os.unlink(query_image_path)
        
        return jsonify({
            "results": results,
            "count": len(results),
            "query_text": query_text,
            "has_image": query_image_path is not None,
            "method": "multimodal_clip_search"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add recommendation functionality directly to Flask
import json
import pandas as pd

# Load dataset for recommendations
try:
    DATASET_PATH = DATA_DIR.parent / 'public' / 'dataset' / 'dataset.json'
    with open(DATASET_PATH, 'r') as f:
        dataset = json.load(f)
        recommendation_df = pd.DataFrame(dataset['items'])
        print(f"Loaded dataset with {len(recommendation_df)} items for recommendations")
except Exception as e:
    recommendation_df = None
    print(f"Warning: Could not load recommendation dataset - {e}")

def recommend_products(tags, gender=None, top_n=6):
    """Simple content-based filtering"""
    if recommendation_df is None:
        return []
    
    mask = (
        recommendation_df['name'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags)) |
        recommendation_df['category'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags)) |
        recommendation_df['subcategory'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags)) |
        recommendation_df['color'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags))
    )
    if gender and gender != 'other':
        mask = mask & (recommendation_df['gender'].str.lower() == gender.lower())
    
    recs = recommendation_df[mask].head(top_n)
    return recs.to_dict(orient='records')

@app.route('/recommend', methods=['POST'])
def recommend():
    """Product recommendation endpoint"""
    try:
        data = request.json
        tags_str = data.get('tags', '')
        gender = data.get('gender', 'other')
        
        if isinstance(tags_str, str):
            tag_list = [t.strip() for t in tags_str.split(',') if t.strip()]
        else:
            tag_list = tags_str
        
        recs = recommend_products(tag_list, gender)
        return jsonify({"recommendations": recs})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting Fashion Search & Recommendation Server...")
    print(f"Server will be available at: http://localhost:5000")
    print(f"Health check: http://localhost:5000/")
    print(f"Search Engine available: {SEARCH_ENGINE_AVAILABLE}")
    app.run(host="0.0.0.0", port=5000, debug=True)
