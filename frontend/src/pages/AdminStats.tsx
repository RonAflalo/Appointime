import React, { useState, useEffect } from "react";
import { User, Appointment, Service, Customer } from "@/types";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { getCurrentUser, getAppointments, getService, getCustomer } from "@/api/entities";
import { format, subMonths, subQuarters, subYears, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns";

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C43'];

interface AdminStatsPageProps {}

interface AdminStatsState {
  user: User | null;
  appointments: Appointment[];
  services: Service[];
  customers: Customer[];
  selectedRange: string;
  isLoading: boolean;
  error: string | null;
  incomeStats: {
    total: number;
    change: number;
    average: number;
  };
  timeSeriesData: Array<{
    date: string;
    income: number;
    appointments: number;
  }>;
  serviceIncomeData: Array<{
    name: string;
    value: number;
  }>;
  appointmentsVsIncomeData: Array<{
    appointments: number;
    income: number;
  }>;
  projections: {
    nextMonth: number;
    nextQuarter: number;
    nextYear: number;
  };
  customerInsights: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageAppointmentsPerCustomer: number;
  };
  customerTypeData: Array<{
    type: string;
    value: number;
  }>;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS'
  }).format(amount);
};

const AppointmentTooltip: React.FC<{ appointments: Appointment[] }> = ({ appointments }) => {
  return (
    <div className="bg-white p-2 border rounded shadow">
      <p className="font-bold">Appointments</p>
      {appointments.map(appointment => (
        <p key={appointment.id}>{appointment.date}</p>
      ))}
    </div>
  );
};

