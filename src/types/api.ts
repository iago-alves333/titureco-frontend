// Enums matching Java Role and Status
export type Role = 'ADMIN' | 'TOURIST' | 'GUIDE';
export type Status = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// ──── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  name: string;
  role: Role;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  name: string;
  role: Role;
  createdAt: string; // ISO-8601
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}

// ──── Attractions ─────────────────────────────────────────────────────────────

export interface AttractionRequest {
  title: string;
  description: string;
  price: number;
  availableSpots: number;
  latitude: number;
  longitude: number;
}

export interface AttractionResponse {
  id: string;
  guideId: string;
  guideName: string;
  title: string;
  description: string;
  price: number;
  availableSpots: number;
  latitude: number;
  longitude: number;
  ratingAverage: number;
  reviewCount: number;
}

// ──── Reviews ─────────────────────────────────────────────────────────────────

export interface ReviewRequest {
  attractionId: string;
  rating: number;
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  attractionId: string;
  touristId: string;
  touristName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ──── Reservations ────────────────────────────────────────────────────────────

export interface ReservationRequest {
  attractionId: string;
  reservedFor: string; // ISO-8601
}

export interface ReservationResponse {
  id: string;
  touristId: string;
  attractionID: string; // matches Java field name (typo in backend)
  status: Status;
  reservedFor: string;
  createdAt: string;
}

// ──── Spring Page ─────────────────────────────────────────────────────────────

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
