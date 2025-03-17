# ML Service

This service provides machine learning predictions for real estate market analysis using XGBoost and OpenAI integration.

## Prerequisites

- Python 3.13 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Quick Start

1. Kill any existing processes on port 8000:
```bash
lsof -i :8000
kill -9 <PID>
```

2. Create and activate a virtual environment:
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Unix/macOS
# or
.\venv\Scripts\activate  # On Windows
```

3. Install ALL dependencies in one go:
```bash
pip install pandas==2.2.3 \
            scikit-learn==1.6.1 \
            fastapi==0.115.11 \
            uvicorn==0.34.0 \
            xgboost==3.0.0 \
            openai==1.66.3 \
            python-dotenv==1.0.1 \
            numpy==2.2.4 \
            pydantic==1.10.13 \
            joblib>=1.1.0 \
            httpx>=0.24.0 \
            starlette<0.28.0,>=0.27.0 \
            beautifulsoup4==4.12.0 \
            requests==2.31.0 \
            PyYAML==6.0.1
```

4. Start the service:
```bash
python3 start_ml_service.py
```

## Environment Variables

Create a `.env` file in the project root with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Project Structure

```
src/
└── ml/
    ├── api.py          # FastAPI application and endpoints
    ├── predict.py      # ML prediction service
    └── models/         # Directory containing trained models
        └── zone_predictor.json  # Main model file
```

## Common Issues & Solutions

1. "Address already in use" error:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

2. "No module named 'xyz'" error:
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall ALL dependencies
pip install -r requirements.txt
```

3. Model loading issues:
- Check if `models/zone_predictor.json` exists
- Ensure all dependencies are installed correctly
- Check Python version compatibility (3.13+ required)

4. OpenAI client issues:
- Verify OPENAI_API_KEY is set in .env file
- Check if openai package is installed correctly

## API Endpoints

### POST /predict

Predicts real estate market conditions for given zones.

Request body format:
```json
{
  "zones": [
    {
      "postcode": "2000",
      "growth_rate": 3.5,
      "crime_rate": 1.2,
      "infrastructure_score": 6.5,
      "sentiment": 0.65,
      "interest_rate": 4.5,
      "wages": 85000,
      "housing_supply_encoded": 0.5,
      "immigration_encoded": 0.5
    }
  ]
}
```

## Dependencies

Core dependencies:
- pandas==2.2.3
- scikit-learn==1.6.1
- fastapi==0.115.11
- uvicorn==0.34.0
- xgboost==3.0.0
- openai==1.66.3
- python-dotenv==1.0.1
- numpy==2.2.4

Additional dependencies:
- pydantic==1.10.13
- joblib>=1.1.0
- httpx>=0.24.0
- starlette<0.28.0,>=0.27.0
- beautifulsoup4==4.12.0
- requests==2.31.0
- PyYAML==6.0.1

## Notes

- The service requires a trained model file (`zone_predictor.json`) in the `models` directory
- OpenAI API key must be set in the `.env` file
- The service runs on port 8000 by default
- Make sure no other service is using port 8000 before starting
- If you get dependency errors, always reinstall ALL dependencies at once
- The service is designed to work with Python 3.13 or higher 