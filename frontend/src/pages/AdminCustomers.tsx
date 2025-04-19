import React, { useState, useEffect } from "react";
import { User, Customer } from "../types";
import { getCurrentUser, getCustomers, updateCustomer, deleteCustomer, createCustomer } from "../api/entities";
import { SendEmail } from "../api/integrations";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { 
  AlertTriangle, 
  Edit, 
  Loader2, 
  Search, 
  UserCog, 
  MoreHorizontal, 
  Mail,
  MessageSquare,
  Flag,
  Info,
  Phone,
  Calendar,
  User as UserIcon,
  Trash2
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface AdminCustomersPageProps {}

interface AdminCustomersState {
  user: User | null;
  customers: Customer[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  showEditDialog: boolean;
  showDetailsDialog: boolean;
  showNoteDialog: boolean;
  showEmailDialog: boolean;
  showDeleteDialog: boolean;
  showCreateDialog: boolean;
  selectedCustomer: Customer | null;
  editForm: {
    full_name: string;
    phone: string | undefined;
    email: string | undefined;
  };
  createForm: {
    full_name: string;
    phone: string | undefined;
    email: string | undefined;
  };
  noteText: string;
  emailSubject: string;
  emailBody: string;
}

const AdminCustomersPage: React.FC<AdminCustomersPageProps> = () => {
  const [state, setState] = useState<AdminCustomersState>({
    user: null,
    customers: [],
    searchQuery: "",
    isLoading: true,
    error: null,
    showEditDialog: false,
    showDetailsDialog: false,
    showNoteDialog: false,
    showEmailDialog: false,
    showDeleteDialog: false,
    showCreateDialog: false,
    selectedCustomer: null,
    editForm: {
      full_name: "",
      phone: undefined,
      email: undefined
    },
    createForm: {
      full_name: "",
      phone: undefined,
      email: undefined
    },
    noteText: "",
    emailSubject: "",
    emailBody: ""
  });

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      console.log('Current user:', user);
      console.log('User business:', user.business);
      console.log('User business ID:', user.business?.id);
      
      if (user.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      if (!user.businessId) {
        throw new Error('Admin user must be associated with a business');
      }

      const customers = await getCustomers();
      console.log('Fetched customers:', customers);
      
      setState(prev => ({
        ...prev,
        user,
        customers,
        isLoading: false
      }));
    } catch (error: unknown) {
      console.error('Error in checkAdminAndLoadData:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isLoading: false 
      }));
    }
  };

  const handleEditCustomer = (customer: Customer): void => {
    setState(prev => ({
      ...prev,
      selectedCustomer: customer,
      showEditDialog: true,
      editForm: {
        full_name: customer.full_name,
        phone: customer.phone,
        email: customer.email
      }
    }));
  };

  const handleShowDetails = (customer: Customer): void => {
    setState(prev => ({
      ...prev,
      selectedCustomer: customer,
      showDetailsDialog: true
    }));
  };

  const handleAddNote = (customer: Customer): void => {
    setState(prev => ({
      ...prev,
      selectedCustomer: customer,
      showNoteDialog: true,
      noteText: customer.notes || ""
    }));
  };

  const handleUpdateCustomer = async (): Promise<void> => {
    try {
      if (!state.selectedCustomer) return;

      const updatedCustomer = await updateCustomer(state.selectedCustomer.id, {
        full_name: state.editForm.full_name,
        phone: state.editForm.phone,
        email: state.editForm.email
      });

      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => 
          c.id === updatedCustomer.id ? updatedCustomer : c
        ),
        showEditDialog: false,
        selectedCustomer: null
      }));
    } catch (error: unknown) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
    }
  };

  const handleSaveNote = async (): Promise<void> => {
    try {
      if (!state.selectedCustomer) return;

      const updatedCustomer = await updateCustomer(state.selectedCustomer.id, {
        notes: state.noteText
      });

      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => 
          c.id === updatedCustomer.id ? updatedCustomer : c
        ),
        showNoteDialog: false,
        selectedCustomer: null
      }));
    } catch (error: unknown) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
    }
  };

  const handleSetFlag = async (flagColor: 'red' | 'yellow' | 'green' | undefined): Promise<void> => {
    try {
      if (!state.selectedCustomer) return;

      const updatedCustomer = await updateCustomer(state.selectedCustomer.id, {
        flag: flagColor
      });

      setState(prev => ({
        ...prev,
        customers: prev.customers.map(c => 
          c.id === updatedCustomer.id ? updatedCustomer : c
        ),
        showDetailsDialog: false,
        selectedCustomer: null
      }));
    } catch (error: unknown) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
    }
  };

  const handleSendEmail = async (customer: Customer): Promise<void> => {
    try {
      setState(prev => ({ ...prev, showEmailDialog: true, selectedCustomer: customer }));
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const handleDeleteCustomer = async (customer: Customer): Promise<void> => {
    try {
      setState(prev => ({ ...prev, showDeleteDialog: true, selectedCustomer: customer }));
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const handleEmailCustomer = (customer: Customer): void => {
    setState(prev => ({
      ...prev,
      selectedCustomer: customer,
      showEmailDialog: true,
      emailSubject: "",
      emailBody: ""
    }));
  };

  const handleCreateCustomer = async (): Promise<void> => {
    try {
      console.log('Current user:', state.user);
      console.log('User business:', state.user?.business);
      console.log('User business ID:', state.user?.business?.id);
      
      if (!state.user?.business?.id) {
        throw new Error('User is not associated with a business');
      }

      const customerData = {
        full_name: state.createForm.full_name,
        phone: state.createForm.phone,
        email: state.createForm.email,
        businessId: state.user.business.id
      };

      console.log('Creating customer with data:', customerData);

      const newCustomer = await createCustomer(customerData);
      console.log('Created customer:', newCustomer);

      setState(prev => ({
        ...prev,
        customers: [...prev.customers, newCustomer],
        showCreateDialog: false,
        createForm: {
          full_name: "",
          phone: undefined,
          email: undefined
        }
      }));
    } catch (error: unknown) {
      console.error('Error creating customer:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
    }
  };

  const getFlagColor = (flag: string | undefined): "default" | "destructive" | "outline" | "secondary" => {
    switch (flag) {
      case 'red': return 'destructive';
      case 'yellow': return 'outline';
      case 'green': return 'secondary';
      default: return 'default';
    }
  };

  const getFlagLabel = (flag: string | undefined): string => {
    switch (flag) {
      case 'red': return 'אדום';
      case 'yellow': return 'צהוב';
      case 'green': return 'ירוק';
      default: return 'ללא דגל';
    }
  };

  const filteredItems = () => {
    return state.customers.filter(customer => 
      customer.full_name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      customer.phone?.includes(state.searchQuery) ||
      customer.email?.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
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
    <div className="w-full" dir="rtl">
      <div className="flex flex-col gap-8 p-4">
        <div className="text-right">
          <h1 className="text-3xl font-bold mb-4">ניהול לקוחות</h1>
          <p className="text-gray-600">צפייה וניהול לקוחות</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="חיפוש לקוחות..."
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full md:w-64 pl-8"
              />
            </div>
            <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
              הוסף לקוח חדש
            </Button>
          </div>

          {state.isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : state.error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">{state.error}</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">שם</TableHead>
                      <TableHead className="text-right hidden md:table-cell">טלפון</TableHead>
                      <TableHead className="text-right hidden md:table-cell">אימייל</TableHead>
                      <TableHead className="text-right hidden md:table-cell">סטטוס</TableHead>
                      <TableHead className="text-right">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems().map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{customer.full_name}</span>
                            <span className="text-sm text-gray-500 md:hidden">
                              {customer.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{customer.phone}</TableCell>
                        <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getFlagColor(customer.flag || '')}>
                            {getFlagLabel(customer.flag || '')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShowDetails(customer)}
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAddNote(customer)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSendEmail(customer)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCustomer(customer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={state.showEditDialog} onOpenChange={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-right">עריכת לקוח</DialogTitle>
                <DialogDescription className="text-right">
                  עדכן את פרטי הלקוח
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-right">שם מלא</Label>
                  <Input
                    value={state.editForm.full_name}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      editForm: { ...prev.editForm, full_name: e.target.value }
                    }))}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right">טלפון</Label>
                  <Input
                    value={state.editForm.phone}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      editForm: { ...prev.editForm, phone: e.target.value }
                    }))}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right">אימייל</Label>
                  <Input
                    value={state.editForm.email}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      editForm: { ...prev.editForm, email: e.target.value }
                    }))}
                    className="text-right"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                  ביטול
                </Button>
                <Button onClick={handleUpdateCustomer}>שמור</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Details Dialog */}
          <Dialog open={state.showDetailsDialog} onOpenChange={() => setState(prev => ({ ...prev, showDetailsDialog: false }))}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-right">פרטי לקוח</DialogTitle>
              </DialogHeader>
              {state.selectedCustomer && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-right">שם מלא</Label>
                    <p className="text-right">{state.selectedCustomer.full_name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right">טלפון</Label>
                    <p className="text-right">{state.selectedCustomer.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right">אימייל</Label>
                    <p className="text-right">{state.selectedCustomer.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-right">סטטוס</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={state.selectedCustomer.flag === 'red' ? 'destructive' : 'outline'}
                        size="sm"
                        onClick={() => handleSetFlag('red')}
                      >
                        אדום
                      </Button>
                      <Button
                        variant={state.selectedCustomer.flag === 'yellow' ? 'outline' : 'outline'}
                        size="sm"
                        onClick={() => handleSetFlag('yellow')}
                      >
                        צהוב
                      </Button>
                      <Button
                        variant={state.selectedCustomer.flag === 'green' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleSetFlag('green')}
                      >
                        ירוק
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetFlag(undefined)}
                      >
                        ללא דגל
                      </Button>
                    </div>
                  </div>
                  {state.selectedCustomer.notes && (
                    <div className="space-y-2">
                      <Label className="text-right">הערות</Label>
                      <p className="text-right">{state.selectedCustomer.notes}</p>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAddNote(state.selectedCustomer!)}
                    >
                      הוסף הערה
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Note Dialog */}
          <Dialog open={state.showNoteDialog} onOpenChange={() => setState(prev => ({ ...prev, showNoteDialog: false }))}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-right">הוספת הערה</DialogTitle>
                <DialogDescription className="text-right">
                  הוסף הערה ללקוח
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={state.noteText}
                  onChange={(e) => setState(prev => ({ ...prev, noteText: e.target.value }))}
                  className="text-right"
                  placeholder="הקלד את ההערה שלך כאן..."
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showNoteDialog: false }))}>
                  ביטול
                </Button>
                <Button onClick={handleSaveNote}>שמור</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Email Dialog */}
          <Dialog open={state.showEmailDialog} onOpenChange={() => setState(prev => ({ ...prev, showEmailDialog: false }))}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-right">שליחת אימייל</DialogTitle>
                <DialogDescription className="text-right">
                  שלח אימייל ללקוח
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-right">נושא</Label>
                  <Input
                    value={state.emailSubject}
                    onChange={(e) => setState(prev => ({ ...prev, emailSubject: e.target.value }))}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right">תוכן</Label>
                  <Textarea
                    value={state.emailBody}
                    onChange={(e) => setState(prev => ({ ...prev, emailBody: e.target.value }))}
                    className="text-right"
                    placeholder="הקלד את תוכן האימייל כאן..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEmailDialog: false }))}>
                  ביטול
                </Button>
                <Button onClick={() => handleSendEmail(state.selectedCustomer!)}>שלח</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <AlertDialog open={state.showDeleteDialog} onOpenChange={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right">מחיקת לקוח</AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  האם אתה בטוח שברצונך למחוק לקוח זה? פעולה זו אינה ניתנת לביטול.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteCustomer(state.selectedCustomer!)}>מחק</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Create Dialog */}
          <Dialog open={state.showCreateDialog} onOpenChange={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-right">הוספת לקוח חדש</DialogTitle>
                <DialogDescription className="text-right">
                  הזן את פרטי הלקוח החדש
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-right">שם מלא</Label>
                  <Input
                    value={state.createForm.full_name}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      createForm: { ...prev.createForm, full_name: e.target.value }
                    }))}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right">טלפון</Label>
                  <Input
                    value={state.createForm.phone}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      createForm: { ...prev.createForm, phone: e.target.value }
                    }))}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right">אימייל</Label>
                  <Input
                    value={state.createForm.email}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      createForm: { ...prev.createForm, email: e.target.value }
                    }))}
                    className="text-right"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                  ביטול
                </Button>
                <Button onClick={handleCreateCustomer}>שמור</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomersPage; 