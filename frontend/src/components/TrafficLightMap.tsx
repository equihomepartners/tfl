import React, { useState, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, FillLayer, LineLayer, Popup } from 'react-map-gl';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Container,
  AppBar,
  Toolbar,
  Drawer,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  Button,
  Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip as ChartTooltip } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import AIInsights from './AIInsights';
import '../styles/TrafficLightMap.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { styled } from '@mui/material/styles';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import { SxProps, Theme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';
import NatureIcon from '@mui/icons-material/Nature';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CompareIcon from '@mui/icons-material/Compare';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { alpha } from '@mui/material/styles';
import { MapLayerMouseEvent } from 'react-map-gl';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, ChartTooltip);

interface AIInsights {
  summary: string;
  newsHighlight?: string;
  impact: string;
  confidence: number;
  sources: string[];
}

interface ZoneMetrics {
  growth_rate: number | null;
  crime_rate: number | null;
  infrastructure_score: number | null;
  sentiment: number | null;
  interest_rate: number | null;
  wages: number | null;
  housing_supply: string | null;
  immigration: string | null;
  risk_score: number | null;
  property_price: number | null;
  rental_yield: number | null;
  population_growth: number | null;
  median_income: number | null;
  education_index: number | null;
  transport_score: number | null;
  green_space_ratio: number | null;
  days_on_market: number | null;
  rental_demand: number | null;
  roi_projection: number | null;
  liquidity_score: number | null;
  development_potential: number | null;
  description: string | null;
  postcode: string;
  employment_rate: number | null;
  school_rating: number | null;
  ai_insights: AIInsights | null;
  trend?: string;
}

interface Zone {
  color: string;
  metrics: ZoneMetrics;
}

interface Zones {
  [key: string]: Zone;
}

interface PortfolioMetrics {
  avg_loan_size: number;
  avg_ltv: number;
  avg_property_value: number;
  zone_distribution: {
    green: number;
    yellow: number;
    red: number;
  };
}

interface Correlation {
  factor1: string;
  factor2: string;
  strength: number;
  confidence: number;
}

interface ModelPerformance {
  accuracy: number;
  data_points: number;
  uptime: number;
  response_time: number;
  status: 'active' | 'disabled';
}

interface MLPerformance {
  [key: string]: ModelPerformance;
}

interface ModelInfo {
  description: string;
  version: string;
  status: 'active' | 'disabled';
  badge?: string;
  isProprietaryModel?: boolean;
}

interface AIInsight {
  summary: string;
  confidence: number;
  recommendation?: string;
  full_analysis?: string;
  factors?: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendLabel?: string;
  tooltip?: string;
  aiInsight?: AIInsight;
}

interface MacroEconomicInsight {
  category: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  trend: string;
  source: string;
  lastUpdated: string;
  prediction: string;
  zoneImpact: {
    score: number;
    reasoning: string;
  };
}

interface MLServiceStatus {
  isActive: boolean;
  message: string;
}

const suburbNames: { [key: string]: string } = {
  '2000': 'Sydney CBD',
  '2026': 'Bondi',
  '2028': 'Double Bay'
};

const ModelCard = styled(Card)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  '&:hover:not(.disabled)': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
  '&.disabled': {
    opacity: 0.7,
    cursor: 'not-allowed',
    backgroundColor: theme.palette.action.disabledBackground,
  },
  '&.proprietary': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  }
}));

interface DetailedMetricCardProps {
  title: string;
  value: number | string | null;
  unit?: string;
  description?: string;
}

const DetailedMetricCard: React.FC<DetailedMetricCardProps> = ({ title, value, unit, description }) => (
  <Grid item xs={12} md={4}>
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h6" color="text.primary">
        {value !== null ? `${value}${unit || ''}` : 'No Data'}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {description}
        </Typography>
      )}
    </Paper>
  </Grid>
);

const AIInsightCard: React.FC<{ insight: AIInsight | null; title: string }> = ({ insight, title }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Typography>
        {insight ? insight.summary : 'No Data Processed'}
      </Typography>
      {insight && insight.confidence > 0 && (
        <Typography variant="body2" color="textSecondary">
          Confidence: {insight.confidence}%
        </Typography>
      )}
    </CardContent>
  </Card>
);

const modelInfo: Record<string, ModelInfo> = {
  AGBoost: {
    description: "Training model for v1.0 of the application, optimized for Sydney real estate market analysis.",
    version: "v1.0",
    status: 'active',
    badge: 'Training'
  },
  EquiVision: {
    description: "Our proprietary deep learning model combining computer vision and market dynamics.",
    version: "In Production",
    status: 'disabled',
    isProprietaryModel: true,
    badge: 'In Production'
  },
  XGBoost: {
    description: "Gradient boosting focused on rapid market changes.",
    version: "v2.0 - Coming Soon",
    status: 'disabled'
  },
  LightGBM: {
    description: "Light gradient boosting for high-speed market analysis.",
    version: "v2.0 - Coming Soon",
    status: 'disabled'
  },
  CatBoost: {
    description: "Specialized in categorical feature analysis.",
    version: "v2.0 - Coming Soon",
    status: 'disabled'
  },
  NeuralNetwork: {
    description: "Deep learning for complex pattern recognition.",
    version: "v2.0 - Coming Soon",
    status: 'disabled'
  }
};

