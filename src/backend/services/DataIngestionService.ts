import axios from 'axios';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';
import { join } from 'path';

config();

interface ABSResponse {
  data: {
    value: number;
    time: string;
    postcode: string;
  }[];
}

class DataIngestionService {
  private readonly absApiKey: string;
  private readonly dataPath: string;

  constructor() {
    this.absApiKey = process.env.ABS_API_KEY || '';
    this.dataPath = process.env.DB_PATH || './data/data_lake.db';
  }

  async fetchABSData(postcodes: string[]): Promise<ABSResponse> {
    try {
      const response = await axios.get(
        'https://data.api.abs.gov.au/rest/data/ABS.RPPI.1.0.0/1.1.2.Q',
        {
          headers: {
            'X-API-KEY': this.absApiKey,
            'Accept': 'application/json'
          },
          params: {
            postcode: postcodes.join(',')
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ABS data:', error);
      throw error;
    }
  }

  async saveToDataLake(data: any): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = {
        ...data,
        timestamp
      };

      // For MVP, we'll save as JSON files in the data directory
      const fileName = `abs_data_${timestamp.replace(/[:.]/g, '-')}.json`;
      const filePath = join(process.cwd(), 'data', fileName);
      
      writeFileSync(filePath, JSON.stringify(dataWithTimestamp, null, 2));
      console.log(`Data saved to ${filePath}`);
    } catch (error) {
      console.error('Error saving to data lake:', error);
      throw error;
    }
  }

  async ingestData(): Promise<void> {
    try {
      const targetPostcodes = (process.env.TARGET_POSTCODES || '2000,2001,2006').split(',');
      const data = await this.fetchABSData(targetPostcodes);
      await this.saveToDataLake(data);
    } catch (error) {
      console.error('Error in data ingestion:', error);
      throw error;
    }
  }
}

export default new DataIngestionService(); 