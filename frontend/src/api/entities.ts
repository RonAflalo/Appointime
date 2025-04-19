import type { User, Service, Appointment, Review, Customer, SiteSettings } from '../types';

export type { User, Customer, Appointment, Review };

const API_BASE_URL = 'http://localhost:3001/api';

// Auth functions
export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const register = async (data: {
  email: string;
  password: string;
  full_name: string;
  is_admin: boolean;
  business_name?: string;
  registration_code?: string;
}): Promise<{ user: User; token: string; customer?: Customer }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  const responseData = await response.json();
  if (responseData.token) {
    localStorage.setItem('token', responseData.token);
  }
  
  // Ensure business association is properly set for admin users
  if (responseData.user.role === 'admin' && !responseData.user.businessId) {
    throw new Error('Admin user must be associated with a business');
  }

  return responseData;
};

// User functions
export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/users/me?include=business`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user');
  }

  const user = await response.json();
  // Add businessId to the user object if a business exists
  if (user.business) {
    user.businessId = user.business.id;
  }
  return user;
};

// Service functions
export const getServices = async (): Promise<Service[]> => {
  const response = await fetch(`${API_BASE_URL}/services`);
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
};

export const getService = async (id: string): Promise<Service> => {
  const response = await fetch(`${API_BASE_URL}/services/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch service');
  }
  return response.json();
};

// Appointment functions
export const getAppointments = async (): Promise<Appointment[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/appointments`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }

  return response.json();
};

export const createAppointment = async (data: Partial<Appointment>): Promise<Appointment> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create appointment');
  }

  return response.json();
};

// Customer functions
export const getCustomers = async (): Promise<Customer[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/customers`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }

  return response.json();
};

export const getCustomer = async (id: string): Promise<Customer> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customer');
  }

  return response.json();
};

export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update customer');
  }

  return response.json();
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete customer');
  }
};

export const createCustomer = async (data: Partial<Customer>): Promise<Customer> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create customer');
  }

  return response.json();
};

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    full_name: 'Admin User',
    phone: '0501234567',
    email: 'admin@example.com',
    role: 'admin' as const
  }
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Haircut',
    description: 'Professional haircut service',
    duration: 30,
    price: 30,
    category: 'hair'
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    service_id: '1',
    client_id: '1',
    date: new Date().toISOString(),
    status: 'approved'
  }
];

