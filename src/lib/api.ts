const API_URL = import.meta.env.PROD 
  ? 'https://unified-form-backend.onrender.com/api'  // In production, use the backend service URL
  : 'http://localhost:3001/api';

export async function searchSchools(searchTerm: string): Promise<string[]> {
  const response = await fetch(`${API_URL}/schools?search=${encodeURIComponent(searchTerm)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch schools');
  }
  return response.json();
}

export async function submitForm(formType: string, formData: any): Promise<{ success: boolean; id: number }> {
  const response = await fetch(`${API_URL}/submit-form`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ formType, ...formData }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Server response:', errorText);
    throw new Error('Failed to submit form');
  }

  return response.json();
} 