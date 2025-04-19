import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAPI } from '../api/entities';
import { User } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserAPI.me();
        setUser(userData);
        setFormData({
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone || ''
        });
      } catch (error) {
        console.error('Error fetching user:', error);
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
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
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

export default Profile; 