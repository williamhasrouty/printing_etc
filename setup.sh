#!/bin/bash

echo "🚀 Setting up PrintShop..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   npx json-server --watch db.json --port 3001"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "Happy coding! 🎨"
