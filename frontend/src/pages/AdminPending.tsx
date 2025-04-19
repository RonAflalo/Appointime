import React, { useState, useEffect } from "react";
import { User, Appointment, Service, Customer } from "../types";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { getCurrentUser, getAppointments, getService, getCustomer } from "../api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { SendEmail } from "../api/integrations";
import { 
  Loader2, 
  AlertTriangle,
  X
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

interface AdminPendingPageProps {}

interface AdminPendingState {
  user: User | null;
  appointments: Appointment[];
  services: Service[];
  customers: Customer[];
  isLoading: boolean;
  error: string | null;
  showCancelDialog: boolean;
  selectedAppointment: Appointment | null;
  cancelReason: string;
}

const AdminPendingPage: React.FC<AdminPendingPageProps> = () => {
  const [state, setState] = useState<AdminPendingState>({
    user: null,
    appointments: [],
    services: [],
    customers: [],
    isLoading: true,
    error: null,
    showCancelDialog: false,
    selectedAppointment: null,
    cancelReason: ""
  });

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      if (user.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      const appointments = await getAppointments();
      const pendingAppointments = appointments.filter(a => a.status === 'pending');
      
      const [services, customers] = await Promise.all([
        Promise.all(pendingAppointments.map(a => getService(a.service_id))),
        Promise.all(pendingAppointments.map(a => getCustomer(a.client_id)))
      ]);

      setState(prev => ({
        ...prev,
        user,
        appointments: pendingAppointments,
        services,
        customers,
        isLoading: false
      }));
    } catch (error: unknown) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      }));
    }
  };

  const handleAppointmentAction = async (
    appointment: Appointment, 
    action: 'approved' | 'cancelled', 
    reason: string = ""
  ): Promise<void> => {
    try {
      // TODO: Implement appointment status change API call
      if (action === 'cancelled') {
        // TODO: Send cancellation email
        await SendEmail({
          to: getCustomerEmail(appointment.client_id),
          subject: "ביטול תור",
          text: `התור שלך בוטל. סיבת הביטול: ${reason}`
        });
      }
      
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.filter(a => a.id !== appointment.id),
        showCancelDialog: false,
        selectedAppointment: null,
        cancelReason: ""
      }));
    } catch (error: unknown) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }));
    }
  };

  const getServiceName = (serviceId: string): string => {
    const service = state.services.find(s => s.id === serviceId);
    return service ? service.name : "שירות לא ידוע";
  };

  const getCustomerName = (clientId: string): string => {
    const customer = state.customers.find(c => c.user_id === clientId);
    return customer ? customer.full_name : "לקוח לא ידוע";
  };

  const getCustomerPhone = (clientId: string): string => {
    const customer = state.customers.find(c => c.user_id === clientId);
    return customer ? customer.phone : "מספר טלפון לא ידוע";
  };

  const getCustomerEmail = (clientId: string): string => {
    const customer = state.customers.find(c => c.user_id === clientId);
    return customer ? customer.email : "";
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
          <h1 className="text-3xl font-bold mb-4">תורים ממתינים</h1>
          <p className="text-gray-600">ניהול תורים ממתינים</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {state.appointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold">{getCustomerName(appointment.client_id)}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(appointment.date), 'EEEE, d MMMM yyyy', { locale: he })}
                      </span>
                      <span className="text-sm text-gray-500">{getCustomerPhone(appointment.client_id)}</span>
                    </div>
                    <Badge variant="outline">ממתין</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAppointmentAction(appointment, 'approved')}
                    >
                      אישור
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setState(prev => ({
                          ...prev,
                          selectedAppointment: appointment,
                          showCancelDialog: true
                        }));
                      }}
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-bold">שירות:</span> {getServiceName(appointment.service_id)}
                  </p>
                  {appointment.notes && (
                    <p className="text-gray-700">
                      <span className="font-bold">הערות:</span> {appointment.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cancel Dialog */}
        <Dialog open={state.showCancelDialog} onOpenChange={() => setState(prev => ({ ...prev, showCancelDialog: false }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-right">ביטול תור</DialogTitle>
              <DialogDescription className="text-right">
                אנא הזן סיבה לביטול התור
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-right">סיבת הביטול</Label>
                <Textarea
                  value={state.cancelReason}
                  onChange={(e) => setState(prev => ({ ...prev, cancelReason: e.target.value }))}
                  className="text-right"
                  placeholder="הזן סיבת ביטול..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCancelDialog: false }))}>
                ביטול
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (state.selectedAppointment) {
                    handleAppointmentAction(state.selectedAppointment, 'cancelled', state.cancelReason);
                  }
                }}
              >
                אישור ביטול
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPendingPage; 