const MLPerformanceCard = ({ performance, model }: { performance: ModelPerformance; model: string }) => (
  <Card elevation={3} sx={{ mb: 2, borderRadius: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>{model}</Typography>
        <Chip
          label={performance.status === 'active' ? 'Active' : 'Coming Soon'}
          color={performance.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Accuracy</Typography>
            <Typography variant="h6" color="primary">
              {performance.status === 'active' ? `${(performance.accuracy * 100).toFixed(1)}%` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Data Points</Typography>
            <Typography variant="h6" color="primary">
              {performance.status === 'active' ? performance.data_points.toLocaleString() : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Uptime</Typography>
            <Typography variant="h6" color="primary">
              {performance.status === 'active' ? `${(performance.uptime * 100).toFixed(2)}%` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">Response Time</Typography>
            <Typography variant="h6" color="primary">
              {performance.status === 'active' ? `${performance.response_time}ms` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

interface DashboardCardProps {
  children: React.ReactNode;
  title: string;
  sx?: any;
  action?: React.ReactNode;
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
}

const DashboardCard = ({ 
  children, 
  title, 
  sx = {},
  action
}: DashboardCardProps) => (
  <Card elevation={2} sx={{ 
    height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
    ...sx 
  }}>
    <CardContent sx={{ 
      p: 2, 
      pb: 1, 
      borderBottom: '1px solid', 
      borderColor: 'divider',
      flexShrink: 0
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>{title}</Typography>
        {action}
      </Box>
    </CardContent>
    <CardContent sx={{ 
      p: 2, 
      flexGrow: 1,
      overflow: 'auto'
    }}>
      {children}
    </CardContent>
  </Card>
);

const StatCard = ({ 
  title,
  value,
  trend,
  icon
}: StatCardProps) => (
  <Card sx={{ p: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
      {icon}
    </Box>
    <Typography variant="h5" sx={{ mb: 0.5 }}>{value}</Typography>
    {trend && (
      <Typography variant="caption" color={trend.startsWith('+') ? 'success.main' : 'error.main'}>
        {trend} since last month
      </Typography>
    )}
  </Card>
);

const MetricCard = ({ 
  title,
  value,
  trend,
  trendLabel,
  tooltip,
  aiInsight
}: MetricCardProps) => (
  <Card elevation={3} sx={{ p: 2, height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
          </Tooltip>
        )}
      </Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {value ?? 'N/A'}
      </Typography>

      {trend && (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          pt: 0.5,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography 
            variant="body2" 
            color={trend.startsWith('+') ? 'success.main' : 'error.main'}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          >
            {trend}
          </Typography>
          {trendLabel && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ ml: 1, fontSize: '0.7rem' }}
            >
              {trendLabel}
            </Typography>
          )}
        </Box>
      )}

      {aiInsight && (
        <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <PsychologyIcon sx={{ mr: 0.5, fontSize: '0.9rem', color: 'primary.main' }} />
            <Typography variant="caption" color="primary.main">
              AI Insight
            </Typography>
            <Chip 
              label={`${aiInsight.confidence}%`}
              size="small"
              sx={{ 
                ml: 'auto', 
                bgcolor: 'primary.light', 
                color: 'white',
                height: '16px',
                '& .MuiChip-label': {
                  px: 1,
                  fontSize: '0.65rem'
                }
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {aiInsight.summary}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

const MetricSection = ({ title, icon, children, aiInsight }: { title: string; icon: React.ReactNode; children: React.ReactNode; aiInsight?: { 
  summary: string;
  newsHighlight?: string;
  impact: string;
  confidence: number;
  sources: string[];
} }) => (
  <Accordion defaultExpanded>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <Box>
        {aiInsight && (
          <Paper 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.200',
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <PsychologyIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600 }}>
                AI Market Intelligence
              </Typography>
              <Chip 
                label={`${aiInsight.confidence}% Confidence`}
                size="small"
                sx={{ ml: 'auto', bgcolor: 'primary.main', color: 'white' }}
              />
            </Box>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {aiInsight.summary}
            </Typography>
            {aiInsight.newsHighlight && (
        <Box sx={{ 
                p: 1.5, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.100',
                mb: 1.5
              }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Recent Development: {aiInsight.newsHighlight}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" color="primary.dark" sx={{ mb: 1 }}>
              <strong>Impact:</strong> {aiInsight.impact}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {aiInsight.sources.map((source, index) => (
                <Chip
                  key={index}
                  label={source}
                  size="small"
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'primary.200'
                  }}
                />
              ))}
            </Box>
          </Paper>
        )}
        <Grid container spacing={2}>
          {children}
        </Grid>
      </Box>
    </AccordionDetails>
  </Accordion>
);

const ComprehensiveMetrics = ({ zone }: { zone: Zone }) => {
  const metrics = zone.metrics;

  return (
    <Grid container spacing={3}>
      {/* Risk Assessment */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Risk Assessment
            </Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Risk Score" 
                secondary={metrics.risk_score != null ? `${metrics.risk_score.toFixed(1)}/100` : 'Pending'}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Growth Rate" 
                secondary={metrics.growth_rate != null ? `${metrics.growth_rate.toFixed(1)}%` : 'Pending'}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      {/* Infrastructure */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Infrastructure
            </Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Quality Score" 
                secondary={metrics.infrastructure_score != null ? `${metrics.infrastructure_score.toFixed(1)}/10` : 'Pending'}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Development Status" 
                secondary={metrics.housing_supply || 'Pending'}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      {/* Economic Indicators */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Economic Indicators
            </Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Interest Rate" 
                secondary={metrics.interest_rate != null ? `${metrics.interest_rate.toFixed(1)}%` : 'Pending'}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Average Wages" 
                secondary={metrics.wages != null ? `$${metrics.wages.toLocaleString()}` : 'Pending'}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Immigration Trend" 
                secondary={metrics.immigration || 'Pending'}
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      {/* AI Insights */}
      <Grid item xs={12} md={6} lg={3}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              AI Insights
            </Typography>
          </Box>
          {metrics.ai_insights ? (
            <>
              <Typography variant="body2" color="text.secondary">
                {metrics.ai_insights.summary}
              </Typography>
              {metrics.ai_insights.confidence > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Chip 
                    size="small"
                    label={`${metrics.ai_insights.confidence}% Confidence`}
                    color="primary"
                  />
                </Box>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Analysis in progress...
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const getMetricDisplay = (value: number | null, suffix: string = ''): string => {
  return value === null ? 'No Data Processed' : `${value}${suffix}`;
};

const getRiskColor = (metrics: ZoneMetrics | null): string => {
  if (!metrics || metrics.risk_score === null) return '#808080'; // Gray for no data
  return metrics.risk_score >= 70 ? '#4CAF50' : metrics.risk_score >= 40 ? '#FFC107' : '#F44336';
};

const getGrowthIndicator = (metrics: ZoneMetrics | null): string => {
  if (!metrics || metrics.growth_rate === null) return 'No Data Processed';
  return metrics.growth_rate >= 5 ? 'High Growth' : metrics.growth_rate >= 2 ? 'Moderate Growth' : 'Low Growth';
};

const getInfrastructureLevel = (metrics: ZoneMetrics | null): string => {
  if (!metrics || metrics.infrastructure_score === null) return 'No Data Processed';
  return metrics.infrastructure_score >= 7 ? 'High' : metrics.infrastructure_score >= 4 ? 'Moderate' : 'Low';
};

const getSentimentLevel = (metrics: ZoneMetrics | null): string => {
  if (!metrics || metrics.sentiment === null) return 'No Data Processed';
  return metrics.sentiment >= 0.7 ? 'Positive' : metrics.sentiment >= 0.4 ? 'Neutral' : 'Negative';
};

const getDefaultAIInsights = (): AIInsights => ({
  summary: "No data available for analysis",
  impact: "Unknown",
  confidence: 0,
  sources: []
});

const AustralianMacroAnalysis = () => {
  const macroInsights: MacroEconomicInsight[] = [
    {
      category: 'RBA Monetary Policy',
      impact: 'negative',
      confidence: 94,
      trend: 'Restrictive',
      source: 'RBA',
      lastUpdated: '2024-03-20',
      prediction: 'Cash rate to remain elevated through 2024',
      zoneImpact: {
        score: -0.8,
        reasoning: 'Higher mortgage rates affecting borrowing capacity across major metropolitan areas'
      }
    },
    {
      category: 'Net Migration',
      impact: 'positive',
      confidence: 92,
      trend: 'Strong Increase',
      source: 'ABS',
      lastUpdated: '2024-03-19',
      prediction: 'Record migration levels to continue through 2024-25',
      zoneImpact: {
        score: 0.9,
        reasoning: 'Increased rental demand and housing pressure in major Australian cities'
      }
    },
    {
      category: 'Construction Activity',
      impact: 'positive',
      confidence: 88,
      trend: 'Constrained',
      source: 'HIA',
      lastUpdated: '2024-03-18',
      prediction: 'Building approvals to remain below population-driven demand',
      zoneImpact: {
        score: 0.7,
        reasoning: 'Supply shortages supporting property values in established suburbs'
      }
    },
    {
      category: 'Domestic Economy',
      impact: 'neutral',
      confidence: 86,
      trend: 'Moderate',
      source: 'Treasury',
      lastUpdated: '2024-03-15',
      prediction: 'GDP growth forecast at 2.25% for FY2024-25',
      zoneImpact: {
        score: 0.2,
        reasoning: 'Resilient Australian economy supporting property market stability'
      }
    }
  ];

  return (
    <DashboardCard 
      title="Australian Market Environment"
      sx={{
        background: 'linear-gradient(135deg, #f8f9ff 0%, #fff 100%)',
        mb: 2
      }}
    >
      <Box sx={{ p: 1 }}>
        <Grid container spacing={2}>
          {macroInsights.map((insight, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
            borderRadius: 2,
                  height: '100%'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {insight.category}
                  </Typography>
                  <Chip
                    label={`${insight.confidence}%`}
                    size="small"
                    sx={{ ml: 'auto', height: '20px' }}
                  />
                </Box>

                <Box sx={{ 
                  p: 1, 
                  bgcolor: alpha(
                    insight.impact === 'positive' ? '#4CAF50' : 
                    insight.impact === 'negative' ? '#F44336' : '#FFC107',
                    0.1
                  ),
                  borderRadius: 1,
                  mb: 1
                }}>
                  <Typography variant="caption" display="block">
                    <strong>Trend:</strong> {insight.trend}
            </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Prediction:</strong> {insight.prediction}
                  </Typography>
              </Box>

                <Typography variant="caption" color="text.secondary" display="block">
                  {insight.zoneImpact.reasoning}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
              </Box>
    </DashboardCard>
  );
};

const MacroEconomicAnalysis = ({ zone }: { zone: Zone }) => {
  const macroInsights: MacroEconomicInsight[] = [
    {
      category: 'Interest Rates',
      impact: 'negative',
      confidence: 92,
      trend: 'Upward',
      source: 'RBA',
      lastUpdated: '2024-03-20',
      prediction: 'Expected to remain elevated through 2024',
      zoneImpact: {
        score: -0.8,
        reasoning: 'High rates affecting borrowing capacity in premium markets'
      }
    },
    {
      category: 'Immigration Policy',
      impact: 'positive',
      confidence: 88,
      trend: 'Increasing',
      source: 'Department of Home Affairs',
      lastUpdated: '2024-03-18',
      prediction: 'Sustained high levels of skilled migration',
      zoneImpact: {
        score: 0.9,
        reasoning: 'Strong rental demand in well-connected areas'
      }
    },
    {
      category: 'Economic Growth',
      impact: 'neutral',
      confidence: 85,
      trend: 'Stable',
      source: 'Treasury',
      lastUpdated: '2024-03-15',
      prediction: 'Moderate growth with some sectoral variation',
      zoneImpact: {
        score: 0.2,
        reasoning: 'Resilient local economy with diverse employment base'
      }
    }
  ];

  return (
    <DashboardCard 
      title="Macro-Economic Impact Analysis"
      sx={{
        background: 'linear-gradient(135deg, #f8f9ff 0%, #fff 100%)',
        mb: 3
      }}
    >
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Global & National Economic Factors
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  AI-powered analysis of macro-economic trends and their specific impact on {zone.metrics.description}
                </Typography>
              </Box>

              {macroInsights.map((insight, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {insight.category}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={insight.source}
                          size="small"
                          sx={{ bgcolor: 'primary.50', color: 'primary.main' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Updated: {insight.lastUpdated}
                        </Typography>
              </Box>
                    </Box>
                    <Chip
                      label={`${insight.confidence}% Confidence`}
                      color="primary"
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      <strong>Current Trend:</strong> {insight.trend}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Prediction:</strong> {insight.prediction}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    p: 1.5, 
                    bgcolor: alpha(
                      insight.impact === 'positive' ? '#4CAF50' : 
                      insight.impact === 'negative' ? '#F44336' : '#FFC107',
                      0.1
                    ),
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: alpha(
                      insight.impact === 'positive' ? '#4CAF50' : 
                      insight.impact === 'negative' ? '#F44336' : '#FFC107',
                      0.2
                    )
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Zone-Specific Impact
                    </Typography>
                    <Typography variant="body2">
                      {insight.zoneImpact.reasoning}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: insight.impact === 'positive' ? 'success.main' : 
                                insight.impact === 'negative' ? 'error.main' : 'warning.main'
                        }}
                      >
                        Impact Score: {insight.zoneImpact.score > 0 ? '+' : ''}{insight.zoneImpact.score}
                      </Typography>
              </Box>
            </Box>
          </Paper>
              ))}
            </Paper>
          </Grid>
        </Grid>
        </Box>
    </DashboardCard>
  );
};

const PortfolioAnalytics = ({ metrics }: { metrics: PortfolioMetrics }) => {
  const zoneDistributionData = {
    labels: ['Green', 'Yellow', 'Red'],
    datasets: [{
      label: 'Zone Distribution',
      data: [
        metrics.zone_distribution.green * 100,
        metrics.zone_distribution.yellow * 100,
        metrics.zone_distribution.red * 100
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
    }],
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Portfolio Overview</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper className="metric-card" elevation={2}>
            <Typography className="metric-card-title">Average Loan Size</Typography>
            <Typography className="metric-card-value" color="primary">
              ${metrics.avg_loan_size.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="metric-card" elevation={2}>
            <Typography className="metric-card-title">Average LTV</Typography>
            <Typography className="metric-card-value" color="primary">
              {(metrics.avg_ltv * 100).toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className="metric-card" elevation={2}>
            <Typography className="metric-card-title">Average Property Value</Typography>
            <Typography className="metric-card-value" color="primary">
              ${metrics.avg_property_value.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>Zone Distribution</Typography>
          <Box sx={{ height: 300 }}>
            <Pie 
              data={zoneDistributionData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

type ModelKey = keyof typeof modelInfo;

const ModelSelectionPage = ({ onModelSelect, selectedModel }: { onModelSelect: (model: ModelKey) => void; selectedModel: ModelKey }) => (
        <Box sx={{ 
    minHeight: '100vh',
    bgcolor: 'background.default',
    display: 'flex',
    flexDirection: 'column'
  }}>
    <AppBar position="static" elevation={0} sx={{
          bgcolor: 'background.paper', 
      borderBottom: 1,
      borderColor: 'divider'
    }}>
      <Toolbar sx={{ 
        minHeight: { xs: '72px', md: '80px' },
        px: { xs: 2, md: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2
        }}>
          <Box
            component="img"
            src="/images/logo.jpeg"
            alt="Equihome Logo"
            sx={{
              height: 40,
              width: 'auto',
              borderRadius: 1
            }}
          />
          <Box>
            <Typography 
              variant="h5" 
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.5px',
                lineHeight: 1.2
              }}
            >
              Equihome Partners
                </Typography>
                <Typography 
              variant="subtitle2" 
                  sx={{ 
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              TFL Application 1.0
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>

    <Container maxWidth="xl" sx={{ py: 8, flexGrow: 1 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ 
                    mb: 2,
          fontWeight: 700,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}>
          Select Your AI Model
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Choose from our suite of advanced AI models, each specialized for different aspects of real estate analysis
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(modelInfo).map(([model, info]) => (
          <Grid item xs={12} sm={6} md={4} key={model}>
            <Card
              sx={{
                height: '100%',
                    display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                borderRadius: 4,
                border: '1px solid',
                borderColor: info.isProprietaryModel && selectedModel === model ? 'primary.main' : 'divider',
                overflow: 'visible',
                position: 'relative',
                boxShadow: info.isProprietaryModel && selectedModel === model ? (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
                '&:hover': info.status === 'active' ? {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderColor: 'primary.main',
                } : {},
                ...(info.status === 'disabled' && {
                  opacity: 0.85,
                  bgcolor: info.isProprietaryModel ? alpha('#2196F3', 0.04) : 'action.disabledBackground',
                })
              }}
            >
              <CardContent sx={{ p: 4, flexGrow: 1 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
                      {model}
                    </Typography>
                    {info.isProprietaryModel && (
                      <Box
                        component="img"
                        src="/images/logo.svg"
                        alt="EquiHome Logo"
                    sx={{ 
                          width: 24,
                          height: 24,
                          ml: 1
                        }}
                      />
                    )}
                  </Box>
                  <Chip
                    label={info.badge || (info.status === 'active' ? 'Training' : 'Coming Soon')}
                    color={info.status === 'active' ? 'warning' : 'default'}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600,
                      ...(info.status === 'active' && {
                        background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
                        color: 'white'
                      }),
                      ...(info.isProprietaryModel && {
                        background: 'linear-gradient(45deg, #2196F3 30%, #64B5F6 90%)',
                        color: 'white'
                      })
                    }}
                  />
                </Box>
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3, 
                    minHeight: 60,
                    ...(info.isProprietaryModel && {
                      color: 'primary.main',
                      fontWeight: 500
                    })
                  }}
                >
                  {info.description}
                </Typography>
                <Typography 
                  variant="caption" 
                  color={info.isProprietaryModel ? 'primary' : 'text.secondary'} 
                  sx={{ 
                    fontWeight: 600, 
                    display: 'block', 
                    mb: 3 
                  }}
                >
                  {info.version}
                </Typography>
                {info.status === 'active' && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 3,
                    '& > div': {
                      flex: 1,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      textAlign: 'center'
                    }
                  }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Typography variant="h6" color="warning.main">Testing</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Response</Typography>
                      <Typography variant="h6" color="warning.main">50ms</Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
              <CardContent sx={{ p: 4, pt: 0 }}>
                <Button
                  fullWidth
                  variant={selectedModel === model ? 'contained' : 'outlined'}
                  disabled={info.status === 'disabled'}
                  onClick={() => info.status === 'active' ? onModelSelect(model as ModelKey) : undefined}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                    ...(info.status === 'active' && {
                      background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
                      boxShadow: '0 8px 16px rgba(255, 167, 38, 0.3)',
                    })
                  }}
                >
                  {selectedModel === model ? 'Selected' : 'Select Model'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

const AIZoneAnalysis = ({ zone }: { zone: Zone }) => {
  const metrics = zone.metrics;
  
  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      <DashboardCard 
        title="AI Investment Analysis"
        sx={{
          background: 'linear-gradient(135deg, #f5f7ff 0%, #fff 100%)',
          border: '1px solid',
          borderColor: 'primary.light',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  bgcolor: 'primary.50',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'primary.100'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PsychologyIcon sx={{ color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6" color="primary.main">
                    Investment Opportunity Analysis
                </Typography>
                  <Chip 
                    label={`${metrics.risk_score}% Match`}
                    color="primary"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  Based on our analysis of {metrics.description}, this zone presents a 
                  {metrics.risk_score >= 75 ? ' highly favorable' : 
                   metrics.risk_score >= 50 ? ' moderately favorable' : ' challenging'} 
                  investment opportunity.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" color="primary.main" gutterBottom>
                        Key Strengths
                      </Typography>
                      <List>
                        {metrics.growth_rate > 4 && (
                  <ListItem>
                    <ListItemText 
                              primary="Strong Growth Potential"
                              secondary={`${metrics.growth_rate}% annual growth rate indicates robust market momentum`}
                    />
                  </ListItem>
                        )}
                        {metrics.infrastructure_score > 7 && (
                  <ListItem>
                    <ListItemText 
                              primary="Excellent Infrastructure"
                              secondary={`Score of ${metrics.infrastructure_score}/10 suggests well-developed amenities`}
                    />
                  </ListItem>
                        )}
                        {metrics.sentiment > 0.8 && (
                  <ListItem>
                    <ListItemText 
                              primary="Positive Market Sentiment"
                              secondary={`${(metrics.sentiment * 100).toFixed(0)}% positive sentiment indicates strong market confidence`}
                    />
                  </ListItem>
                        )}
                </List>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle1" color="error.main" gutterBottom>
                        Risk Factors
                </Typography>
                      <List>
                        {metrics.housing_supply === 'High' && (
                  <ListItem>
                    <ListItemText 
                              primary="Supply Considerations"
                              secondary="High housing supply may impact property value growth"
                    />
                  </ListItem>
                        )}
                        {metrics.crime_rate > 1.5 && (
                  <ListItem>
                    <ListItemText 
                              primary="Security Concerns"
                              secondary={`Crime rate of ${metrics.crime_rate}/1000 is above target threshold`}
                    />
                  </ListItem>
                        )}
                </List>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle1" color="primary.main" gutterBottom>
                    Investment Thesis
                  </Typography>
                  <Typography variant="body2" paragraph>
                    This {suburbNames[metrics.postcode]} location aligns with our investment criteria through:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Growth Potential
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metrics.growth_rate}% annual growth rate with 
                          {metrics.housing_supply === 'Low' ? ' limited' : ' moderate'} supply
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Market Stability
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {metrics.employment_rate}% employment rate and 
                          {metrics.immigration === 'Increasing' ? ' growing' : ' stable'} population
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Infrastructure Quality
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Score of {metrics.infrastructure_score}/10 with excellent amenities
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DashboardCard>
    </Box>
  );
};

const TrafficLightMap = () => {
  const mapRef = useRef<any>(null);
  const [zones, setZones] = useState<Zones>({});
  const [boundaries, setBoundaries] = useState<any>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [correlations, setCorrelations] = useState<Correlation[]>([]);
  const [mlPerformance, setMlPerformance] = useState<MLPerformance>({});
  const [selectedModel, setSelectedModel] = useState<ModelKey>('AGBoost');
  const [featureImportance, setFeatureImportance] = useState<any>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [cursorPos, setCursorPos] = useState<{ lng: number; lat: number } | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [showModelSelection, setShowModelSelection] = useState(true);
  const [mlServiceStatus, setMlServiceStatus] = useState<MLServiceStatus>({ isActive: true, message: '' });

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      setError('Mapbox token is missing. Please check your .env file.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL;
        const mlServiceUrl = 'http://localhost:8000';
        if (!apiUrl) {
          throw new Error('API URL is not configured');
        }

        const [boundariesRes, zonesRes] = await Promise.all([
          fetch(`${apiUrl}/api/boundaries`),
          fetch(`${apiUrl}/api/zones?model=${selectedModel}`)
        ]);

        if (!boundariesRes.ok) {
          throw new Error(`Failed to fetch boundaries: ${boundariesRes.statusText}`);
        }
        if (!zonesRes.ok) {
          throw new Error(`Failed to fetch zones data: ${zonesRes.statusText}`);
        }

        const boundariesData = await boundariesRes.json();
        const zonesData = await zonesRes.json();

        if (!boundariesData || !zonesData) {
          throw new Error('Received invalid data from server');
        }

        // Process zones first
        const processedZones = Object.entries(zonesData.zones || {}).reduce((acc, [postcode, zone]: [string, any]) => {
          let color = '#e0e0e0';  // default color
          const riskScore = zone?.metrics?.risk_score ?? null;
          
          if (riskScore !== null && !isNaN(riskScore)) {
            console.log(`Postcode ${postcode} risk score:`, riskScore);
            color = riskScore >= 75 ? '#4CAF50' : riskScore >= 50 ? '#FFC107' : '#F44336';
            console.log(`Assigned color:`, color);
          } else {
            console.log(`Postcode ${postcode} has invalid or missing risk score`);
          }
          
          acc[postcode] = { 
            ...zone, 
            color,
            metrics: {
              ...(zone?.metrics || {}),
              risk_score: riskScore,
              growth_rate: zone?.metrics?.growth_rate ?? null,
              infrastructure_score: zone?.metrics?.infrastructure_score ?? null,
              crime_rate: zone?.metrics?.crime_rate ?? null,
              sentiment: zone?.metrics?.sentiment ?? null
            }
          };
          return acc;
        }, {} as Zones);

        // Merge zone data with boundaries
        const mergedBoundaries = {
          ...boundariesData,
          features: boundariesData.features.map((feature: any) => {
            const postcode = feature.properties.POA_CODE21;
            const zoneData = processedZones[postcode];
            return {
              ...feature,
              properties: {
                ...feature.properties,
                color: zoneData?.color || '#e0e0e0'
              }
            };
          })
        };

        setBoundaries(mergedBoundaries);
        setZones(processedZones);
        setMlServiceStatus(zonesData.mlServiceStatus || { isActive: true, message: '' });
        setPortfolioMetrics(zonesData.portfolioMetrics || null);
        setCorrelations(zonesData.correlations || []);
        setMlPerformance(zonesData.modelPerformance || {});
        setFeatureImportance(zonesData.featureImportance || null);
        setTrendAnalysis(zonesData.trendAnalysis || {});
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedModel]);

  const layerStyle: FillLayer = {
    id: 'zone-boundaries',
    type: 'fill',
    source: 'zones',
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.8,
        0.6
      ]
    }
  };

  const outlineLayer: LineLayer = {
    id: 'zone-outlines',
    type: 'line',
    source: 'zones',
    paint: {
      'line-color': '#000000',
      'line-width': 1
    }
  };

  const onClick = useCallback((event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      const zonePostcode = feature.properties?.POA_CODE21;
      if (zonePostcode && zones[zonePostcode]) {
        setSelectedZone(zonePostcode);
        setHoveredZone(zonePostcode);
        setCursorPos(event.lngLat);
      }
    }
  }, [zones]);

  const onHover = useCallback((event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      const zonePostcode = feature.properties?.POA_CODE21;
      if (zonePostcode && zones[zonePostcode]) {
        setHoveredZone(zonePostcode);
        setCursorPos(event.lngLat);
      }
    } else {
      setHoveredZone(null);
      setCursorPos(null);
    }
  }, [zones]);

  const handleModelSelect = (model: ModelKey) => {
    setSelectedModel(model);
    setShowModelSelection(false);
  };

  const calculateAverageRiskScore = (zones: Zones): number => {
    if (!zones || Object.keys(zones).length === 0) return 0;
    
    const validZones = Object.values(zones).filter(zone => 
      zone?.metrics?.risk_score !== undefined && 
      !isNaN(Number(zone.metrics.risk_score))
    );
    
    if (validZones.length === 0) return 0;
    
    const totalScore = validZones.reduce((acc, zone) => 
      acc + (Number(zone.metrics?.risk_score) || 0), 0);
    return Number((totalScore / validZones.length).toFixed(1));
  };

  const getHighPotentialZonesCount = (zones: Zones): number => {
    if (!zones || Object.keys(zones).length === 0) return 0;
    return Object.values(zones).filter(zone => zone?.color === 'green').length;
  };

  const getModelAccuracy = (mlPerformance: MLPerformance, selectedModel: string): string => {
    const accuracy = mlPerformance?.[selectedModel]?.accuracy;
    if (accuracy === undefined || accuracy === null) return '0.0%';
    return `${(accuracy * 100).toFixed(1)}%`;
  };

  const ErrorDisplay = ({ message }: { message: string }) => (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Error
                </Typography>
          </Box>
          <Typography>{message}</Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              size="small"
            >
              Retry
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );

  const LoadingDisplay = () => (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: 2
      } as SxProps<Theme>}
    >
        <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Loading dashboard data...
      </Typography>
      </Box>
    );

  const renderFeatureImportance = (): JSX.Element | null => {
    if (!featureImportance) return null;

    const data = {
      labels: Object.keys(featureImportance),
      datasets: [{
        label: 'Feature Importance',
        data: Object.values(featureImportance),
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: '#2196F3',
        borderWidth: 1
      }]
    };

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
          <Bar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    font: {
                      family: 'Inter, sans-serif',
                      weight: 'bold'
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      family: 'Inter, sans-serif',
                      weight: 'bold'
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderCorrelations = (): JSX.Element => {
    const data = {
      labels: correlations.map(c => `${c.factor1} → ${c.factor2}`),
      datasets: [{
        label: 'Correlation Strength',
        data: correlations.map(c => c.strength * 100),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: '#4CAF50',
        borderWidth: 1
      }]
    };

  return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, minHeight: 300 }}>
          <Bar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                  },
                  ticks: {
                    font: {
                      family: 'Inter, sans-serif',
                      weight: 'bold'
                    }
                  }
                },
                x: {
                  grid: {
                    display: false
                  },
                  ticks: {
                    font: {
                      family: 'Inter, sans-serif',
                      weight: 'bold'
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderDashboard = (): JSX.Element => (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!mlServiceStatus.isActive && (
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1000,
            maxWidth: '80%'
          }}
        >
          {mlServiceStatus.message}
        </Alert>
      )}
      <Box sx={{ 
        width: '100%',
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <AppBar position="sticky" elevation={0} sx={{ 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}>
          <Toolbar sx={{ 
            minHeight: { xs: '72px', md: '80px' },
            px: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}>
            {/* Left side - Logo and Company Info */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
              gap: 2
            }}>
              <Box
                component="img"
                src="/images/logo.jpeg"
                alt="Equihome Logo"
                sx={{
                  height: 40,
                  width: 'auto',
                  borderRadius: 1
                }}
              />
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2
                  }}
                >
                  Equihome Partners
                </Typography>
                <Typography 
                  variant="subtitle2" 
                    sx={{ 
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
                  Traffic Light System v1.0
                </Typography>
              </Box>
        </Box>
        
            {/* Right side - Actions */}
          <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 2
            }}>
              <Chip
                label={`Running: ${selectedModel}`}
                color="warning"
                sx={{ 
                  background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 2
                }}
              />
              <Button
                startIcon={<PsychologyIcon />}
                onClick={() => setShowModelSelection(true)}
                variant="contained"
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  }
                }}
              >
                Change Model
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ 
          p: 2,
          flexGrow: 1,
          overflow: 'auto',
          height: 'calc(100vh - 80px)'  // Subtract AppBar height
        }}>
          <Grid container spacing={2}>
            {/* Top metrics row - Always visible */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Total Zones"
                    value={Object.keys(zones || {}).length}
                    trend="+1"
                    trendLabel="this month"
                    tooltip="Total number of investment zones being analyzed"
                    aiInsight={{
                      summary: "Zone coverage is optimal for current market conditions",
                      recommendation: "Consider expanding to adjacent high-growth areas",
                      confidence: 92,
                      factors: ["Market Coverage", "Growth Potential", "Risk Distribution"]
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Average Risk Score"
                    value={`${calculateAverageRiskScore(zones)}%`}
                    trend="+5.2%"
                    trendLabel="from last month"
                    tooltip="Average risk assessment score across all zones"
                    aiInsight={{
                      summary: "Risk profile shows positive trend with manageable exposure",
                      recommendation: "Maintain current risk management strategy",
                      confidence: 88,
                      factors: ["Risk Trend", "Market Stability", "Economic Indicators"]
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="High Potential Zones"
                    value={getHighPotentialZonesCount(zones)}
                    trend="0"
                    trendLabel="no change"
                    tooltip="Number of zones with high investment potential"
                    aiInsight={{
                      summary: "Current high-potential zones show strong fundamentals",
                      recommendation: "Focus resources on top-performing zones",
                      confidence: 94,
                      factors: ["Growth Metrics", "Infrastructure", "Market Sentiment"]
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Model Accuracy"
                    value={getModelAccuracy(mlPerformance, selectedModel)}
                    trend="+2.1%"
                    trendLabel="improvement"
                    tooltip="Current model prediction accuracy"
                    aiInsight={{
                      summary: "Model performance exceeds industry benchmarks",
                      recommendation: "Continue model refinement with new data",
                      confidence: 96,
                      factors: ["Prediction Accuracy", "Data Quality", "Model Stability"]
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Australian Market Analysis - Always visible */}
            <Grid item xs={12}>
              <AustralianMacroAnalysis />
            </Grid>

            {/* Map section - Always visible */}
            <Grid item xs={12}>
              <DashboardCard 
                title="Investment Zone Map"
                sx={{ height: '60vh' }}
              >
                <Box sx={{ position: 'relative', height: '100%', borderRadius: 1 }}>
                  {boundaries && (
            <Map
              ref={mapRef}
              initialViewState={{
                longitude: 151.2093,
                latitude: -33.8688,
                zoom: 12
              }}
                      mapStyle="mapbox://styles/mapbox/light-v11"
              mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                      style={{ width: '100%', height: '100%' }}
                      onClick={onClick}
                      onMouseMove={onHover}
                      interactiveLayerIds={['zone-boundaries']}
            >
                <Source id="zones" type="geojson" data={boundaries}>
                  <Layer {...layerStyle} />
                        <Layer {...outlineLayer} />
                </Source>
                      {hoveredZone && cursorPos && zones[hoveredZone] && (
                        <Popup
                          longitude={cursorPos.lng}
                          latitude={cursorPos.lat}
                          closeButton={true}
                          closeOnClick={false}
                          offset={16}
                        >
                          <Box sx={{ 
                            width: '100%',
                            overflow: 'visible'
                          }}>
                            <Typography variant="h6" gutterBottom>
                              {suburbNames[hoveredZone] || hoveredZone}
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" color="primary" gutterBottom>
                                Risk Score: {zones[hoveredZone].metrics?.risk_score != null ? zones[hoveredZone].metrics.risk_score.toFixed(1) : 'Not available'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {zones[hoveredZone].metrics?.description || 'No description available'}
                              </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />
                            
                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                              Key Metrics
                            </Typography>
                            
                            <List disablePadding>
                              <ListItem disableGutters>
                                <ListItemText 
                                  primary="Growth Rate" 
                                  secondary={zones[hoveredZone]?.metrics?.growth_rate != null ? `${zones[hoveredZone].metrics.growth_rate}%` : 'Not available'}
                                />
                              </ListItem>
                              <ListItem disableGutters>
                                <ListItemText 
                                  primary="Infrastructure Score" 
                                  secondary={zones[hoveredZone]?.metrics?.infrastructure_score ?? 'Not available'}
                                />
                              </ListItem>
                              <ListItem disableGutters>
                                <ListItemText 
                                  primary="Employment Rate" 
                                  secondary={zones[hoveredZone]?.metrics?.employment_rate != null ? `${zones[hoveredZone].metrics.employment_rate}%` : 'Not available'}
                                />
                              </ListItem>
                              <ListItem disableGutters>
                                <ListItemText 
                                  primary="Sentiment" 
                                  secondary={zones[hoveredZone]?.metrics?.sentiment != null ? `${(zones[hoveredZone].metrics.sentiment * 100).toFixed(1)}%` : 'Not available'}
                                />
                              </ListItem>
                              <ListItem disableGutters>
                                <ListItemText 
                                  primary="Housing Supply" 
                                  secondary={zones[hoveredZone]?.metrics?.housing_supply ?? 'Not available'}
                                />
                              </ListItem>
                              <ListItem disableGutters>
                                <ListItemText 
                                  primary="Immigration Trend" 
                                  secondary={zones[hoveredZone]?.metrics?.immigration ?? 'Not available'}
                                />
                              </ListItem>
                            </List>

                            <Divider sx={{ my: 2 }} />
                            
                            {zones[hoveredZone].metrics?.ai_insights && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  AI Insights
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {zones[hoveredZone].metrics.ai_insights.summary}
                                </Typography>
                                {zones[hoveredZone].metrics.ai_insights.confidence > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    <Chip 
                                      size="small"
                                      label={`${zones[hoveredZone].metrics.ai_insights.confidence}% Confidence`}
                                      color="primary"
                                    />
                                  </Box>
                                )}
                              </Box>
                            )}
                          </Box>
                        </Popup>
                      )}
            </Map>
                  )}
            <Paper sx={{ 
              position: 'absolute', 
                    bottom: 16,
                    right: 16,
                    p: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 1,
                    boxShadow: 2
              }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Investment Potential
                </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {[
                        { color: '#4CAF50', label: 'High (>75)' },
                        { color: '#FFC107', label: 'Moderate (50-75)' },
                        { color: '#F44336', label: 'Low (<50)' }
                      ].map(({ color, label }) => (
                        <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            width: 12,
                            height: 12,
                            bgcolor: color,
                            mr: 0.5,
                            borderRadius: 0.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }} />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {label}
                          </Typography>
                </Box>
                      ))}
              </Box>
            </Paper>
          </Box>
              </DashboardCard>
            </Grid>

            {/* Zone-specific sections - Only show when a zone is selected */}
            {selectedZone && zones[selectedZone] && (
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {/* AI Investment Analysis */}
                  <Grid item xs={12}>
                    <AIZoneAnalysis zone={zones[selectedZone]} />
                  </Grid>

                  {/* Feature Importance and Correlations */}
                  <Grid item xs={12} md={6}>
                    <DashboardCard title="Feature Importance Analysis">
                      {renderFeatureImportance()}
                    </DashboardCard>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DashboardCard title="Factor Correlations">
                      {renderCorrelations()}
                    </DashboardCard>
                  </Grid>

                  {/* Zone-specific metrics */}
                  <Grid item xs={12}>
                    <DashboardCard title={`${suburbNames[selectedZone]} (${selectedZone}) Local Market Analysis`}>
                      <Box sx={{ p: 2 }}>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={zones[selectedZone].color === 'green' ? 'High Potential' : 
                                  zones[selectedZone].color === 'yellow' ? 'Moderate' : 'Low Potential'}
                            color={zones[selectedZone].color === 'green' ? 'success' : 
                                   zones[selectedZone].color === 'yellow' ? 'warning' : 'error'}
                            sx={{ fontWeight: 600 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Last updated: Today at 2:30 PM
                          </Typography>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <MetricCard
                              title="Risk Score"
                              value={zones[selectedZone].metrics.risk_score}
                              trend={"+2.5"}
                              trendLabel="vs last month"
                              aiInsight={zones[selectedZone].metrics.ai_insights || undefined}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <MetricCard
                              title="Growth Rate"
                              value={zones[selectedZone].metrics.growth_rate}
                              trend={"+1.8"}
                              trendLabel="vs last month"
                              aiInsight={zones[selectedZone].metrics.ai_insights || undefined}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <MetricCard
                              title="Infrastructure"
                              value={zones[selectedZone].metrics.infrastructure_score}
                              trend={"+1.2"}
                              trendLabel="vs last month"
                              aiInsight={zones[selectedZone].metrics.ai_insights || undefined}
                            />
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 4 }}>
                          <ComprehensiveMetrics zone={zones[selectedZone]} />
                        </Box>
                      </Box>
                    </DashboardCard>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );

  if (showModelSelection) {
    return <ModelSelectionPage onModelSelect={handleModelSelect} selectedModel={selectedModel} />;
  }

  if (error) {
    return <ErrorDisplay message={error.toString()} />;
  }

  if (loading) {
    return <LoadingDisplay />;
  }

  return renderDashboard();
};

export default TrafficLightMap;