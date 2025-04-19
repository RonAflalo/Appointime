export interface Business {
  id: string;
  name: string;
  slug: string;
  registration_code: string;
  description?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin';
  businessId?: string;
  business?: Business;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  is_active?: boolean;
  image_url?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  date: string;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  notes?: string;
  cancellation_reason?: string;
}

export interface Review {
  id: string;
  customer_id: string;
  appointment_id: string;
  service_id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'featured' | 'hidden';
  created_at: string;
  flag?: 'red' | 'yellow' | 'green';
  notes?: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  businessId: string;
  business?: Business;
  managerId?: string;
  manager?: User;
  createdAt: Date;
  updatedAt: Date;
  appointments?: Appointment[];
  reviews?: Review[];
  flag?: 'red' | 'yellow' | 'green';
  notes?: string;
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
  };
  spacing: {
    unit: string;
  };
  borderRadius: string;
  shadows: {
    box: string;
  };
}

export interface HeroSection {
  title: string;
  subtitle: string;
  background_image?: string;
}

export interface FeatureCard {
  is_active: boolean;
  order: number;
  icon: string;
  title_he: string;
  description_he: string;
  cta_text_he?: string;
  cta_link?: string;
}

export interface FeaturesSection {
  title_he: string;
  description_he?: string;
  background_type: "color" | "image";
  background_value: string;
}

export interface SiteSettings {
  id: string;
  theme: Theme;
  hero_section: HeroSection;
  business_name: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  feature_cards: FeatureCard[];
  features_section: FeaturesSection;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface BlockedTime {
  id: string;
  start_time: string;
  end_time: string;
  reason?: string;
} 