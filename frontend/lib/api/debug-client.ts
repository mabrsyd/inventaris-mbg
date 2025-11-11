// Debug script to check API configuration
import { API_CONFIG } from '../config/api.config';

console.log('=== API Configuration Debug ===');
console.log('BASE_URL:', API_CONFIG.BASE_URL);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('CATEGORIES endpoint:', API_CONFIG.ENDPOINTS.CATEGORIES);
console.log('Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`);
