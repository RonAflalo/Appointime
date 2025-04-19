import { Customer, Appointment } from './index';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
}

export interface CustomerFormData extends Omit<Customer, 'id'> {}

export interface AppointmentFormData extends Omit<Appointment, 'id' | 'status'> {
  customerId: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
} 