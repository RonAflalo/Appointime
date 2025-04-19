import { User, Customer, Appointment, ApiResponse } from './index';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {
  id: string;
}

export interface CreateAppointmentRequest {
  customerId: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

export interface UpdateAppointmentRequest extends Partial<CreateAppointmentRequest> {
  id: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type LoginResponse = ApiResponse<{
  user: User;
  token: string;
}>;

export type RegisterResponse = ApiResponse<User>;
export type CustomerResponse = ApiResponse<Customer>;
export type CustomersResponse = ApiResponse<PaginatedResponse<Customer>>;
export type AppointmentResponse = ApiResponse<Appointment>;
export type AppointmentsResponse = ApiResponse<PaginatedResponse<Appointment>>; 