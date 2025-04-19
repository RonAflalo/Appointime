import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI } from "../api/entities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  registration_code: string;
}

const RegisterCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    full_name: '',
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await UserAPI.register({
        ...formData,
        is_admin: false
      });

      if (response.token && response.user) {
        login(response.token, response.user);
        navigate('/home');
      } else if (response.customer) {
        navigate('/login');
      } else {
        setError('אירעה שגיאה בהרשמה. אנא נסה שנית.');
      }
    } catch (error: unknown) {
      console.error("Registration error:", error instanceof Error ? error.message : 'An unknown error occurred');
      setError('אירעה שגיאה בהרשמה. אנא נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">הרשמה כלקוח</CardTitle>
          <CardDescription className="text-center">
            צור חשבון חדש כלקוח
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
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="הכנס שם מלא"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="הכנס אימייל"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="הכנס סיסמה"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_code">קוד הרשמה</Label>
              <Input
                id="registration_code"
                name="registration_code"
                type="text"
                value={formData.registration_code}
                onChange={handleChange}
                required
                placeholder="הכנס קוד הרשמה"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  נרשם...
                </>
              ) : (
                'הרשמה'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterCustomerPage; 