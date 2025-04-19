import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Service, Appointment, BlockedTime, Customer } from "../types";
import { createPageUrl } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { format, addMinutes, isBefore, isAfter, isEqual, startOfDay, endOfDay } from "date-fns";
import { he } from 'date-fns/locale';
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { UserAPI, ServiceAPI, AppointmentAPI } from "@/api/entities";

interface BookPageProps {}

interface BookingError {
  message: string;
  type: 'error' | 'warning';
}

const BookPage: React.FC<BookPageProps> = () => {
  const navigate = useNavigate();
  const dateRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [existingAppointment, setExistingAppointment] = useState<Appointment | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [bookingError, setBookingError] = useState<BookingError | null>(null);
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [customerCheckComplete, setCustomerCheckComplete] = useState<boolean>(false);
  const [customerCheckResult, setCustomerCheckResult] = useState<React.ReactNode>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await UserAPI.me();
        setUser(userData);

        const servicesList = await ServiceAPI.list();
        setServices(servicesList);

        const mockBlockedTimes: BlockedTime[] = [];
        setBlockedTimes(mockBlockedTimes);

        const mockAppointments: Appointment[] = [];
        setExistingAppointments(mockAppointments);

        setCustomerCheckComplete(true);
        setCustomerCheckResult(null);

      } catch (error: unknown) {
        console.error('Error loading data:', error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateAvailableSlots = async (date: Date) => {
    if (!selectedService) return;

    const startTime = startOfDay(date);
    const endTime = endOfDay(date);
    const slotDuration = selectedService.duration;
    const slots: string[] = [];

    // Get existing appointments for the selected date
    const existingAppointments = await AppointmentAPI.filter({
      status: 'approved'
    });

    // Generate time slots
    let currentTime = startTime;
    while (isBefore(currentTime, endTime)) {
      const slotEndTime = addMinutes(currentTime, slotDuration);
      
      // Check if slot overlaps with existing appointments
      const isSlotAvailable = !existingAppointments.some(apt => {
        const aptStart = new Date(apt.date);
        const aptEnd = addMinutes(aptStart, selectedService.duration);
        return (
          (isAfter(currentTime, aptStart) && isBefore(currentTime, aptEnd)) ||
          (isAfter(slotEndTime, aptStart) && isBefore(slotEndTime, aptEnd))
        );
      });

      if (isSlotAvailable) {
        slots.push(format(currentTime, 'HH:mm'));
      }

      currentTime = addMinutes(currentTime, 30); // 30-minute intervals
    }

    setAvailableSlots(slots);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedTime(null);
    calculateAvailableSlots(date);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableSlots([]);
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !user) return;

    setIsBooking(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes);

      await AppointmentAPI.create({
        service_id: selectedService.id,
        client_id: user.id,
        date: appointmentDate.toISOString(),
        status: 'approved'
      });

      navigate('/');
    } catch (error: unknown) {
      console.error('Error creating appointment:', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (customerCheckResult) {
    return <div>{customerCheckResult}</div>;
  }

  if (bookingError) {
    return (
      <Alert variant={bookingError.type === 'error' ? "destructive" : "default"}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Booking Error</AlertTitle>
        <AlertDescription>{bookingError.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="flex flex-col gap-8">
        <div className="text-right">
          <h1 className="text-3xl font-bold mb-4">קביעת תור</h1>
          <p className="text-gray-600">בחר את השירות והתאריך הרצוי</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map(service => (
                  <Button
                    key={service.id}
                    variant={selectedService?.id === service.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleServiceSelect(service)}
                  >
                    {service.name} - {service.duration} minutes
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle>Select Date and Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={handleDateSelect}
                    locale={he}
                    disabled={date => isBefore(date, new Date())}
                  />

                  {selectedDate && availableSlots.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map(time => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {selectedService && selectedDate && selectedTime && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} disabled={isBooking}>
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookPage; 