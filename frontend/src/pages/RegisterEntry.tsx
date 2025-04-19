import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Building2, Users } from "lucide-react";

const RegisterEntryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ברוכים הבאים ל-Appointime</h1>
          <p className="text-gray-600">בחר את סוג המשתמש שברצונך להירשם כ</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Owner Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/register/business')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                בעל עסק
              </CardTitle>
              <CardDescription>
                הרשמה כבעל עסק - ניהול תורים, לקוחות ושירותים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-right space-y-2 text-gray-600">
                <li>יצירת עסק חדש</li>
                <li>ניהול תורים ושירותים</li>
                <li>מעקב אחר לקוחות</li>
                <li>קבלת קוד רישום להפצה ללקוחות</li>
              </ul>
            </CardContent>
          </Card>

          {/* Customer Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/register/customer')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                לקוח
              </CardTitle>
              <CardDescription>
                הרשמה כלקוח - הזמנת תורים וקבלת שירותים
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-right space-y-2 text-gray-600">
                <li>הזמנת תורים בקלות</li>
                <li>קבלת עדכונים ותזכורות</li>
                <li>צפייה בהיסטוריית התורים</li>
                <li>הזנת קוד רישום שקיבלת מבעל העסק</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterEntryPage; 