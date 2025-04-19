import { User, Customer, Appointment, AuthState } from './index';

export interface RootState {
  auth: AuthState;
  customers: {
    items: Customer[];
    loading: boolean;
    error: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
  appointments: {
    items: Appointment[];
    loading: boolean;
    error: string | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface Action<T = any> {
  type: string;
  payload?: T;
}

export interface AuthAction extends Action {
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'REGISTER_SUCCESS' | 'REGISTER_FAILURE';
  payload?: {
    user?: User;
    error?: string;
  };
}

export interface CustomerAction extends Action {
  type: 'SET_CUSTOMERS' | 'ADD_CUSTOMER' | 'UPDATE_CUSTOMER' | 'DELETE_CUSTOMER' | 'SET_CUSTOMER_ERROR';
  payload?: {
    customers?: Customer[];
    customer?: Customer;
    error?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface AppointmentAction extends Action {
  type: 'SET_APPOINTMENTS' | 'ADD_APPOINTMENT' | 'UPDATE_APPOINTMENT' | 'DELETE_APPOINTMENT' | 'SET_APPOINTMENT_ERROR';
  payload?: {
    appointments?: Appointment[];
    appointment?: Appointment;
    error?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export type AppAction = AuthAction | CustomerAction | AppointmentAction; 