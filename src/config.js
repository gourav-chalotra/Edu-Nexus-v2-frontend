const envUrl = import.meta.env.VITE_API_URL;
export const BASE_URL = envUrl && envUrl.startsWith('http') 
  ? envUrl 
  : 'https://edu-nexus-v2-backend-2.onrender.com';
