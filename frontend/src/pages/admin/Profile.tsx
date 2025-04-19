import React, { useState, useEffect } from "react";
import { UserAPI } from "@/api/entities";
import { User as UserType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useToast } from '@/components/ui/use-toast';

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  business_name: string;
  registration_code: string;
}

const AdminProfile: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    phone: "",
    email: "",
    business_name: "",
    registration_code: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserAPI.me();
        setUser(userData);
        setFormData({
          full_name: userData.full_name || "",
          phone: userData.phone || "",
          email: userData.email || "",
          business_name: userData.business?.name || "",
          registration_code: userData.business?.registration_code || ""
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) return;
      
      await UserAPI.updateMyUserData(formData);
      setUser({ ...user, ...formData });
      setEditing(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const copyRegistrationCode = () => {
    if (user?.business?.registration_code) {
      navigator.clipboard.writeText(user.business.registration_code);
      toast({
        title: 'Success',
        description: 'Registration code copied to clipboard'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
          <CardDescription>Manage your account and business settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_code">Registration Code</Label>
              <div className="flex gap-2">
                <Input
                  id="registration_code"
                  value={formData.registration_code}
                  onChange={(e) => setFormData({ ...formData, registration_code: e.target.value })}
                  disabled={true}
                />
                <Button type="button" onClick={copyRegistrationCode} variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit'}
              </Button>
              {editing && (
                <Button type="submit">
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile; 