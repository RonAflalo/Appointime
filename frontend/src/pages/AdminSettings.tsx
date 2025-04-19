import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, SiteSettings } from "../types";
import { UploadFile } from "../api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import { getCurrentUser, getSiteSettings } from "../api/entities";

interface AdminSettingsPageProps {}

interface AdminSettingsState {
  user: User | null;
  settings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
  showDeleteDialog: boolean;
  selectedCardIndex: number | null;
  formData: {
    business_name: string;
    business_description: string;
    business_address: string;
    business_phone: string;
    business_email: string;
    theme: {
      primary_color: string;
      secondary_color: string;
      background_color: string;
      text_color: string;
    };
    hero_section: {
      title: string;
      subtitle: string;
      background_image: string;
    };
    feature_cards: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
}

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<AdminSettingsState>({
    user: null,
    settings: null,
    isLoading: true,
    error: null,
    showDeleteDialog: false,
    selectedCardIndex: null,
    formData: {
      business_name: "",
      business_description: "",
      business_address: "",
      business_phone: "",
      business_email: "",
      theme: {
        primary_color: "",
        secondary_color: "",
        background_color: "",
        text_color: ""
      },
      hero_section: {
        title: "",
        subtitle: "",
        background_image: ""
      },
      feature_cards: []
    }
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

      const settings = await getSiteSettings();
      if (!settings) {
        throw new Error('Failed to load settings');
      }

      setState(prev => ({
        ...prev,
        user,
        settings,
        formData: {
          business_name: settings.business_name || '',
          business_description: settings.business_description || '',
          business_address: settings.business_address || '',
          business_phone: settings.business_phone || '',
          business_email: settings.business_email || '',
          theme: {
            primary_color: settings.theme?.colors?.primary || '#4F46E5',
            secondary_color: settings.theme?.colors?.secondary || '#818CF8',
            background_color: settings.theme?.colors?.background || '#FFFFFF',
            text_color: settings.theme?.colors?.text || '#1F2937'
          },
          hero_section: {
            title: settings.hero_section?.title || '',
            subtitle: settings.hero_section?.subtitle || '',
            background_image: settings.hero_section?.background_image || ''
          },
          feature_cards: settings.feature_cards?.map(card => ({
            title: card.title_he || '',
            description: card.description_he || '',
            icon: card.icon || ''
          })) || []
        },
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

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    section: string
  ): Promise<void> => {
    try {
      // Implementation here
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const handleSaveSettings = async (): Promise<void> => {
    try {
      // Implementation here
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const addNewCard = (): void => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        feature_cards: [
          ...prev.formData.feature_cards,
          {
            title: "",
            description: "",
            icon: ""
          }
        ]
      }
    }));
  };

  const handleDeleteCard = (index: number): void => {
    setState(prev => ({
      ...prev,
      selectedCardIndex: index,
      showDeleteDialog: true
    }));
  };

  const confirmDeleteCard = (): void => {
    if (state.selectedCardIndex !== null) {
      setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          feature_cards: prev.formData.feature_cards.filter((_, i) => i !== prev.selectedCardIndex)
        },
        showDeleteDialog: false,
        selectedCardIndex: null
      }));
    }
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
          <h1 className="text-3xl font-bold mb-4">הגדרות</h1>
          <p className="text-gray-600">ניהול הגדרות המערכת</p>
        </div>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="business">פרטי העסק</TabsTrigger>
            <TabsTrigger value="theme">עיצוב</TabsTrigger>
            <TabsTrigger value="hero">דף הבית</TabsTrigger>
            <TabsTrigger value="features">כרטיסי תכונות</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <Button onClick={handleSaveSettings}>שמור שינויים</Button>
          </div>

