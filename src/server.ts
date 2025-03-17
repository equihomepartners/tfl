import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import { createServer } from 'http';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Add /api prefix to all routes
const router = express.Router();
app.use('/api', router);

interface ZoneMetrics {
  growth_rate: number | null;
  crime_rate: number | null;
  infrastructure_score: number | null;
  school_rating: number | null;
  employment_rate: number | null;
  sentiment: number | null;
  interest_rate: number | null;
  wages: number | null;
  housing_supply: string | null;
  immigration: string | null;
  description: string | null;
}

interface ModelPerformance {
  accuracy: number;
  data_points: number;
  uptime: number;
  response_time: number;
  status: 'active' | 'disabled';
}

interface Correlation {
  factor1: string;
  factor2: string;
  strength: number;
  confidence: number;
}

interface EnhancedZoneMetrics extends ZoneMetrics {
  market_dynamics: {
    avg_time_on_market: number;
    sales_velocity: 'Low' | 'Moderate' | 'High';
    price_trend: number;
    liquidity_score: number;
  };
  property_mix: {
    single_family_percent: number;
    townhouse_percent: number;
    apartment_percent: number;
    median_single_family_price: number;
    price_per_sqft: number;
  };
  investment_metrics: {
    projected_roi_5yr: number;
    rental_yield: number;
    market_volatility: 'Low' | 'Moderate' | 'High';
    development_risk: 'Low' | 'Moderate' | 'High';
  };
  demographics: {
    population_growth_rate: number;
    median_age: number;
    median_household_income: number;
    income_growth_rate: number;
  };
  ai_analysis: {
    key_strengths: string[];
    watch_points: string[];
    overall_recommendation: string;
    confidence_score: number;
  };
}

interface WebSocketMessage {
  type: string;
  zoneId?: string;
}

interface PredictionResponse {
  postcode: string;
  predicted_score: number;
  zone_category: string;
  timestamp: string;
  ai_insights: {
    summary: string;
    full_analysis: string;
    confidence: number;
    generated_by: string;
  };
}

interface EnhancedZone {
  color: string;
  metrics: ZoneMetrics & {
    risk_score: number;
  };
  ai_insights: {
    summary: string;
    full_analysis: string;
    confidence: number;
    generated_by: string;
  };
}

interface AIInsight {
  summary: string;
  confidence: number;
  sources: string[];
}

const defaultMetrics: ZoneMetrics = {
  growth_rate: null,
  crime_rate: null,
  infrastructure_score: null,
  school_rating: null,
  employment_rate: null,
  sentiment: null,
  interest_rate: null,
  wages: null,
  housing_supply: null,
  immigration: null,
  description: null
};

const defaultAIInsight: AIInsight = {
  summary: "No Data Processed",
  confidence: 0,
  sources: []
};

const getDefaultZoneData = (postcode: string): ZoneMetrics => ({
  ...defaultMetrics,
  description: `Zone ${postcode} - No data available`
});

// Update the metrics handling
const zoneMetrics: { [key: string]: ZoneMetrics } = {
  '2000': getDefaultZoneData('2000'),
  '2026': getDefaultZoneData('2026'),
  '2028': getDefaultZoneData('2028')
};

const mlPerformance: { [key: string]: ModelPerformance } = {
  AGBoost: {
    accuracy: 0.92,
    data_points: 15000,
    uptime: 99.9,
    response_time: 0.15,
    status: 'active'
  },
  EquiVision: {
    accuracy: 0.94,
    data_points: 20000,
    uptime: 99.8,
    response_time: 0.18,
    status: 'active'
  },
  XGBoost: {
    accuracy: 0.89,
    data_points: 12000,
    uptime: 99.5,
    response_time: 0.12,
    status: 'disabled'
  },
  LightGBM: {
    accuracy: 0.88,
    data_points: 10000,
    uptime: 99.4,
    response_time: 0.10,
    status: 'disabled'
  },
  CatBoost: {
    accuracy: 0.87,
    data_points: 11000,
    uptime: 99.3,
    response_time: 0.11,
    status: 'disabled'
  },
  NeuralNetwork: {
    accuracy: 0.86,
    data_points: 9000,
    uptime: 99.2,
    response_time: 0.20,
    status: 'disabled'
  }
};

const portfolioMetrics = {
  total_zones: 10,
  avg_risk_score: 7.2,
  high_potential_zones: 3,
  model_accuracy: 0.92
};

// Color mapping function
const getColor = (score: number): string => {
  if (score >= 0.7) return '#4CAF50'; // Green
  if (score >= 0.4) return '#FFC107'; // Yellow
  return '#F44336'; // Red
};

interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    POA_CODE21: string;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// Load GeoJSON data once at startup
const geojsonPath = path.join(__dirname, '../data/filtered_postcodes.geojson');
const boundariesData: GeoJSONData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

// Helper function to get postcode from feature
const getPostcode = (feature: GeoJSONFeature): string => feature.properties.POA_CODE21;

// Helper function to get zone data by postcode
const getZoneData = (postcode: string): ZoneMetrics => {
  return zoneMetrics[postcode] || getDefaultZoneData(postcode);
};

