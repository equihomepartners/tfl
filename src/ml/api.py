from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import pandas as pd
from predict import PredictionService
import uvicorn
import os
from datetime import datetime

app = FastAPI(
    title="EquiHome Traffic Light System API",
    description="API for zone predictions and traffic light system",
    version="1.0.0"
)

# Initialize the prediction service
predictor = PredictionService()

class ZoneData(BaseModel):
    postcode: str
    growth_rate: float
    crime_rate: float
    infrastructure_score: float
    sentiment: float
    interest_rate: float
    wages: float
    housing_supply_encoded: int
    immigration_encoded: int

class PredictionResponse(BaseModel):
    postcode: str
    predicted_score: float
    zone_category: str
    timestamp: str

class ZoneSummary(BaseModel):
    total_zones: int
    zone_distribution: Dict[str, int]
    average_score: float
    timestamp: str

@app.post("/predict", response_model=List[PredictionResponse])
async def predict_zones(zones: List[ZoneData]):
    """
    Make predictions for a list of zones
    """
    try:
        # Convert input data to DataFrame
        df = pd.DataFrame([zone.dict() for zone in zones])
        
        # Make predictions
        predictions = predictor.predict(df)
        
        # Format response
        response = []
        for _, row in predictions.iterrows():
            response.append({
                "postcode": row['postcode'],
                "predicted_score": float(row['predicted_score']),
                "zone_category": row['zone_category'],
                "timestamp": datetime.now().isoformat()
            })
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/summary", response_model=ZoneSummary)
async def get_summary():
    """
    Get a summary of current zone predictions
    """
    try:
        return predictor.get_zone_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

def main():
    """Run the API server"""
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

if __name__ == "__main__":
    main() 