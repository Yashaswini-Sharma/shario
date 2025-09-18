# AI-Powered Product Upload Setup Guide

This guide will help you set up the AI-powered image tagging system for the Shario fashion application.

## 🚀 Quick Start Summary

You now have a complete AI-powered product upload system that:

✅ **Automatically tags images** using BLIP + KeyBERT ML models
✅ **Uses Gemini AI** to determine gender and missing metadata  
✅ **Saves to MongoDB** in dataset.json format
✅ **Modern UI** with drag-and-drop image upload
✅ **Fallback handling** when services are unavailable

## 🛠️ Setup Requirements

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/shario

# Google Gemini AI API Key (Free tier: https://ai.google.dev/)
GEMINI_API_KEY=your_gemini_api_key_here

# Python ML Service URL
PYTHON_API_URL=http://localhost:5000/predict
```

### 2. MongoDB Setup

Install and start MongoDB:

```bash
# On Ubuntu/Debian
sudo apt install mongodb
sudo systemctl start mongodb

# Or use MongoDB Atlas (cloud)
# Get connection string from https://cloud.mongodb.com
```

### 3. Get Gemini API Key (Free!)

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Click "Get API Key"  
3. Create a new project or use existing
4. Generate API key
5. Add to your `.env.local` file

### 4. Python ML Service Setup

The ML service uses BLIP for image captioning and KeyBERT for tag extraction:

```bash
# Navigate to ML service directory
cd image_tag

# Activate virtual environment
source ../.venv/bin/activate

# Install dependencies (already done)
pip install -r requirements.txt flask uvicorn fastapi pandas

# Start the ML service
python server.py
```

### 5. Start the Application

```bash
# Start Next.js dev server
npm run dev
# or
pnpm dev

# Visit http://localhost:3000/browse
```

## 🧠 How It Works

### 1. Image Upload Process

1. **User uploads image** → Browse page (`/browse`)
2. **Image sent to Python ML service** → BLIP generates caption + KeyBERT extracts tags
3. **Gemini AI enhances metadata** → Determines gender, category, colors, etc.
4. **Saved to MongoDB** → Structured in dataset.json format
5. **Success response** → Shows AI analysis results

### 2. ML Model Capabilities

**BLIP Model**: Generates natural language descriptions of fashion items
- Example: "a woman wearing a blue dress with floral patterns"

**KeyBERT Model**: Extracts fashion-relevant keywords
- Example tags: ["dress", "floral", "summer", "casual", "blue"]

**Gemini AI**: Enhances and structures metadata
- Determines: gender, category, subcategory, color, season, usage, article type
- Generates proper product names
- Provides fallbacks when uncertain

### 3. Data Format

Items are saved in MongoDB with this structure (matching dataset.json):

```json
{
  "id": 1698765432123,
  "name": "Women Blue Floral Summer Dress",
  "image": "/dataset/images/item_1698765432123.jpg",
  "category": "Apparel", 
  "subcategory": "Topwear",
  "gender": "Women",
  "color": "Blue",
  "season": "Summer", 
  "usage": "Casual",
  "year": 2025,
  "articleType": "Dresses",
  "tags": ["dress", "floral", "summer", "casual"],
  "caption": "a woman wearing a blue dress with floral patterns",
  "uploadedAt": "2025-09-18T10:30:00.000Z"
}
```

## 🔧 API Endpoints

### POST `/api/upload`

Uploads and processes fashion images with AI.

**Request**: `multipart/form-data`
- `image`: Image file (required)
- `category`, `gender`, `color`, etc.: Optional manual overrides

**Response**: 
```json
{
  "success": true,
  "item": { /* processed item */ },
  "message": "Product uploaded and tagged successfully!"
}
```

## 🎯 Features

### ✨ Smart AI Features

- **Automatic Gender Detection**: Uses Gemini to determine Men/Women/Unisex
- **Random Gender Assignment**: Falls back to random selection when unclear  
- **Color Recognition**: Identifies primary colors in fashion items
- **Category Classification**: Apparel, Footwear, Accessories, etc.
- **Seasonal Detection**: Summer, Winter, Fall, Spring appropriateness
- **Usage Context**: Casual, Formal, Sports, Party, Ethnic

### 🛡️ Robust Error Handling

- **ML Service Offline**: Continues with manual metadata + Gemini
- **Gemini API Unavailable**: Uses smart defaults and random gender
- **MongoDB Issues**: Shows helpful error messages
- **Network Problems**: Graceful fallbacks throughout

### 📱 Modern UI/UX

- **Drag & Drop Upload**: Modern file upload interface
- **Real-time Preview**: See image before upload
- **Loading States**: Visual feedback during AI processing
- **Results Display**: Beautiful presentation of AI analysis
- **Manual Override**: Optional manual metadata input

## 🚀 Usage Example

1. Go to `/browse` page
2. Drag and drop a fashion image
3. Click "Upload & Auto-Tag"  
4. Watch as AI:
   - Generates description
   - Extracts relevant tags
   - Determines gender, category, colors
   - Creates proper product name
   - Saves to database

## 🐛 Troubleshooting

### Common Issues:

**"Module not found: mongodb"**
- Run: `npm install mongodb` or `pnpm install mongodb`

**"ML service error: fetch failed"**
- Start Python service: `cd image_tag && python server.py`

**"Gemini API 403 Forbidden"**
- Add valid `GEMINI_API_KEY` to `.env.local`

**"MongoDB connection error"**
- Add valid `MONGODB_URI` to `.env.local`
- Start MongoDB service

### Check Service Status:

```bash
# Python ML service should show:
# * Running on http://127.0.0.1:5000

# MongoDB should be accessible:
# mongo --eval "db.stats()"

# Next.js should show:
# ✓ Ready in XXXXms
```

## 🎉 Success!

Your AI-powered fashion tagging system is now ready! The system automatically:

- 🤖 Tags images using state-of-the-art ML models
- 🎯 Determines gender and metadata with Gemini AI  
- 📊 Saves structured data to MongoDB
- 🎨 Provides beautiful user interface
- 🛡️ Handles errors gracefully

Visit `/browse` to start uploading and tagging fashion items!
