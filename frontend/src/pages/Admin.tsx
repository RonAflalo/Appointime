import React, { useState, useEffect } from "react";
import { format, isAfter, addHours, isWithinInterval, subHours, startOfDay, endOfDay, addDays } from "date-fns";
import { he } from "date-fns/locale";
import { SendEmail } from "@/api/integrations";
import { User, Appointment, Service, Customer } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  CalendarDays, 
  Users, 
  Calendar, 
  AlertTriangle,
  Check,
  Clock,
  Settings,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ChevronDown,
  X
} from "lucide-react";
import { getCurrentUser, getAppointments, getService, getCustomer, updateAppointment } from "@/api/entities";

interface AdminPageProps {}

interface AdminState {
  user: User | null;
  appointments: Appointment[];
  services: Record<string, Service>;
  customers: Record<string, Customer>;
  selectedDate: Date;
  customRange: string;
  mobileTab: string;
  isLoading: boolean;
  error: string | null;
}

const AdminPage: React.FC<AdminPageProps> = () => {
  const [state, setState] = useState<AdminState>({
    user: null,
    appointments: [],
    services: {},
    customers: {},
    selectedDate: new Date(),
    customRange: "today",
    mobileTab: "appointments",
    isLoading: true,
    error: null
  });

  useEffect(() => {
    console.log('Admin: Component mounted, starting data load');
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async (): Promise<void> => {
    try {
      console.log('Admin: Checking admin access...');
      const user = await getCurrentUser();
      console.log('Admin: Current user:', user);
      if (!user || user.role !== 'admin') {
        console.log('Admin: User is not admin:', user);
        throw new Error('Unauthorized access');
      }

      console.log('Admin: Fetching appointments...');
      const appointments = await getAppointments();
      console.log('Admin: Appointments:', appointments);
      
      // Only fetch services and customers if there are appointments
      let services: Record<string, Service> = {};
      let customers: Record<string, Customer> = {};
      
      if (appointments.length > 0) {
        console.log('Admin: Fetching services and customers...');
        const servicePromises = appointments.map(apt => getService(apt.service_id).catch(e => {
          console.error('Admin: Error fetching service:', e);
          return null;
        }));
        const customerPromises = appointments.map(apt => getCustomer(apt.client_id).catch(e => {
          console.error('Admin: Error fetching customer:', e);
          return null;
        }));
        
        const [serviceResults, customerResults] = await Promise.all([
          Promise.all(servicePromises),
          Promise.all(customerPromises)
        ]);
        
        console.log('Admin: Service results:', serviceResults);
        console.log('Admin: Customer results:', customerResults);
        
        services = serviceResults.reduce((acc, service) => {
          if (service) acc[service.id] = service;
          return acc;
        }, {} as Record<string, Service>);
        
        customers = customerResults.reduce((acc, customer) => {
          if (customer) acc[customer.id] = customer;
          return acc;
        }, {} as Record<string, Customer>);
      }
      
      console.log('Admin: Setting state with data');
      setState(prev => ({
        ...prev,
        user,
        appointments,
        services,
        customers,
        isLoading: false
      }));
    } catch (error: unknown) {
      console.error('Admin: Error loading data:', error instanceof Error ? error.message : 'An unknown error occurred');
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      }));
    }
  };

  const handleDateSelect = (date: Date): void => {
    setState(prev => ({ ...prev, selectedDate: date }));
  };

  const handleCustomRangeChange = (value: string): void => {
    setState(prev => ({ ...prev, customRange: value }));
  };

  const handleMobileTabChange = (value: string): void => {
    setState(prev => ({ ...prev, mobileTab: value }));
  };

  const handleAppointmentAction = async (
    appointment: Appointment, 
    action: string, 
    reason: string = ""
  ): Promise<void> => {
    try {
      const updatedAppointment = await updateAppointment(appointment.id, {
        ...appointment,
        status: action === 'approve' ? 'approved' : 'cancelled',
        cancellation_reason: action === 'reject' ? reason : undefined
      });

      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === updatedAppointment.id ? updatedAppointment : apt
        )
      }));

      // Send email notification
      if (action === 'approve') {
        await SendEmail({
          to: state.customers[appointment.client_id]?.email,
          subject: 'Appointment Approved',
          text: `Your appointment for ${format(new Date(appointment.date), 'PPP', { locale: he })} at ${format(new Date(appointment.date), 'HH:mm', { locale: he })} has been approved.`
        });
      } else if (action === 'reject') {
        await SendEmail({
          to: state.customers[appointment.client_id]?.email,
          subject: 'Appointment Cancelled',
          text: `Your appointment for ${format(new Date(appointment.date), 'PPP', { locale: he })} at ${format(new Date(appointment.date), 'HH:mm', { locale: he })} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`
        });
      }
    } catch (error: unknown) {
      console.error('Error handling admin action:', error instanceof Error ? error.message : 'An unknown error occurred');
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const groupAppointmentsByDay = (appointments: Appointment[]): Record<string, Appointment[]> => {
    return appointments.reduce((acc, appointment) => {
      const date = format(new Date(appointment.date), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(appointment);
      return acc;
    }, {} as Record<string, Appointment[]>);
  };

  const renderPendingAppointments = (): JSX.Element => {
    const pendingAppointments = state.appointments.filter(apt => apt.status === 'pending');
    const groupedAppointments = groupAppointmentsByDay(pendingAppointments);

    return (
      <div className="space-y-4">
        {Object.entries(groupedAppointments).map(([date, appointments]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle>{format(new Date(date), 'PPP', { locale: he })}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map(appointment => (
                    <TableRow key={appointment.id}>
                      <TableCell>{format(new Date(appointment.date), 'HH:mm', { locale: he })}</TableCell>
                      <TableCell>{state.services[appointment.service_id]?.name}</TableCell>
                      <TableCell>{state.customers[appointment.client_id]?.full_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{appointment.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAppointmentAction(appointment, 'approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAppointmentAction(appointment, 'reject')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4" />
          <p className="text-lg font-medium">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="appointments">
          {renderPendingAppointments()}
        </TabsContent>
        <TabsContent value="customers">
          <p>Customers content</p>
        </TabsContent>
        <TabsContent value="services">
          <p>Services content</p>
        </TabsContent>
        <TabsContent value="settings">
          <p>Settings content</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage; 