const mockReviews: Review[] = [
  {
    id: '1',
    customer_id: '1',
    appointment_id: '1',
    service_id: '1',
    rating: 5,
    comment: 'Great service!',
    status: 'featured',
    created_at: new Date().toISOString()
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    managerId: '1',
    full_name: 'דוד כהן',
    phone: '0501234567',
    email: 'david.cohen@example.com',
    notes: 'לקוח קבוע, מעדיף תורים בבוקר',
    flag: 'green',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    managerId: '2',
    full_name: 'שרה לוי',
    phone: '0522345678',
    email: 'sarah.levi@example.com',
    notes: 'אלרגית למוצרים מסוימים',
    flag: 'yellow',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    managerId: '3',
    full_name: 'משה אברהם',
    phone: '0533456789',
    email: 'moshe.avraham@example.com',
    notes: 'מבקש תמיד את אותו השירות',
    flag: 'green',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    managerId: '4',
    full_name: 'רחל גולן',
    phone: '0544567890',
    email: 'rachel.golan@example.com',
    notes: 'מבטלת תורים לעיתים קרובות',
    flag: 'red',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    managerId: '5',
    full_name: 'יוסף מזרחי',
    phone: '0555678901',
    email: 'yosef.mizrahi@example.com',
    notes: 'לקוח חדש',
    flag: undefined,
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    managerId: '6',
    full_name: 'מרים בן דוד',
    phone: '0566789012',
    email: 'miriam.bendavid@example.com',
    notes: 'מעוניינת בשירותים נוספים',
    flag: 'yellow',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '7',
    managerId: '7',
    full_name: 'אברהם יצחק',
    phone: '0577890123',
    email: 'avraham.itzhak@example.com',
    notes: 'לקוח VIP',
    flag: 'green',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '8',
    managerId: '8',
    full_name: 'תמר פלד',
    phone: '0588901234',
    email: 'tamar.feld@example.com',
    notes: 'מבקשת הנחה קבועה',
    flag: 'red',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '9',
    managerId: '9',
    full_name: 'דניאל רוזן',
    phone: '0599012345',
    email: 'daniel.rozen@example.com',
    notes: 'מגיע עם ילדים',
    flag: 'yellow',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '10',
    managerId: '10',
    full_name: 'נעמה שטיין',
    phone: '0500123456',
    email: 'naama.stein@example.com',
    notes: 'מעוניינת בשירותים מיוחדים',
    flag: 'green',
    businessId: '1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockSiteSettings: SiteSettings = {
  id: '1',
  theme: {
    colors: {
      primary: '#4F46E5',
      secondary: '#818CF8',
      background: '#FFFFFF',
      text: '#1F2937'
    },
    typography: {
      fontFamily: 'system-ui',
      fontSize: '16px'
    },
    spacing: {
      unit: '1rem'
    },
    borderRadius: '0.5rem',
    shadows: {
      box: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    }
  },
  hero_section: {
    title: 'Welcome to Our Studio',
    subtitle: 'Book your appointment today',
    background_image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3'
  },
  business_name: 'The Barber Studio',
  business_description: 'Professional barber services',
  business_address: '123 Main St',
  business_phone: '0501234567',
  business_email: 'contact@example.com',
  feature_cards: [
    {
      is_active: true,
      order: 1,
      icon: 'Calendar',
      title_he: 'תורים זמינים',
      description_he: 'בחרו את הזמן המתאים לכם',
      cta_text_he: 'להזמנת תור',
      cta_link: '/Book'
    },
    {
      is_active: true,
      order: 2,
      icon: 'Scissors',
      title_he: 'שירותים מקצועיים',
      description_he: 'צוות מקצועי עם ניסיון רב',
      cta_text_he: 'לצפייה בשירותים',
      cta_link: '/Services'
    },
    {
      is_active: true,
      order: 3,
      icon: 'Users',
      title_he: 'לקוחות מרוצים',
      description_he: 'הצטרפו למשפחת הלקוחות המרוצים שלנו',
      cta_text_he: 'לצפייה בביקורות',
      cta_link: '/Reviews'
    }
  ],
  features_section: {
    title_he: 'היתרונות שלנו',
    description_he: 'הצטרפו אלינו לחווית גילוח וטיפוח ברמה הגבוהה ביותר',
    background_type: "color",
    background_value: "#f3f4f6"
  }
};

export const getReviews = async (): Promise<Review[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/reviews`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch reviews');
  }

  return response.json();
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch('http://localhost:3001/api/settings', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch site settings');
    }

    const settings = await response.json();
    return settings;
  } catch (error) {
    console.error('getSiteSettings: Error:', error);
    throw error;
  }
};

export const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
  // In a real app, this would make an API call
  const appointment = mockAppointments.find(a => a.id === id);
  if (!appointment) throw new Error('Appointment not found');
  
  const updatedAppointment = { ...appointment, ...data };
  const index = mockAppointments.findIndex(a => a.id === id);
  mockAppointments[index] = updatedAppointment;
  
  return updatedAppointment;
};

export const UserAPI = {
  me: async (): Promise<User> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  },
  updateMyUserData: async (data: Partial<User>): Promise<User> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return response.json();
  },
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  },
  register: async (data: {
    email: string;
    password: string;
    full_name: string;
    is_admin: boolean;
    business_name?: string;
    registration_code?: string;
  }): Promise<{ user: User; token: string; customer?: Customer }> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const responseData = await response.json();
    if (responseData.token) {
      localStorage.setItem('token', responseData.token);
    }
    return responseData;
  }
};

export const ServiceAPI = {
  list: async (): Promise<Service[]> => {
    return mockServices;
  }
};

export const ReviewAPI = {
  filter: async (params: { status?: string }): Promise<Review[]> => {
    return mockReviews.filter(r => !params.status || r.status === params.status);
  }
};

export const CustomerAPI = {
  filter: async (params: { managerId?: string }): Promise<Customer[]> => {
    return mockCustomers.filter(c => !params.managerId || c.managerId === params.managerId);
  },
  create: async (data: Omit<Customer, 'id'>): Promise<Customer> => {
    const newCustomer = { ...data, id: String(mockCustomers.length + 1) };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },
  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Customer not found');
    mockCustomers[index] = { ...mockCustomers[index], ...data };
    return mockCustomers[index];
  }
};

export const AppointmentAPI = {
  list: async (): Promise<Appointment[]> => {
    return mockAppointments;
  },
  create: async (data: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const newAppointment = { ...data, id: String(mockAppointments.length + 1) };
    mockAppointments.push(newAppointment);
    return newAppointment;
  },
  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    mockAppointments[index] = { ...mockAppointments[index], ...data };
    return mockAppointments[index];
  },
  delete: async (id: string): Promise<void> => {
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');
    mockAppointments.splice(index, 1);
  },
  filter: async (params: { client_id?: string; status?: string }): Promise<Appointment[]> => {
    return mockAppointments.filter(a => {
      if (params.client_id && a.client_id !== params.client_id) return false;
      if (params.status && a.status !== params.status) return false;
      return true;
    });
  }
};

export const SiteSettingsAPI = {
  get: async (): Promise<SiteSettings> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/settings`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch settings');
    }

    return response.json();
  },
  update: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update settings');
    }

    return response.json();
  }
};

export const updateReview = async (id: string, data: Partial<Review>): Promise<Review> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update review');
  }

  return response.json();
};

export const deleteReview = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete review');
  }
}; 