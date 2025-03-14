import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import { createServer } from 'http';

const app = express();

app.use(cors());
app.use(express.json());

interface ZoneMetrics {
  growth_rate: number;
  crime_rate: number;
  infrastructure_score: number;
  school_rating: number;
  employment_rate: number;
  sentiment: number;
  interest_rate: number;
  wages: number;
  housing_supply: 'Low' | 'Moderate' | 'High';
  immigration: 'Decreasing' | 'Stable' | 'Increasing';
  description?: string;
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

const calculateRiskScore = (metrics: ZoneMetrics, model: string = 'AGBoost'): number => {
  // Only AGBoost is implemented in Phase 1
  if (model === 'AGBoost') {
    const score =
      // Growth rate: 0-10 scale, weight 25
      (metrics.growth_rate * 2.5) +
      // Crime rate: Lower is better, weight 20
      ((100 - metrics.crime_rate) / 100) * 20 +
      // Infrastructure: 0-100 scale, weight 15
      (metrics.infrastructure_score / 100) * 15 +
      // Sentiment: -1 to 1 scale, weight 15
      ((metrics.sentiment + 1) / 2) * 15 +
      // Interest rate: Lower is better (0-10 scale), weight 10
      ((10 - Math.min(metrics.interest_rate, 10)) / 10) * 10 +
      // Wages: 0-10 scale, weight 5
      (metrics.wages / 10) * 5 +
      // Housing supply: High=5, Moderate=3, Low=1, weight 5
      (metrics.housing_supply === 'High' ? 5 : metrics.housing_supply === 'Moderate' ? 3 : 1) +
      // Immigration: Increasing=5, Stable=3, Decreasing=1, weight 5
      (metrics.immigration === 'Increasing' ? 5 : metrics.immigration === 'Stable' ? 3 : 1);

    return Math.round(score);
  }
  
  // Return placeholder scores for other models
  return 0;
};

const getTrend = (score: number): string => {
  if (score > 75) return 'Trending toward green';
  if (score >= 50) return 'Stable Yellow';
  return 'Stable Red';
};

const getColor = (score: number): string => {
  if (score > 75) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
};

// Global variables for metrics
const zoneMetrics: { [key: string]: ZoneMetrics } = {
  '2000': {
    growth_rate: 5.2,
    crime_rate: 1.2,
    infrastructure_score: 8.5,
    school_rating: 9.0,
    employment_rate: 95.2,
    sentiment: 0.85,
    interest_rate: 4.5,
    wages: 8.5,
    housing_supply: 'High',
    immigration: 'Increasing',
    description: 'Sydney CBD - Major business district with excellent amenities'
  },
  '2026': {
    growth_rate: 4.8,
    crime_rate: 1.5,
    infrastructure_score: 8.0,
    school_rating: 8.5,
    employment_rate: 94.0,
    sentiment: 0.82,
    interest_rate: 4.5,
    wages: 7.8,
    housing_supply: 'Moderate',
    immigration: 'Stable',
    description: 'Bondi - Coastal suburb with strong property market'
  },
  '2028': {
    growth_rate: 4.5,
    crime_rate: 1.0,
    infrastructure_score: 9.0,
    school_rating: 9.5,
    employment_rate: 96.0,
    sentiment: 0.88,
    interest_rate: 4.5,
    wages: 9.0,
    housing_supply: 'Low',
    immigration: 'Stable',
    description: 'Double Bay - Premium harbor-side location'
  }
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

// Endpoint for zone data
app.get('/zones', (req, res) => {
  const selectedModel = req.query.model as string || 'AGBoost';
  const enhancedZones: { [key: string]: EnhancedZoneMetrics } = {};

  const zones = Object.entries(zoneMetrics).reduce((acc, [postcode, metrics]) => {
    const risk_score = calculateRiskScore(metrics, selectedModel);
    console.log(`Calculating risk score for ${postcode} using ${selectedModel}:`, {
      metrics,
      risk_score,
      color: getColor(risk_score)
    });
    acc[postcode] = {
      color: getColor(risk_score),
      metrics: {
        ...metrics,
        risk_score,
        trend: getTrend(risk_score)
      }
    };
    return acc;
  }, {} as any);

  console.log('Final zones data:', zones);

  const correlations: Correlation[] = [
    {
      factor1: 'Market Liquidity',
      factor2: 'Infrastructure',
      strength: 0.85,
      confidence: 0.68
    },
    {
      factor1: 'Development Activity',
      factor2: 'Transport Access',
      strength: 0.85,
      confidence: 0.72
    },
    {
      factor1: 'Property Values',
      factor2: 'Infrastructure',
      strength: 0.92,
      confidence: 0.85
    },
    {
      factor1: 'Economic Growth',
      factor2: 'Employment',
      strength: 0.88,
      confidence: 0.82
    }
  ];

  const trendAnalysis = {
    '2000': 'Growth rate increased by 3.2% over the last year',
    '2026': 'Growth rate increased by 2% over the last year',
    '2028': 'Growth rate increased by 2.5% over the last year'
  };

  Object.keys(zones).forEach(zoneId => {
    enhancedZones[zoneId] = calculateEnhancedMetrics(zoneId);
  });

  res.json({
    zones: enhancedZones,
    portfolioMetrics,
    correlations,
    modelPerformance: mlPerformance,
    activeModel: selectedModel,
    featureImportance: {
      growth_rate: 25,
      crime_rate: 20,
      infrastructure_score: 15,
      sentiment: 15,
      interest_rate: 10,
      wages: 5,
      housing_supply: 5,
      immigration: 5
    },
    trendAnalysis
  });
});

// Endpoint for GeoJSON boundaries
app.get('/boundaries', (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'transformed_postcodes.geojson');
    console.log('Reading GeoJSON from:', filePath);
    const boundaries = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(boundaries);
  } catch (error) {
    console.error('Error reading GeoJSON file:', error);
    res.status(500).json({ error: 'Failed to load boundary data' });
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
}); 