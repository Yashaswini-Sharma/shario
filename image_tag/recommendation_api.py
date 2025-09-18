import json
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import numpy as np
import pandas as pd
import os

# Load dataset
DATASET_PATH = os.path.join(os.path.dirname(__file__), '../public/dataset/dataset.json')
with open(DATASET_PATH, 'r') as f:
    dataset = json.load(f)
    items = dataset['items']

df = pd.DataFrame(items)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def recommend_products(tags: List[str], gender: str = None, top_n: int = 6):
    # Simple content-based filtering: match tags to name, category, subcategory, color
    mask = (
        df['name'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags)) |
        df['category'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags)) |
        df['subcategory'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags)) |
        df['color'].str.lower().apply(lambda x: any(tag.lower() in x for tag in tags))
    )
    if gender and gender != 'other':
        mask = mask & (df['gender'].str.lower() == gender.lower())
    recs = df[mask].head(top_n)
    return recs.to_dict(orient='records')

@app.post("/recommend")
async def recommend(
    tags: str = Form(...),
    gender: str = Form('other')
):
    # tags: comma-separated string
    tag_list = [t.strip() for t in tags.split(',') if t.strip()]
    recs = recommend_products(tag_list, gender)
    return {"recommendations": recs}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
