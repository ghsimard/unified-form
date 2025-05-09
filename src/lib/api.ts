const API_URL = import.meta.env.PROD 
  ? '/api'  // In production, use relative path for Vercel
  : 'http://localhost:3001/api'; 