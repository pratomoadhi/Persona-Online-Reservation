import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Origin of the backend (uploads are served at /uploads, outside the /api/v1 prefix)
export const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

export const mediaUrl = (path: string) =>
  path.startsWith('http') ? path : `${API_ORIGIN}${path}`;

/**
 * Upload a profile picture for the currently authenticated user.
 * Returns the updated user object.
 */
export async function uploadAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data as User;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: 'USER' | 'PERSONA' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  _count?: { personas: number };
}

export type MediaType = 'IMAGE' | 'VIDEO';

export interface PersonaMedia {
  id: string;
  type: MediaType;
  url: string;
  caption: string | null;
}

export interface Persona {
  id: string;
  headline: string;
  bio: string | null;
  hourlyRate: number | null;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  skills: Skill[];
  media?: PersonaMedia[];
}

export interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Reservation {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  createdAt: string;
  persona: {
    id: string;
    headline: string;
    user: { fullName: string; avatarUrl: string | null };
  };
  availability: AvailabilitySlot;
}

export interface PersonaDetail extends Persona {
  availability: AvailabilitySlot[];
}