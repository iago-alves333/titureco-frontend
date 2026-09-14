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

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  name: string;
  role: Role;
  createdAt: string;
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
  reservedFor: string; // ISO-8601 LocalDateTime
}

export interface ReservationResponse {
  id: string;
  touristId: string;
  touristName: string;
  attractionID: string; // matches Java field name
  attractionTitle: string;
  status: Status;
  reservedFor: string;
  createdAt: string;
}

// ──── Spring Page ─────────────────────────────────────────────────────────────

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
