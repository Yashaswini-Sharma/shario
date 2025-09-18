"use client";

import { useState } from "react";

interface ProductItem {
  id: number;
  name: string;
  image: string;
  category: string;
  subcategory: string;
  gender: string;
  color: string;
  season: string;
  usage: string;
  year: number;
  articleType: string;
  tags: string[];
  caption?: string;
}

export default function ImageTagPage() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedItem, setUploadedItem] = useState<ProductItem | null>(null);
  
  // Optional manual metadata override
  const [showManualFields, setShowManualFields] = useState(false);
  const [manualMetadata, setManualMetadata] = useState({
    category: '',
    subcategory: '',
    gender: '',
    color: '',
    season: '',
    usage: '',
    articleType: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setError(null);
      setSuccess(null);
      setUploadedItem(null);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadedItem(null);
    
    const formData = new FormData();
    formData.append("image", image);
    
    // Add manual metadata if provided
    if (showManualFields) {
      Object.entries(manualMetadata).forEach(([key, value]) => {
        if (value.trim()) {
          formData.append(key, value);
        }
      });
    }
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setUploadedItem(data.item);
        setSuccess(data.message || "Product uploaded and tagged successfully!");
        // Reset form
        setImage(null);
        setImagePreview(null);
        setManualMetadata({
          category: '',
          subcategory: '',
          gender: '',
          color: '',
          season: '',
          usage: '',
          articleType: ''
        });
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (e: any) {
      setError(e?.message || "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleManualMetadataChange = (field: string, value: string) => {
    setManualMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Product Upload
        </h1>
        <p className="text-gray-600">
          Upload an image and let our AI automatically tag and categorize your product
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  required 
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-gray-600">Click to upload an image</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Manual override option */}
            <div className="border-t pt-4">
              <button
                type="button"
                onClick={() => setShowManualFields(!showManualFields)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showManualFields ? '△ Hide' : '▽ Show'} Manual Metadata Override
              </button>
              
              {showManualFields && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Category (optional)" 
                    value={manualMetadata.category}
                    onChange={(e) => handleManualMetadataChange('category', e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Gender (optional)" 
                    value={manualMetadata.gender}
                    onChange={(e) => handleManualMetadataChange('gender', e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Color (optional)" 
                    value={manualMetadata.color}
                    onChange={(e) => handleManualMetadataChange('color', e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Article Type (optional)" 
                    value={manualMetadata.articleType}
                    onChange={(e) => handleManualMetadataChange('articleType', e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !image}
              className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing with AI...</span>
                </div>
              ) : (
                "Upload & Auto-Tag"
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">AI Analysis Results</h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing image with AI...</p>
            </div>
          )}

          {uploadedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{uploadedItem.name}</h3>
                <p className="text-sm text-gray-600">ID: {uploadedItem.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Category:</span> {uploadedItem.category}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {uploadedItem.gender}
                </div>
                <div>
                  <span className="font-medium">Color:</span> {uploadedItem.color}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {uploadedItem.articleType}
                </div>
                <div>
                  <span className="font-medium">Season:</span> {uploadedItem.season}
                </div>
                <div>
                  <span className="font-medium">Usage:</span> {uploadedItem.usage}
                </div>
              </div>

              {uploadedItem.caption && (
                <div>
                  <span className="font-medium">AI Description:</span>
                  <p className="text-gray-700 italic">{uploadedItem.caption}</p>
                </div>
              )}

              {uploadedItem.tags && uploadedItem.tags.length > 0 && (
                <div>
                  <span className="font-medium">AI Generated Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedItem.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && !uploadedItem && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p>Upload an image to see AI analysis results</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by BLIP image captioning, KeyBERT tagging, and Google Gemini AI</p>
      </div>
    </div>
  );
}
