import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { createPageUrl } from "@/utils";
import { User, Service, Appointment, Review, Customer, SiteSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Scissors, X, Loader2, AlertCircle, Star } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { he } from 'date-fns/locale';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnimatePresence, motion } from "framer-motion";
import FeatureCards from "@/components/home/FeatureCards";
import { applyTheme } from "@/utils/theme";
import { UserAPI, AppointmentAPI, ServiceAPI, ReviewAPI, CustomerAPI, SiteSettingsAPI } from "@/api/entities";

interface ThemeStyles {
  '--button-bg-color': string;
  '--landing-title-color': string;
  '--section-title-color': string;
  '--section-subtitle-color': string;
  '--card-title-color': string;
  '--card-text-color': string;
  '--card-icon-color': string;
  '--card-bg-color': string;
  '--card-button-color': string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceInfo, setServiceInfo] = useState<Record<string, Service>>({});
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [showCancelError, setShowCancelError] = useState<boolean>(false);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [reviewCustomers, setReviewCustomers] = useState<Record<string, Customer>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await UserAPI.me();
        setUser(userData);

        const appointmentsList = await AppointmentAPI.list();
        setAppointments(appointmentsList);

        const servicesList = await ServiceAPI.list();
        const servicesMap = servicesList.reduce((acc, service) => {
          acc[service.id] = service;
          return acc;
        }, {} as Record<string, Service>);
        setServiceInfo(servicesMap);

        const reviewsList = await ReviewAPI.filter({ status: 'approved' });
        setReviews(reviewsList);

        const customersList = await CustomerAPI.filter({});
        const customersMap = customersList.reduce((acc, customer) => {
          acc[customer.id] = customer;
          return acc;
        }, {} as Record<string, Customer>);
        setCustomers(customersMap);

        const settings = await SiteSettingsAPI.get();
        setSiteSettings(settings);

        // Apply theme styles
        if (settings.theme) {
          applyTheme(settings.theme);
        }

        setFeaturedReviews(reviewsList);
        setReviewCustomers(customersMap);
      } catch (error: unknown) {
        console.error('Error loading data:', error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const getThemeStyles = (): ThemeStyles => {
    if (!siteSettings || !siteSettings.theme) {
      return {
        '--button-bg-color': '#2563eb',
        '--landing-title-color': '#ffffff',
        '--section-title-color': '#111827',
        '--section-subtitle-color': '#6b7280',
        '--card-title-color': '#111827',
        '--card-text-color': '#6b7280',
        '--card-icon-color': '#2563eb',
        '--card-bg-color': '#ffffff',
        '--card-button-color': '#2563eb',
      };
    }
    
    const { theme } = siteSettings;
    
    return {
      '--button-bg-color': theme.colors.primary,
      '--landing-title-color': '#ffffff',
      '--section-title-color': theme.colors.text,
      '--section-subtitle-color': theme.colors.secondary,
      '--card-title-color': theme.colors.text,
      '--card-text-color': theme.colors.secondary,
      '--card-icon-color': theme.colors.primary,
      '--card-bg-color': theme.colors.background,
      '--card-button-color': theme.colors.primary,
    };
  };

  const getCustomerName = (customerId: string): string => {
    const customer = reviewCustomers[customerId];
    if (!customer) return "לקוח";
    return customer.full_name;
  };

  const canCancelAppointment = (): boolean => {
    if (!appointments.length) return false;
    const appointmentDate = new Date(appointments[0].date);
    const now = new Date();
    const hoursDifference = differenceInHours(appointmentDate, now);
    return hoursDifference >= 8;
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await AppointmentAPI.delete(appointmentId);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    } catch (error: unknown) {
      console.error('Error cancelling appointment:', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const tryOpenCancelDialog = (): void => {
    if (canCancelAppointment()) {
      setCancelDialogOpen(true);
      setShowCancelError(false);
    } else {
      setShowCancelError(true);
    }
  };

  const getHeroBackground = (): string => {
    if (siteSettings?.hero_section?.background_image) {
      return `url('${siteSettings.hero_section.background_image}')`;
    }
    return "url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3')";
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full" dir="rtl">
      {/* Hero Section */}
      <section 
        className="relative h-[300px] md:h-[500px] flex items-center justify-center bg-cover bg-center text-white"
        style={{ backgroundImage: getHeroBackground() }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold" style={{ color: 'var(--landing-title-color)' }}>
            {siteSettings?.hero_section?.title || 'Welcome to Our Studio'}
          </h1>
          <p className="text-xl md:text-2xl">
            {siteSettings?.hero_section?.subtitle || 'Book your appointment today'}
          </p>
          <Button 
            size="lg"
            onClick={() => navigate(createPageUrl("Book"))}
            style={{ backgroundColor: 'var(--button-bg-color)' }}
          >
            Book Now
          </Button>
        </div>
      </section>

      <div className="p-0">
        <div className="flex flex-col gap-8 pt-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">ברוכים הבאים</h1>
            <p className="text-gray-600">בחר את השירות הרצוי והזמן תור</p>
          </div>
          {/* Features Section */}
          <section className="py-16 px-0">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--section-title-color)' }}>
                  Our Services
                </h2>
                <p className="text-lg" style={{ color: 'var(--section-subtitle-color)' }}>
                  Experience professional grooming services
                </p>
              </div>
              <FeatureCards siteSettings={siteSettings} />
            </div>
          </section>

          {/* User's Next Appointment */}
          {user && appointments.length > 0 && (
            <section className="py-16 px-0 bg-gray-50">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--section-title-color)' }}>
                    Your Next Appointment
                  </h2>
                </div>
                <div className="max-w-2xl mx-auto">
                  <Card style={{ backgroundColor: 'var(--card-bg-color)' }}>
                    <CardHeader>
                      <CardTitle style={{ color: 'var(--card-title-color)' }}>
                        Upcoming Appointment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-5 h-5" style={{ color: 'var(--card-icon-color)' }} />
                          <span style={{ color: 'var(--card-text-color)' }}>
                            {format(new Date(appointments[0].date), 'PPP', { locale: he })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5" style={{ color: 'var(--card-icon-color)' }} />
                          <span style={{ color: 'var(--card-text-color)' }}>
                            {format(new Date(appointments[0].date), 'HH:mm', { locale: he })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Scissors className="w-5 h-5" style={{ color: 'var(--card-icon-color)' }} />
                          <span style={{ color: 'var(--card-text-color)' }}>
                            {serviceInfo[appointments[0].service_id]?.name || 'Loading...'}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full mt-4"
                          onClick={tryOpenCancelDialog}
                          style={{ borderColor: 'var(--card-button-color)', color: 'var(--card-button-color)' }}
                        >
                          Cancel Appointment
                        </Button>
                        {showCancelError && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Appointments can only be cancelled at least 8 hours before the scheduled time.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {/* Reviews Section */}
          {featuredReviews.length > 0 && (
            <section className="py-16 px-4">
              <div className="container mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--section-title-color)' }}>
                    Customer Reviews
                  </h2>
                  <p className="text-lg" style={{ color: 'var(--section-subtitle-color)' }}>
                    See what our customers say about us
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredReviews.map((review) => (
                    <Card key={review.id} style={{ backgroundColor: 'var(--card-bg-color)' }}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-1 mb-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400' : 'fill-gray-200'}`}
                            />
                          ))}
                        </div>
                        <p className="mb-4" style={{ color: 'var(--card-text-color)' }}>
                          {review.comment}
                        </p>
                        <p className="font-medium" style={{ color: 'var(--card-title-color)' }}>
                          {getCustomerName(review.customer_id)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Cancel Appointment Dialog */}
          <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader className="space-y-2">
                <AlertDialogTitle className="text-lg font-semibold">
                  Cancel Appointment
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Are you sure you want to cancel your appointment? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex items-center justify-end space-x-2">
                <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    setIsCancelling(true);
                    handleCancelAppointment(appointments[0].id)
                      .finally(() => {
                        setIsCancelling(false);
                        setCancelDialogOpen(false);
                      });
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Confirm Cancel'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 