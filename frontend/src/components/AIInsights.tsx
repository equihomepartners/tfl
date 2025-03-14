import { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

interface ZoneData {
  postcode: string;
  metrics: {
    growth_rate: number;
    crime_rate: number;
    infrastructure_score: number;
    interest_rate: number;
    wages: number;
    housing_supply: string;
    immigration: string;
    risk_score: number;
    trend: string;
  };
}

interface AIInsightsProps {
  zoneData: ZoneData;
}

const AIInsights = ({ zoneData }: AIInsightsProps) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const generateInsight = async () => {
      try {
        setLoading(true);
        // For MVP, we'll use a simple rule-based system instead of the ML model
        const { metrics } = zoneData;
        
        const insights: string[] = [];
        
        // Growth analysis
        if (metrics.growth_rate > 5) {
          insights.push(`Strong growth rate of ${metrics.growth_rate}%`);
        } else if (metrics.growth_rate > 2) {
          insights.push(`Moderate growth rate of ${metrics.growth_rate}%`);
        } else {
          insights.push(`Low growth rate of ${metrics.growth_rate}%`);
        }

        // Crime analysis
        if (metrics.crime_rate < 25) {
          insights.push('low crime rates');
        } else if (metrics.crime_rate < 75) {
          insights.push('moderate crime rates');
        } else {
          insights.push('high crime rates');
        }

        // Infrastructure analysis
        if (metrics.infrastructure_score > 50) {
          insights.push('strong infrastructure development');
        } else if (metrics.infrastructure_score > 30) {
          insights.push('moderate infrastructure development');
        } else {
          insights.push('limited infrastructure development');
        }

        // Macro trends analysis
        if (metrics.interest_rate < 5) {
          insights.push('favorable interest rates');
        } else {
          insights.push('high interest rates');
        }

        if (metrics.housing_supply.toLowerCase().includes('high')) {
          insights.push('increasing housing supply');
        } else if (metrics.housing_supply.toLowerCase().includes('moderate')) {
          insights.push('stable housing supply');
        } else {
          insights.push('limited housing supply');
        }

        // Generate final insight
        const trend = metrics.trend === 'green' ? 'positive' : 
                     metrics.trend === 'yellow' ? 'neutral' : 'negative';
        
        const finalInsight = `Postcode ${zoneData.postcode} shows ${insights.join(', ')}. ` +
                           `The area is trending ${trend} with a risk score of ${metrics.risk_score}/100. ` +
                           `Key factors include ${metrics.wages}% wage growth and ${metrics.immigration.toLowerCase()} immigration rates.`;

        setInsight(finalInsight);
      } catch (error) {
        console.error('Error generating insight:', error);
        setInsight('Unable to generate insight at this time.');
      } finally {
        setLoading(false);
      }
    };

    if (zoneData) {
      generateInsight();
    }
  }, [zoneData]);

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI Analysis
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary">
          {insight}
        </Typography>
      )}
    </Paper>
  );
};

export default AIInsights; 