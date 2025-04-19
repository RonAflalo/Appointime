import React, { useState, useEffect, useRef } from "react";
import { User, Appointment, Service, Customer } from "../types";
import { format, isAfter } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getCurrentUser, getAppointments, getService, getCustomer } from "../api/entities";
import { Input } from "../components/ui/input";

interface AdminCalendarPageProps {}

interface AdminCalendarState {
  user: User | null;
  appointments: Appointment[];
  services: Service[];
  customers: Customer[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  showCancelDialog: boolean;
  selectedAppointment: Appointment | null;
  cancelReason: string;
}

const AdminCalendarPage: React.FC<AdminCalendarPageProps> = () => {
  const [state, setState] = useState<AdminCalendarState>({
    user: null,
    appointments: [],
    services: [],
    customers: [],
    selectedDate: new Date(),
    isLoading: true,
    error: null,
    showCancelDialog: false,
    selectedAppointment: null,
    cancelReason: ""
  });

  const appointmentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async (): Promise<void> => {
    try {
      console.log('AdminCalendar: Checking admin access...');
      const user = await getCurrentUser();
      console.log('AdminCalendar: Current user:', user);
      if (!user || user.role !== 'admin') {
        console.log('AdminCalendar: User is not admin:', user);
        throw new Error('Unauthorized access');
      }

      console.log('AdminCalendar: Fetching appointments...');
      const appointments = await getAppointments();
      console.log('AdminCalendar: Appointments:', appointments);
      
      // Only fetch services and customers if there are appointments
      let services: Service[] = [];
      let customers: Customer[] = [];
      
      if (appointments.length > 0) {
        console.log('AdminCalendar: Fetching services and customers...');
        const [serviceResults, customerResults] = await Promise.all([
          Promise.all(appointments.map(apt => getService(apt.service_id))),
          Promise.all(appointments.map(apt => getCustomer(apt.client_id)))
        ]);
        
        console.log('AdminCalendar: Service results:', serviceResults);
        console.log('AdminCalendar: Customer results:', customerResults);
        
        services = serviceResults;
        customers = customerResults;
      }
      
      console.log('AdminCalendar: Setting state with data');
      setState(prev => ({
        ...prev,
        user,
        appointments,
        services,
        customers,
        isLoading: false
      }));
    } catch (error: unknown) {
      console.error('AdminCalendar: Error loading data:', error instanceof Error ? error.message : 'An unknown error occurred');
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred', isLoading: false }));
    }
  };

  const loadAppointments = async (): Promise<void> => {
    try {
      // Implementation here
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const isAppointmentPassed = (date: string): boolean => {
    return isAfter(new Date(), new Date(date));
  };

  const scrollToFirstFutureAppointment = (): void => {
    if (appointmentsRef.current) {
      const firstFutureAppointment = appointmentsRef.current.querySelector('.future-appointment');
      if (firstFutureAppointment) {
        firstFutureAppointment.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleDateSelect = (date: Date): void => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const handleAppointmentAction = async (
    appointment: Appointment, 
    action: string, 
    reason: string = ""
  ): Promise<void> => {
    try {
      // Implementation here
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const groupAppointmentsByDay = (appointments: Appointment[]): Record<string, Appointment[]> => {
    return appointments.reduce((acc, appointment) => {
      const date = format(new Date(appointment.date), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);
  };

  const getServiceName = (serviceId: string): string => {
    const service = state.services.find(s => s.id === serviceId);
    return service ? service.name : "Unknown Service";
  };

  const getCustomerName = (clientId: string): string => {
    const customer = state.customers.find(c => c.id === clientId);
    return customer ? customer.full_name : "Unknown Customer";
  };

  const getCustomerPhone = (clientId: string): string => {
    const customer = state.customers.find(c => c.id === clientId);
    return customer?.phone ?? "Unknown Phone";
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
          <h1 className="text-3xl font-bold mb-4">יומן תורים</h1>
          <p className="text-gray-600">ניהול וצפייה בתורים</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">לוח שנה</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleDateSelect(new Date())}
              >
                היום
              </Button>
              <Select
                value={format(state.selectedDate, 'yyyy-MM-dd')}
                onValueChange={(value) => handleDateSelect(new Date(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="בחר תאריך" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(groupAppointmentsByDay(state.appointments)).map(date => (
                    <SelectItem key={date} value={date}>
                      {format(new Date(date), 'dd/MM/yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Calendar View */}
            <Card>
              <CardHeader>
                <CardTitle>לוח שנה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
                    <div key={day} className="text-center font-bold">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }).map((_, index) => {
                    const date = new Date(state.selectedDate);
                    date.setDate(1);
                    date.setDate(date.getDate() - date.getDay() + index);
                    
                    const appointments = state.appointments.filter(apt => 
                      format(new Date(apt.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                    );
                    
                    return (
                      <div
                        key={index}
                        className={`p-2 text-center border rounded cursor-pointer ${
                          format(date, 'yyyy-MM-dd') === format(state.selectedDate, 'yyyy-MM-dd')
                            ? 'bg-blue-100'
                            : format(date, 'yyyy-MM') === format(state.selectedDate, 'yyyy-MM')
                            ? 'bg-gray-50'
                            : 'bg-gray-100'
                        }`}
                        onClick={() => handleDateSelect(date)}
                      >
                        <div className="text-sm">{format(date, 'd')}</div>
                        {appointments.length > 0 && (
                          <div className="text-xs text-blue-500">{appointments.length} תורים</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Appointments List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  תורים ליום {format(state.selectedDate, 'dd/MM/yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div ref={appointmentsRef} className="space-y-4">
                  {state.appointments
                    .filter(apt => 
                      format(new Date(apt.date), 'yyyy-MM-dd') === format(state.selectedDate, 'yyyy-MM-dd')
                    )
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(apt => (
                      <div
                        key={apt.id}
                        className={`p-4 border rounded ${
                          isAppointmentPassed(apt.date) ? 'bg-gray-50' : 'future-appointment'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{getServiceName(apt.service_id)}</h3>
                            <p className="text-sm text-gray-500">
                              {format(new Date(apt.date), 'HH:mm')}
                            </p>
                            <p className="text-sm">
                              {getCustomerName(apt.client_id)} - {getCustomerPhone(apt.client_id)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAppointmentAction(apt, 'approve')}
                              disabled={isAppointmentPassed(apt.date)}
                            >
                              אישור
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setState(prev => ({
                                  ...prev,
                                  selectedAppointment: apt,
                                  showCancelDialog: true
                                }));
                              }}
                              disabled={isAppointmentPassed(apt.date)}
                            >
                              ביטול
                            </Button>
                          </div>
                        </div>
                        {apt.notes && (
                          <div className="mt-2 text-sm text-gray-500">
                            <strong>הערות:</strong> {apt.notes}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Appointment Dialog */}
        <Dialog open={state.showCancelDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCancelDialog: open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ביטול תור</DialogTitle>
              <DialogDescription>
                אנא הזן את סיבת הביטול
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  value={state.cancelReason}
                  onChange={(e) => setState(prev => ({ ...prev, cancelReason: e.target.value }))}
                  placeholder="סיבת הביטול"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showCancelDialog: false }))}
              >
                ביטול
              </Button>
              <Button
                onClick={() => {
                  if (state.selectedAppointment) {
                    handleAppointmentAction(state.selectedAppointment, 'cancel', state.cancelReason);
                  }
                  setState(prev => ({ ...prev, showCancelDialog: false, cancelReason: '' }));
                }}
              >
                אישור
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminCalendarPage; 