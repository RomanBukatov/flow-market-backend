import axios from 'axios';

const DADATA_TOKEN = "0572106be79d93258b967e225b492da3159ed819";

export interface DadataAddress {
  value: string; 
  unrestricted_value: string;
  data: {
    geo_lat: string; 
    geo_lon: string; 
  }
}

export const dadataApi = {
  suggestAddress: async (query: string): Promise<DadataAddress[]> => {
    if (!query || query.length < 3) return [];
    
    const response = await axios.post(
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
      { query: query, count: 5 },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Token " + DADATA_TOKEN
        }
      }
    );
    return response.data.suggestions;
  }
};