# EquiHome Traffic Light System - Master Setup Guide

## API Keys and Environment Variables (Internal Use Only)

### Frontend (.env)
```bash
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZXF1aWhvbWVwYXJ0bmVycyIsImEiOiJjbTNzZGJ6ZHgwN281MmlvdHVhbTlsZWJmIn0.RDjB1kTaLmp67lc7J0AjiQ
VITE_API_URL=http://localhost:3001
```

### Backend (.env)
```bash
PORT=3001
ML_SERVICE_URL=http://localhost:8000
```

### ML Service (.env)
```bash
OPENAI_API_KEY=sk-iKvmP2yXXXXXXXXXXXXXXXXX  # Internal OpenAI key
```

## Port Configuration
- Frontend: 3000 (Vite dev server)
- Backend: 3001 (Express)
- ML Service: 8000 (FastAPI)

## Complete Setup Guide

### 1. Python Environment Setup
```bash
# Install Python 3.11 if not present
brew install python@3.11

# Create virtual environment
python3.11 -m venv venv311
source venv311/bin/activate

# Install exact package versions
pip install pandas==2.2.3
pip install scikit-learn==1.6.1
pip install fastapi==0.115.11
pip install uvicorn==0.34.0
pip install xgboost==3.0.0
pip install openai==1.66.3
pip install python-dotenv==1.0.1
pip install numpy==2.2.4
pip install pydantic==1.10.13
pip install joblib==1.3.2
```

### 2. Node.js Setup
```bash
# Install dependencies in root directory
npm install

# Install frontend dependencies
cd frontend && npm install
```

### 3. Database and Data Files
Required data files (should be present in /data directory):
- filtered_postcodes.geojson
- boundaries.json
- zone_metrics.json

### 4. Starting Services

#### Option 1: Start All Services
```bash
npm run start-all
```

#### Option 2: Manual Start (in order)
```bash
# 1. Start ML Service (Terminal 1)
source venv311/bin/activate
python3.11 start_ml_service.py

# 2. Start Backend (Terminal 2)
npm run dev:backend

# 3. Start Frontend (Terminal 3)
cd frontend
npm run dev
```

## Verification Steps

1. Check ML Service:
```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy"}
```

2. Check Backend:
```bash
curl http://localhost:3001/api/boundaries
# Should return GeoJSON data
```

3. Check Frontend:
- Open http://localhost:3000
- Map should load with Mapbox
- Zones should be visible
- Metrics should update on zone selection

## Common Issues & Solutions

### Port Conflicts
```bash
# Kill processes on specific ports
sudo lsof -i :3000 -t | xargs kill -9
sudo lsof -i :3001 -t | xargs kill -9
sudo lsof -i :8000 -t | xargs kill -9
```

### Python Issues
```bash
# Verify Python version
python3.11 --version  # Should be 3.11.x

# Verify packages
python3.11 -c "import pandas; import xgboost; import fastapi; print('OK')"
```

### Node.js Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm install
cd frontend && npm install
```

## Development Notes

### Frontend
- Using Vite + React + TypeScript
- MapboxGL for visualization
- WebSocket connection to backend for real-time updates

### Backend
- Express + TypeScript
- WebSocket server for real-time metrics
- Proxies requests to ML service

### ML Service
- FastAPI
- XGBoost model for predictions
- GPT-4 integration for insights

## Deployment

Currently running internally on:
- Development: localhost (ports 3000, 3001, 8000)
- Staging: internal-staging.equihome.com
- Production: internal.equihome.com

## Internal Tools

### Scripts
```bash
# Rebuild ML models
python3.11 scripts/rebuild_models.py

# Update zone metrics
python3.11 scripts/update_metrics.py

# Test ML predictions
python3.11 scripts/test_predictions.py
```

### Monitoring
- ML Service logs: `logs/ml_service.log`
- Backend logs: `logs/backend.log`
- Error tracking: Internal Sentry instance

## Support

Internal contacts:
- Frontend issues: frontend@equihome.internal
- Backend/ML issues: ml@equihome.internal
- Data updates: data@equihome.internal 