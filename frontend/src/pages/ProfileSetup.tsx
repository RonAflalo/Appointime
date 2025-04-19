import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, CustomerAPI } from "@/api/entities";
import { Customer, User as UserType } from "@/types";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserCheck } from "lucide-react";

interface FormData {
  full_name: string;
  phone: string;
}

interface FormErrors {
  full_name?: string;
  phone?: string;
  submit?: string;
}

interface CustomerCreateData {
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  visit_count: number;
  flag: 'red' | 'yellow' | 'green' | undefined;
}

interface CustomerUpdateData {
  full_name: string;
  phone: string;
  email: string;
}

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone: ""
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await UserAPI.me();
        setUser(userData);
        
        if (userData.full_name && userData.phone) {
          navigate(createPageUrl("Home"));
          return;
        }
        
        setFormData({
          full_name: userData.full_name || "",
          phone: userData.phone || ""
        });
        
        setIsLoading(false);
      } catch (error: unknown) {
        console.error("Not authenticated:", error instanceof Error ? error.message : 'An unknown error occurred');
        window.location.href = "/";
      }
    };
    
    checkUser();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = "שם מלא הוא שדה חובה";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "מספר טלפון הוא שדה חובה";
    } else if (!/^05\d{8}$/.test(formData.phone)) {
      errors.phone = "מספר טלפון לא תקין";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    try {
      await UserAPI.updateMyUserData({
        full_name: formData.full_name,
        phone: formData.phone
      });
      
      const userData = await UserAPI.me();
      const existingCustomers = await CustomerAPI.filter({ user_id: userData.id });
      
      if (existingCustomers.length === 0) {
        const customerData: CustomerCreateData = {
          user_id: userData.id,
          full_name: formData.full_name,
          phone: formData.phone,
          email: userData.email,
          visit_count: 0,
          flag: undefined
        };
        await CustomerAPI.create(customerData);
      } else {
        const updateData: CustomerUpdateData = {
          full_name: formData.full_name,
          phone: formData.phone,
          email: userData.email
        };
        await CustomerAPI.update(existingCustomers[0].id, updateData);
      }
      
      navigate(createPageUrl("Home"));
    } catch (error: unknown) {
      console.error("Error saving profile:", error instanceof Error ? error.message : 'An unknown error occurred');
      setFormErrors(prev => ({
        ...prev,
        submit: "אירעה שגיאה בשמירת הפרטים. אנא נסה שנית."
      }));
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center" dir="rtl">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl mb-2">הגדרת פרופיל</CardTitle>
          <CardDescription>
            לפני שנתחיל, אנחנו צריכים כמה פרטים ממך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-right">
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="הזן את שמך המלא"
                className={formErrors.full_name ? "border-red-500" : ""}
                dir="rtl"
              />
              {formErrors.full_name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.full_name}</p>
              )}
            </div>
            
            <div className="space-y-2 text-right">
              <Label htmlFor="phone">מספר טלפון</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0500000000"
                className={formErrors.phone ? "border-red-500" : ""}
                dir="rtl"
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500 mt-1">{formErrors.phone}</p>
              )}
            </div>
            
            {formErrors.submit && (
              <p className="text-sm text-red-500 text-center">{formErrors.submit}</p>
            )}
            
            <Button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 ml-2" />
                  אישור והמשך
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
