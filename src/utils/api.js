/**
 * API Utility for Frontend-Backend Communication
 * Ensures consistent error handling, base URL configuration, and credentials.
 */

// Use VITE_API_URL since this is a Vite project.
// If it's not set, fallback to localhost for development.
import { BASE_URL } from '../config';

/**
 * Core API fetch wrapper that automatically handles JSON parsing and error throwing
 * @param {string} endpoint - The API endpoint (e.g., '/api/users')
 * @param {object} options - Fetch options (method, headers, body, etc.)
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    // credentials: 'include', // Uncomment if you are using cookies/sessions
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Parse the response
    const data = await response.json().catch(() => null);

    // If response is not ok, throw an error
    if (!response.ok) {
      const errorMessage = data?.message || response.statusText || 'An API error occurred';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};

/**
 * Convenience methods for HTTP verbs
 */
export const api = {
  get: (endpoint, options) => fetchApi(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, body, options) => fetchApi(endpoint, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  
  put: (endpoint, body, options) => fetchApi(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(body) 
  }),
  
  delete: (endpoint, options) => fetchApi(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
