import React, { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserAPI } from "../api/entities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";

interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  business_name: string;
}

const RegisterBusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [registrationCode, setRegistrationCode] = useState<string>('');
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    full_name: '',
    business_name: ''
  });

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
        is_admin: true
      });

      if (response.token && response.user) {
        login(response.token, response.user);
        setRegistrationCode(response.user.business?.registration_code || '');
        setSuccessDialogOpen(true);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">הרשמה לעסק</CardTitle>
          <CardDescription className="text-center">
            צור חשבון חדש לעסק שלך
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
            <div className="space-y-2">
              <Label htmlFor="business_name">שם העסק</Label>
              <Input
                id="business_name"
                name="business_name"
                type="text"
                required
                value={formData.business_name}
                onChange={handleChange}
                placeholder="הזן את שם העסק"
              />
            </div>
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

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הרשמה הושלמה בהצלחה!</DialogTitle>
            <DialogDescription>
              קוד ההרשמה שלך הוא:
            </DialogDescription>
          </DialogHeader>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gray-100 p-4 rounded-lg">
              {registrationCode}
            </div>
            <p className="mt-4 text-sm text-gray-600">
              שמור את הקוד הזה והפץ אותו ללקוחות שלך כדי שיוכלו להירשם
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setSuccessDialogOpen(false);
              navigate('/home');
            }}>
              מעבר לדף הבית
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegisterBusinessPage; 