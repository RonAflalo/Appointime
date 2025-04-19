import React, { useState, useEffect } from "react";
import { User, Review, Customer, Service } from "../types";
import { getCurrentUser, getReviews, getCustomer, getService, updateReview, deleteReview } from "../api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
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
import { Star } from "lucide-react";

interface AdminReviewsPageProps {}

interface AdminReviewsState {
  user: User | null;
  reviews: Review[];
  customers: Customer[];
  services: Service[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  selectedReview: Review | null;
  editNote: string;
}

const AdminReviewsPage: React.FC<AdminReviewsPageProps> = () => {
  const [state, setState] = useState<AdminReviewsState>({
    user: null,
    reviews: [],
    customers: [],
    services: [],
    searchQuery: "",
    isLoading: true,
    error: null,
    showEditDialog: false,
    showDeleteDialog: false,
    selectedReview: null,
    editNote: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      const user = await getCurrentUser();
      if (user.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      const reviews = await getReviews();
      const [customers, services] = await Promise.all([
        Promise.all(reviews.map((r: Review) => getCustomer(r.customer_id))),
        Promise.all(reviews.map((r: Review) => getService(r.service_id)))
      ]);

      setState(prev => ({
        ...prev,
        user,
        reviews,
        customers,
        services,
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

  const getCustomerName = (customerId: string): string => {
    const customer = state.customers.find(c => c.id === customerId);
    return customer ? customer.full_name : "Unknown Customer";
  };

  const getFlagColor = (flag: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (flag) {
      case 'red': return 'destructive';
      case 'yellow': return 'outline';
      case 'green': return 'secondary';
      default: return 'default';
    }
  };

  const handleStatusChange = async (review: Review, newStatus: string): Promise<void> => {
    try {
      await updateReview(review.id, { rating: review.rating, comment: review.comment });
      await loadData();
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const handleEditNote = async (): Promise<void> => {
    try {
      if (state.selectedReview) {
        await updateReview(state.selectedReview.id, {
          rating: state.selectedReview.rating,
          comment: state.editNote
        });
        setState(prev => ({ ...prev, showEditDialog: false, editNote: '' }));
        await loadData();
      }
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const handleDeleteReview = async (): Promise<void> => {
    try {
      if (state.selectedReview) {
        await deleteReview(state.selectedReview.id);
        setState(prev => ({ ...prev, showDeleteDialog: false }));
        await loadData();
      }
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const filteredItems = (): Review[] => {
    return state.reviews.filter(review => {
      const customer = state.customers.find(c => c.id === review.customer_id);
      const matchesSearch = customer?.full_name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        review.comment?.toLowerCase().includes(state.searchQuery.toLowerCase());
      return matchesSearch;
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
          <h1 className="text-3xl font-bold mb-4">ביקורות</h1>
          <p className="text-gray-600">ניהול ביקורות לקוחות</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="חיפוש ביקורות..."
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-64"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">כל הביקורות</TabsTrigger>
            <TabsTrigger value="featured">מומלצות</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-4">
              {filteredItems().map((review) => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold">{getCustomerName(review.customer_id)}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('he-IL')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setState(prev => ({
                              ...prev,
                              selectedReview: review,
                              editNote: review.comment || '',
                              showEditDialog: true
                            }));
                          }}
                        >
                          ערוך
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setState(prev => ({
                              ...prev,
                              selectedReview: review,
                              showDeleteDialog: true
                            }));
                          }}
                        >
                          מחק
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Note Dialog */}
        <Dialog open={state.showEditDialog} onOpenChange={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ערוך הערה</DialogTitle>
              <DialogDescription>
                הוסף או ערוך הערה לביקורת זו
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={state.editNote}
                onChange={(e) => setState(prev => ({ ...prev, editNote: e.target.value }))}
                placeholder="הקלד את ההערה שלך כאן..."
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                ביטול
              </Button>
              <Button onClick={handleEditNote}>שמור</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={state.showDeleteDialog} onOpenChange={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>מחיקת ביקורת</AlertDialogTitle>
              <AlertDialogDescription>
                האם אתה בטוח שברצונך למחוק ביקורת זו? פעולה זו אינה ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteReview}>מחק</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminReviewsPage; 