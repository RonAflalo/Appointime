import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserAPI } from "../api/entities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
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
      const response = await UserAPI.login(formData.email, formData.password);
      login(response.token, response.user);
      navigate('/home');
    } catch (error: unknown) {
      console.error("Login error:", error instanceof Error ? error.message : 'An unknown error occurred');
      setError('אירעה שגיאה בהתחברות. אנא נסה שנית.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">התחברות</CardTitle>
          <CardDescription className="text-center">
            התחבר לחשבון שלך
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מתחבר...
                </>
              ) : (
                'התחבר'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              אין לך חשבון?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                הירשם עכשיו
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage; 