// Endpoint for zone data
router.get('/zones', async (req, res) => {
  try {
    const model = req.query.model || 'AGBoost';
    
    // Get the list of postcodes from the boundaries data
    const postcodes = boundariesData.features.map(getPostcode);
    
    // Prepare the data for the ML service with the correct format
    const predictionData = {
      zones: postcodes.map(postcode => ({
        postcode,
        growth_rate: 3.5,  // 3.5% average growth
        crime_rate: 1.2,   // 1.2 per 1000 residents
        infrastructure_score: 6.5,  // 6.5/10
        sentiment: 0.65,    // 65% positive
        interest_rate: 4.5, // 4.5%
        wages: 85000,      // $85,000 average
        housing_supply_encoded: 0.5,  // 0.5 for Moderate
        immigration_encoded: 0.5      // 0.5 for Stable
      }))
    };

    console.log('Sending prediction request:', JSON.stringify(predictionData, null, 2));

    // Call the ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, predictionData.zones);
    
    if (!mlResponse.data) {
      throw new Error('No data received from ML service');
    }

    console.log('ML service response:', JSON.stringify(mlResponse.data, null, 2));

    // Handle both array and object response formats
    const predictions = Array.isArray(mlResponse.data) ? mlResponse.data : 
                       mlResponse.data.predictions ? mlResponse.data.predictions :
                       [mlResponse.data];

    const zones = predictions.reduce((acc: any, prediction: any) => {
      const zoneData = predictionData.zones.find(z => z.postcode === prediction.postcode);
      acc[prediction.postcode] = {
        metrics: {
          risk_score: prediction.predicted_score ?? prediction.score ?? 65, // Default to moderate risk
          growth_rate: zoneData?.growth_rate ?? 3.5,
          crime_rate: zoneData?.crime_rate ?? 1.2,
          infrastructure_score: zoneData?.infrastructure_score ?? 6.5,
          sentiment: zoneData?.sentiment ?? 0.65,
          interest_rate: zoneData?.interest_rate ?? 4.5,
          wages: zoneData?.wages ?? 85000,
          housing_supply: zoneData?.housing_supply_encoded === 0.5 ? "Moderate" : 
                        zoneData?.housing_supply_encoded === 1.0 ? "High" : "Low",
          immigration: zoneData?.immigration_encoded === 0.5 ? "Stable" :
                      zoneData?.immigration_encoded === 1.0 ? "Increasing" : "Decreasing",
          description: `${prediction.postcode} - Sydney Metropolitan Area`,
          employment_rate: 95,  // Default employment rate
          school_rating: 8.0    // Default school rating
        },
        color: prediction.predicted_score >= 75 ? '#4CAF50' : 
               prediction.predicted_score >= 50 ? '#FFC107' : '#F44336',
        ai_insights: prediction.ai_insights ?? {
          summary: "Based on current market data, this zone shows moderate investment potential with balanced risk-reward characteristics.",
          confidence: 85,
          sources: ["Market Analysis", "Economic Indicators", "Demographic Data"]
        }
      };
      return acc;
    }, {});

    // Add model performance metrics
    const modelPerformance = {
      [model as string]: {
        accuracy: 0.92,
        data_points: 1000,
        uptime: 0.999,
        response_time: 150,
        status: 'active'
      }
    };

    res.json({
      zones,
      mlServiceStatus: { isActive: true, message: '' },
      modelPerformance,
      portfolioMetrics: {
        avg_loan_size: 750000,
        avg_ltv: 0.75,
        avg_property_value: 1000000,
        zone_distribution: {
          green: 0.4,
          yellow: 0.4,
          red: 0.2
        }
      }
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ 
      error: 'Failed to fetch zones data',
      mlServiceStatus: { 
        isActive: false, 
        message: 'ML service is currently unavailable. Using fallback data.' 
      }
    });
  }
});

// Endpoint for zone boundaries
router.get('/boundaries', (req, res) => {
  try {
    res.json(boundariesData);
  } catch (error) {
    console.error('Error serving boundaries:', error);
    res.status(500).json({ error: 'Failed to serve boundaries' });
  }
});

// Add WebSocket support
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');

  // Send initial data
  ws.send(JSON.stringify({
    type: 'INITIAL_DATA',
    data: {
      zones: zoneMetrics,
      modelPerformance: mlPerformance,
      portfolioMetrics
    }
  }));

  // Handle real-time updates (to be integrated with ML pipeline)
  ws.on('message', (messageData: WebSocket.RawData) => {
    const message = JSON.parse(messageData.toString()) as WebSocketMessage;
    if (message.type === 'REQUEST_ZONE_UPDATE' && message.zoneId) {
      const zoneUpdate = calculateEnhancedMetrics(message.zoneId);
      ws.send(JSON.stringify({
        type: 'ZONE_UPDATE',
        data: zoneUpdate
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Enhanced metrics calculation (placeholder for ML integration)
function calculateEnhancedMetrics(zoneId: string): EnhancedZoneMetrics {
  // This will be replaced with actual ML model calculations
  return {
    ...zoneMetrics[zoneId],
    market_dynamics: {
      avg_time_on_market: 28,
      sales_velocity: 'High',
      price_trend: 5.2,
      liquidity_score: 0.85
    },
    property_mix: {
      single_family_percent: 70,
      townhouse_percent: 20,
      apartment_percent: 10,
      median_single_family_price: 1200000,
      price_per_sqft: 850
    },
    investment_metrics: {
      projected_roi_5yr: 45,
      rental_yield: 4.2,
      market_volatility: 'Low',
      development_risk: 'Moderate'
    },
    demographics: {
      population_growth_rate: 2.8,
      median_age: 35,
      median_household_income: 120000,
      income_growth_rate: 3.2
    },
    ai_analysis: {
      key_strengths: [
        'Strong transportation links',
        'Growing young professional demographic',
        'Stable property appreciation',
        'Low market volatility'
      ],
      watch_points: [
        'Monitor development applications',
        'Track rental yield trends',
        'Observe zoning changes'
      ],
      overall_recommendation: 'Strong investment potential with stable growth indicators',
      confidence_score: 0.85
    }
  };
}

// Start the server with WebSocket support
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
}); 