const AdminStatsPage: React.FC<AdminStatsPageProps> = () => {
  const [state, setState] = useState<AdminStatsState>({
    user: null,
    appointments: [],
    services: [],
    customers: [],
    selectedRange: "month",
    isLoading: true,
    error: null,
    incomeStats: {
      total: 0,
      change: 0,
      average: 0
    },
    timeSeriesData: [],
    serviceIncomeData: [],
    appointmentsVsIncomeData: [],
    projections: {
      nextMonth: 0,
      nextQuarter: 0,
      nextYear: 0
    },
    customerInsights: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      averageAppointmentsPerCustomer: 0
    },
    customerTypeData: []
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

      const fetchedAppointments = await getAppointments();
      const [services, customers] = await Promise.all([
        Promise.all(fetchedAppointments.map((apt: Appointment) => getService(apt.service_id))),
        Promise.all(fetchedAppointments.map((apt: Appointment) => getCustomer(apt.client_id)))
      ]);

      const serviceMap = services.reduce((acc, service) => {
        acc[service.id] = service;
        return acc;
      }, {} as Record<string, Service>);

      const customerMap = customers.reduce((acc, customer) => {
        acc[customer.id] = customer;
        return acc;
      }, {} as Record<string, Customer>);

      const incomeStats = calculateIncomeStats(fetchedAppointments, serviceMap);
      const timeSeriesData = generateTimeSeriesData(fetchedAppointments, serviceMap, state.selectedRange);
      const serviceIncomeData = generateServiceIncomeData(fetchedAppointments, serviceMap);
      const appointmentsVsIncomeData = generateAppointmentsVsIncomeData(fetchedAppointments, serviceMap);
      const projections = calculateProjections(fetchedAppointments, serviceMap);
      const customerInsights = calculateCustomerInsights(fetchedAppointments, customerMap);
      const customerTypeData = generateCustomerTypeData(fetchedAppointments, customerMap);

      setState(prev => ({
        ...prev,
        user,
        appointments: fetchedAppointments,
        services: Object.values(serviceMap),
        customers: Object.values(customerMap),
        incomeStats,
        timeSeriesData,
        serviceIncomeData,
        appointmentsVsIncomeData,
        projections,
        customerInsights,
        customerTypeData,
        isLoading: false
      }));
    } catch (error: unknown) {
      console.error('Error loading stats:', error instanceof Error ? error.message : 'An unknown error occurred');
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      }));
    }
  };

  const calculateIncomeStats = (
    appointments: Appointment[], 
    services: Record<string, Service>
  ): { total: number; change: number; average: number } => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const twoMonthsAgo = subMonths(now, 2);

    const currentMonthIncome = calculateIncomeForDateRange(
      appointments,
      services,
      startOfMonth(now),
      endOfMonth(now)
    );

    const lastMonthIncome = calculateIncomeForDateRange(
      appointments,
      services,
      startOfMonth(lastMonth),
      endOfMonth(lastMonth)
    );

    const change = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
    const average = currentMonthIncome / appointments.length;

    return {
      total: currentMonthIncome,
      change,
      average: isNaN(average) ? 0 : average
    };
  };

  const calculateIncomeForDateRange = (
    appointments: Appointment[], 
    services: Record<string, Service>, 
    startDate: Date, 
    endDate: Date
  ): number => {
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return isWithinInterval(aptDate, { start: startDate, end: endDate });
      })
      .reduce((total, apt) => {
        const service = services[apt.service_id];
        return total + (service?.price || 0);
      }, 0);
  };

  const generateTimeSeriesData = (
    appointments: Appointment[], 
    services: Record<string, Service>, 
    range: string
  ): Array<{ date: string; income: number; appointments: number }> => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (range) {
      case "week":
        startDate = subMonths(now, 1);
        endDate = now;
        break;
      case "month":
        startDate = subMonths(now, 6);
        endDate = now;
        break;
      case "year":
        startDate = subYears(now, 1);
        endDate = now;
        break;
      default:
        startDate = subMonths(now, 6);
        endDate = now;
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => {
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return format(aptDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const income = dayAppointments.reduce((total, apt) => {
        const service = services[apt.service_id];
        return total + (service?.price || 0);
      }, 0);

      return {
        date: format(day, 'MMM d'),
        income,
        appointments: dayAppointments.length
      };
    });
  };

  const generateServiceIncomeData = (
    appointments: Appointment[], 
    services: Record<string, Service>
  ): Array<{ name: string; value: number }> => {
    const serviceIncome = appointments.reduce((acc, apt) => {
      const service = services[apt.service_id];
      if (service) {
        acc[service.name] = (acc[service.name] || 0) + service.price;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(serviceIncome).map(([name, value]) => ({
      name,
      value
    }));
  };

  const generateAppointmentsVsIncomeData = (
    appointments: Appointment[], 
    services: Record<string, Service>
  ): Array<{ appointments: number; income: number }> => {
    const now = new Date();
    const lastSixMonths = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date)
      };
    });

    return lastSixMonths.map(({ start, end }) => {
      const monthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return isWithinInterval(aptDate, { start, end });
      });

      const income = monthAppointments.reduce((total, apt) => {
        const service = services[apt.service_id];
        return total + (service?.price || 0);
      }, 0);

      return {
        appointments: monthAppointments.length,
        income
      };
    });
  };

  const calculateProjections = (
    appointments: Appointment[], 
    services: Record<string, Service>
  ): { nextMonth: number; nextQuarter: number; nextYear: number } => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    const lastQuarter = subQuarters(now, 1);
    const lastYear = subYears(now, 1);

    const lastMonthIncome = calculateIncomeForDateRange(
      appointments,
      services,
      startOfMonth(lastMonth),
      endOfMonth(lastMonth)
    );

    const lastQuarterIncome = calculateIncomeForDateRange(
      appointments,
      services,
      startOfMonth(lastQuarter),
      endOfMonth(now)
    );

    const lastYearIncome = calculateIncomeForDateRange(
      appointments,
      services,
      startOfMonth(lastYear),
      endOfMonth(now)
    );

    return {
      nextMonth: lastMonthIncome * 1.1, // 10% growth
      nextQuarter: lastQuarterIncome * 1.15, // 15% growth
      nextYear: lastYearIncome * 1.2 // 20% growth
    };
  };

  const calculateCustomerInsights = (
    appointments: Appointment[],
    customers: Record<string, Customer>
  ): {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    averageAppointmentsPerCustomer: number;
  } => {
    const customerAppointments = appointments.reduce((acc, apt) => {
      acc[apt.client_id] = (acc[apt.client_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalAppointments = appointments.length;
    const totalCustomers = Object.keys(customerAppointments).length;
    const newCustomers = appointments
      .filter((apt, index, self) => 
        index === self.findIndex((a: Appointment) => a.client_id === apt.client_id)
      ).length;
    const returningCustomers = totalCustomers - newCustomers;
    const averageAppointmentsPerCustomer = totalCustomers > 0 ? totalAppointments / totalCustomers : 0;

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      averageAppointmentsPerCustomer
    };
  };

  const generateCustomerTypeData = (
    appointments: Appointment[],
    customers: Record<string, Customer>
  ): Array<{ type: string; value: number }> => {
    const customerTypes = appointments.reduce((acc, apt) => {
      const customer = customers[apt.client_id];
      const isNew = appointments.findIndex((a: Appointment) => a.client_id === apt.client_id) === 
                   [...appointments].reverse().findIndex((a: Appointment) => a.client_id === apt.client_id);
      const type = isNew ? 'New Customers' : 'Returning Customers';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(customerTypes).map(([type, value]) => ({
      type,
      value
    }));
  };

  const CustomerTypeTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-bold">{label}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? "text-green-500" : "text-red-500";
  };

  const getChangeIcon = (change: number): React.ReactNode => {
    return change >= 0 ? <TrendingUp /> : <TrendingDown />;
  };

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getAppointmentsForPeriod = (startDate: Date, endDate: Date): Appointment[] => {
    return state.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          <h1 className="text-3xl font-bold mb-4">סטטיסטיקות</h1>
          <p className="text-gray-600">צפייה בסטטיסטיקות המערכת</p>
        </div>
        <div className="flex items-center justify-between" style={{ direction: 'rtl', flexDirection: 'row-reverse' }}>
          <Select
            value={state.selectedRange}
            onValueChange={(value) => setState(prev => ({ ...prev, selectedRange: value }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="בחר טווח" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">שבוע</SelectItem>
              <SelectItem value="month">חודש</SelectItem>
              <SelectItem value="quarter">רבעון</SelectItem>
              <SelectItem value="year">שנה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Income Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>הכנסה כוללת</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-row-reverse">
                <div className="text-2xl font-bold">
                  {formatCurrency(state.incomeStats.total)}
                </div>
                <div className={`flex items-center ${getChangeColor(state.incomeStats.change)}`}>
                  {getChangeIcon(state.incomeStats.change)}
                  <span>{Math.abs(state.incomeStats.change)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>הכנסה ממוצעת</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(state.incomeStats.average)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>תחזית</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between flex-row-reverse">
                  <span>חודש הבא:</span>
                  <span className="font-medium">{formatCurrency(state.projections.nextMonth)}</span>
                </div>
                <div className="flex justify-between flex-row-reverse">
                  <span>רבעון הבא:</span>
                  <span className="font-medium">{formatCurrency(state.projections.nextQuarter)}</span>
                </div>
                <div className="flex justify-between flex-row-reverse">
                  <span>שנה הבאה:</span>
                  <span className="font-medium">{formatCurrency(state.projections.nextYear)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time Series Chart */}
          <Card>
            <CardHeader>
              <CardTitle>הכנסה לאורך זמן</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={state.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#8884d8" name="הכנסה" />
                  <Line type="monotone" dataKey="appointments" stroke="#82ca9d" name="תורים" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Income Chart */}
          <Card>
            <CardHeader>
              <CardTitle>הכנסה לפי שירות</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={state.serviceIncomeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {state.serviceIncomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomerTypeTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Customer Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>נתוני לקוחות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500">סה"כ לקוחות</div>
                  <div className="text-2xl font-bold">{state.customerInsights.totalCustomers}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">לקוחות חדשים</div>
                  <div className="text-2xl font-bold">{state.customerInsights.newCustomers}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">לקוחות חוזרים</div>
                  <div className="text-2xl font-bold">{state.customerInsights.returningCustomers}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">ממוצע תורים ללקוח</div>
                  <div className="text-2xl font-bold">{state.customerInsights.averageAppointmentsPerCustomer}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Type Chart */}
          <Card>
            <CardHeader>
              <CardTitle>סוגי לקוחות</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={state.customerTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip content={<CustomerTypeTooltip />} />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="לקוחות" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsPage; 