          {/* Business Details Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">פרטי העסק</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name" className="text-right">שם העסק</Label>
                    <Input
                      id="business_name"
                      value={state.formData.business_name}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, business_name: e.target.value }
                      }))}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_phone" className="text-right">טלפון</Label>
                    <Input
                      id="business_phone"
                      value={state.formData.business_phone}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, business_phone: e.target.value }
                      }))}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_email" className="text-right">אימייל</Label>
                    <Input
                      id="business_email"
                      type="email"
                      value={state.formData.business_email}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, business_email: e.target.value }
                      }))}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_address" className="text-right">כתובת</Label>
                    <Input
                      id="business_address"
                      value={state.formData.business_address}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: { ...prev.formData, business_address: e.target.value }
                      }))}
                      className="text-right"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_description" className="text-right">תיאור העסק</Label>
                  <Textarea
                    id="business_description"
                    value={state.formData.business_description}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      formData: { ...prev.formData, business_description: e.target.value }
                    }))}
                    className="text-right"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Settings Tab */}
          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">עיצוב האתר</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color" className="text-right">צבע ראשי</Label>
                    <Input
                      id="primary_color"
                      type="color"
                      value={state.formData.theme.primary_color}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          theme: { ...prev.formData.theme, primary_color: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color" className="text-right">צבע משני</Label>
                    <Input
                      id="secondary_color"
                      type="color"
                      value={state.formData.theme.secondary_color}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          theme: { ...prev.formData.theme, secondary_color: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="background_color" className="text-right">צבע רקע</Label>
                    <Input
                      id="background_color"
                      type="color"
                      value={state.formData.theme.background_color}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          theme: { ...prev.formData.theme, background_color: e.target.value }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text_color" className="text-right">צבע טקסט</Label>
                    <Input
                      id="text_color"
                      type="color"
                      value={state.formData.theme.text_color}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          theme: { ...prev.formData.theme, text_color: e.target.value }
                        }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Section Tab */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle className="text-right">דף הבית</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_title" className="text-right">כותרת</Label>
                  <Input
                    id="hero_title"
                    value={state.formData.hero_section.title}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      formData: {
                        ...prev.formData,
                        hero_section: { ...prev.formData.hero_section, title: e.target.value }
                      }
                    }))}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle" className="text-right">תת כותרת</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={state.formData.hero_section.subtitle}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      formData: {
                        ...prev.formData,
                        hero_section: { ...prev.formData.hero_section, subtitle: e.target.value }
                      }
                    }))}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-right">תמונת רקע</Label>
                  <div className="flex items-center gap-4">
                    {state.formData.hero_section.background_image && (
                      <img
                        src={state.formData.hero_section.background_image}
                        alt="Hero background"
                        className="w-32 h-32 object-cover rounded"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'hero')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feature Cards Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-right">כרטיסי תכונות</CardTitle>
                  <Button onClick={addNewCard}>הוסף כרטיס</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.formData.feature_cards.map((card, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-right">כותרת</Label>
                          <Input
                            value={card.title}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              formData: {
                                ...prev.formData,
                                feature_cards: prev.formData.feature_cards.map((c, i) =>
                                  i === index ? { ...c, title: e.target.value } : c
                                )
                              }
                            }))}
                            className="text-right"
                            placeholder="הזן כותרת"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-right">תיאור</Label>
                          <Textarea
                            value={card.description}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              formData: {
                                ...prev.formData,
                                feature_cards: prev.formData.feature_cards.map((c, i) =>
                                  i === index ? { ...c, description: e.target.value } : c
                                )
                              }
                            }))}
                            className="text-right"
                            placeholder="הזן תיאור"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-right">אייקון</Label>
                          <div className="flex items-center gap-4">
                            {card.icon && (
                              <img
                                src={card.icon}
                                alt="אייקון תכונה"
                                className="w-8 h-8 object-contain"
                              />
                            )}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, `feature_${index}`)}
                              className="text-right"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteCard(index)}
                      >
                        מחק
                      </Button>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={state.showDeleteDialog} onOpenChange={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-right">מחיקת כרטיס</AlertDialogTitle>
              <AlertDialogDescription className="text-right">
                האם אתה בטוח שברצונך למחוק כרטיס זה? פעולה זו אינה ניתנת לביטול.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCard}>מחק</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminSettingsPage; 