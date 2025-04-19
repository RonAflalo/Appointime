import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI } from "../api/entities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Checkbox } from "../components/ui/checkbox";

interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  business_name?: string;
  is_admin: boolean;
  registration_code?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
    is_admin: false,
    registration_code: ''
  });
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean): void => {
    setFormData(prev => ({
      ...prev,
      is_admin: checked
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.email || !formData.password || !formData.full_name) {
        setError('Please fill in all required fields');
        return;
      }

      // Only require registration code for non-admin users
      if (!formData.is_admin) {
        if (!formData.registration_code) {
          setError('Registration code is required for customer registration');
          return;
        }
      }

      const response = await UserAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        is_admin: formData.is_admin,
        business_name: formData.business_name,
        registration_code: formData.registration_code
      });

      if (response.token) {
        // User registration successful
        localStorage.setItem('token', response.token);
        navigate('/dashboard');
      } else if (response.customer) {
        // Customer registration successful
        navigate('/login');
      } else {
        setError('Registration failed - invalid response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">הרשמה</CardTitle>
          <CardDescription className="text-center">
            צור חשבון חדש כדי להתחיל
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">שם מלא</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={handleChange}
                placeholder="הזן את שמך המלא"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="הזן את כתובת האימייל שלך"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="הזן סיסמה"
              />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="is_admin">הירשם כבעל עסק</Label>
            </div>
            {formData.is_admin ? (
              <div className="space-y-2">
                <Label htmlFor="business_name">שם העסק</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  type="text"
                  required={formData.is_admin}
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="הזן את שם העסק"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="registration_code">קוד רישום</Label>
                <Input
                  id="registration_code"
                  name="registration_code"
                  type="text"
                  required={!formData.is_admin}
                  value={formData.registration_code}
                  onChange={handleChange}
                  placeholder="הזן את קוד הרישום שקיבלת מבעל העסק"
                  className="text-left"
                  dir="ltr"
                />
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  נרשם...
                </>
              ) : (
                'הרשמה'
              )}
            </Button>
            <div className="text-center text-sm">
              כבר יש לך חשבון?{' '}
              <Link to="/login" className="text-blue-500 hover:underline">
                התחבר
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage; 