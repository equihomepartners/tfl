# EquiHome Traffic Light System

A comprehensive real estate analysis system that combines machine learning predictions with real-time market data to provide investment insights.

## Environment Setup

1. Create a `.env` file in the root directory:
```bash
ML_SERVICE_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_api_key_here
```

2. Create a `.env` file in the frontend directory:
```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

3. Install Node.js dependencies:
```bash
# Install Node.js dependencies
npm install
cd frontend && npm install
```

4. Set up Python environment:
```bash
# Install Python 3.11 (if not already installed)
brew install python@3.11

# Create and activate virtual environment
python3.11 -m venv venv311
source venv311/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installations
python3.11 -c "import pandas; import xgboost; import fastapi; import uvicorn; print('All ML dependencies installed successfully!')"
```

## Important ML Service Requirements

The ML service requires specific versions of Python packages to function correctly:
- Python 3.11 (not 3.13 or other versions)
- pandas==2.2.3
- scikit-learn==1.6.1
- fastapi==0.115.11
- uvicorn==0.34.0
- xgboost==3.0.0
- openai==1.66.3
- python-dotenv==1.0.1
- numpy==2.2.4
- pydantic==1.10.13
- joblib>=1.1.0

Common issues and solutions:
1. If you see "ModuleNotFoundError", make sure you're using the correct virtual environment (venv311)
2. If port 8000 is in use, run `npm run kill:ports` to clear it
3. Always use `source venv311/bin/activate` before starting the ML service
4. The ML service must be running before starting the backend

## Quick Start

To start all services (frontend, backend, and ML) with a single command:

```bash
npm run start-all
```

This will:
1. Clear any existing processes on ports 3000, 3001, and 8000
2. Start the ML prediction service on port 8000 (using Python 3.11)
3. Start the backend server on port 3000
4. Start the frontend development server on port 3001

The application will be available at:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- ML Service: http://localhost:8000

## Manual Start

If you need to start services individually:

1. Start the ML service:
```bash
source venv311/bin/activate && python3.11 start_ml_service.py
```

2. Start the backend:
```bash
npm run dev:backend
```

3. Start the frontend:
```bash
npm run dev:frontend
```

## Development

- Backend runs on port 3000 (TypeScript/Node.js)
- Frontend runs on port 3001 (React/TypeScript)
- ML Service runs on port 8000 (Python/FastAPI)
- Uses Mapbox for visualization (ensure you have a valid token in `.env`)
- Uses OpenAI GPT-4 for AI insights (ensure you have a valid API key in `.env`)

## Additional Commands

- `npm run build` - Build both frontend and backend
- `npm run restart` - Restart all services
- `npm run kill:ports` - Clear ports 3000, 3001, and 8000 