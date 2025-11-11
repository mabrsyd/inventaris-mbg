'use client';

import { API_CONFIG } from '@/lib/config/api.config';

export default function TestApiPage() {
  const handleTestPost = async () => {
    try {
      console.log('BASE_URL:', API_CONFIG.BASE_URL);
      console.log('Full URL:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ name: 'Test Category', description: 'Testing' })
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      alert('Check console for details');
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <div className="space-y-2 mb-4">
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
        <p><strong>BASE_URL:</strong> {API_CONFIG.BASE_URL}</p>
        <p><strong>Categories Endpoint:</strong> {API_CONFIG.ENDPOINTS.CATEGORIES}</p>
        <p><strong>Full URL:</strong> {API_CONFIG.BASE_URL}{API_CONFIG.ENDPOINTS.CATEGORIES}</p>
      </div>
      <button
        onClick={handleTestPost}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test POST to Categories
      </button>
    </div>
  );
}
