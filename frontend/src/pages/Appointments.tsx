import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "../components/ui/button";
import { CalendarPlus, Loader2, Star as StarIcon } from "lucide-react";
import { Service, Appointment, User, Review } from "../types";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../components/ui/tabs";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label"; 
import { Badge } from "../components/ui/badge";
import { getCurrentUser, getAppointments, getService, getReviews } from "../api/entities";

interface AppointmentsPageProps {}

interface AppointmentsState {
  user: User | null;
  appointments: Appointment[];
  services: Service[];
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
  showReviewDialog: boolean;
  selectedAppointment: Appointment | null;
  reviewText: string;
  reviewRating: number;
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = () => {
  const [state, setState] = useState<AppointmentsState>({
    user: null,
    appointments: [],
    services: [],
    reviews: [],
    isLoading: true,
    error: null,
    showReviewDialog: false,
    selectedAppointment: null,
    reviewText: "",
    reviewRating: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      const appointments = await getAppointments();
      const services = await Promise.all(appointments.map(apt => getService(apt.service_id)));
      const reviews = await getReviews();

      setState(prev => ({
        ...prev,
        user,
        appointments,
        services,
        reviews,
        isLoading: false
      }));
    } catch (error: unknown) {
      console.error('Error loading appointments:', error instanceof Error ? error.message : 'An unknown error occurred');
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred', isLoading: false }));
    }
  };

  const getServiceName = (serviceId: string): string => {
    const service = state.services.find(s => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };

  const hasReviewedAppointment = (appointmentId: string): boolean => {
    return state.reviews.some(review => review.appointment_id === appointmentId);
  };

  const handleReviewClick = (appointment: Appointment): void => {
    setState(prev => ({
      ...prev,
      selectedAppointment: appointment,
      showReviewDialog: true,
      reviewText: "",
      reviewRating: 0
    }));
  };

  const submitReview = async (): Promise<void> => {
    try {
      // Implementation here
    } catch (error: unknown) {
      console.error('Error confirming appointment:', error instanceof Error ? error.message : 'An unknown error occurred');
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const handleCancelPending = async (appointment: Appointment): Promise<void> => {
    try {
      // Implementation here
    } catch (error: unknown) {
      console.error('Error cancelling appointment:', error instanceof Error ? error.message : 'An unknown error occurred');
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{state.error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="flex flex-col gap-8">
        <div className="text-right">
          <h1 className="text-3xl font-bold mb-4">התורים שלי</h1>
          <p className="text-gray-600">צפה וניהול התורים שלך</p>
        </div>
        {/* Rest of the JSX implementation */}
      </div>
    </div>
  );
};

export default AppointmentsPage; 