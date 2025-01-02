const API_URL = process.env.API_URL || 'http://localhost:5001';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(id);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Failed to fetch');
  }
}

export async function getBookings(date?: string) {
  const url = date 
    ? `${API_URL}/api/bookings?date=${date}`
    : `${API_URL}/api/bookings`;

  const response = await fetchWithTimeout(url);
  return response.json();
}

export async function getBooking(id: string) {
  const response = await fetchWithTimeout(`${API_URL}/api/bookings/${id}`);
  return response.json();
}

export async function createBooking(bookingData: any) {
  const response = await fetchWithTimeout(`${API_URL}/api/bookings`, {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
  return response.json();
}

export async function deleteBooking(id: string) {
  const response = await fetchWithTimeout(`${API_URL}/api/bookings/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function getAvailability(start: string, end: string) {
  const response = await fetchWithTimeout(
    `${API_URL}/api/availability?start=${start}&end=${end}`
  );
  return response.json();
} 