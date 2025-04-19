import { ReactNode } from 'react';
import { User, Customer, Appointment } from './index';
import { RegisterFormData, CustomerFormData, AppointmentFormData } from './forms';

export interface LayoutProps {
  children: ReactNode;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
}

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export interface InputProps {
  name: string;
  label?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
  }[];
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  createCustomer: (data: CustomerFormData) => Promise<void>;
  updateCustomer: (id: string, data: CustomerFormData) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  setPage: (page: number) => void;
}

export interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  createAppointment: (data: AppointmentFormData) => Promise<void>;
  updateAppointment: (id: string, data: AppointmentFormData) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  setPage: (page: number) => void;
} 