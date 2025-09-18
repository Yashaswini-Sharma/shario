#!/bin/bash

# Create data directory
mkdir -p data

echo "🚀 Fetching Hugging Face fashion dataset..."

# Fetch different batches of data
echo "📥 Fetching batch 1 (offset 0)..."
curl -s "https://datasets-server.huggingface.co/rows?dataset=ashraq%2Ffashion-product-images-small&config=default&split=train&offset=0&length=100" > data/batch_0.json

echo "📥 Fetching batch 2 (offset 100)..."
curl -s "https://datasets-server.huggingface.co/rows?dataset=ashraq%2Ffashion-product-images-small&config=default&split=train&offset=100&length=100" > data/batch_1.json

echo "📥 Fetching batch 3 (offset 200)..."
curl -s "https://datasets-server.huggingface.co/rows?dataset=ashraq%2Ffashion-product-images-small&config=default&split=train&offset=200&length=100" > data/batch_2.json

echo "✅ Fetched raw data to data/ directory"
echo "Files created:"
ls -la data/batch_*.json

echo ""
echo "📊 Quick stats:"
echo "Batch 0 rows: $(jq '.rows | length' data/batch_0.json)"
echo "Batch 1 rows: $(jq '.rows | length' data/batch_1.json)"
echo "Batch 2 rows: $(jq '.rows | length' data/batch_2.json)"

echo ""
echo "🏷️ Sample categories in batch 0:"
jq -r '.rows[0:5] | .[] | .row | "\(.gender) - \(.masterCategory) - \(.articleType)"' data/batch_0.json

echo ""
echo "✨ Ready to process data! Use the Node.js script to convert to your format."