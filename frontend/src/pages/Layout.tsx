import React, { useState } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import {
  Scissors as ScissorsIcon,
  Menu,
  X,
  Calendar,
  Home,
  List,
  LogOut,
  User as UserIcon,
  FileText,
  Users,
  Settings,
  Star,
  Bell,
  BarChart,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

interface LayoutProps {}

const Layout: React.FC<LayoutProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isManagementOpen, setIsManagementOpen] = useState<boolean>(true);

  const handleLogout = async (): Promise<void> => {
    try {
      logout();
      navigate(createPageUrl('Login'));
    } catch (error: unknown) {
      console.error("Error during logout:", error instanceof Error ? error.message : 'An unknown error occurred');
      navigate(createPageUrl('Login'));
    }
  };

  if (location.pathname === '/login') {
    return <Outlet />;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md h-12">
        <div className="flex items-center justify-center h-full relative">
          <h1 className="text-lg font-bold">{user?.business?.name || 'Appointime'}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="flex min-h-screen flex-row-reverse">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 right-0 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "translate-x-full",
          "md:translate-x-0 md:relative"
        )}>
          <div className="h-full flex flex-col">
            <div className="p-5 flex flex-row-reverse items-center justify-between border-b border-gray-100">
              <h1 className="text-xl font-bold text-gray-900">Appointime</h1>
            </div>

            <div className="flex-1 overflow-y-auto">
              <nav className="p-4 space-y-1">
                {/* Common menu items for all users */}
                <Link 
                  to="/home" 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                    location.pathname === "/home" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  )}>
                  <Home className={cn(
                    "h-5 w-5 transition-colors",
                    location.pathname === "/home" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  <span>דף הבית</span>
                </Link>

                <Link 
                  to="/book" 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                    location.pathname === "/book" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  )}>
                  <Calendar className={cn(
                    "h-5 w-5 transition-colors",
                    location.pathname === "/book" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  <span>קביעת תור</span>
                </Link>

                <Link 
                  to="/appointments" 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                    location.pathname === "/appointments" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  )}>
                  <List className={cn(
                    "h-5 w-5 transition-colors",
                    location.pathname === "/appointments" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  <span>התורים שלי</span>
                </Link>

                <Link 
                  to="/services" 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                    location.pathname === "/services" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                  )}>
                  <ScissorsIcon className={cn(
                    "h-5 w-5 transition-colors",
                    location.pathname === "/services" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  <span>השירותים שלנו</span>
                </Link>

                {/* Admin specific menu items */}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setIsManagementOpen(!isManagementOpen)}
                      className="flex flex-row-reverse items-center justify-between w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex flex-row-reverse items-center gap-3">
                        <Settings className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-semibold">ניהול</span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isManagementOpen ? "rotate-180" : ""
                      )} />
                    </button>

                    {isManagementOpen && (
                      <div className="pl-4 space-y-1">
                        <Link 
                          to="/admin/calendar" 
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                            location.pathname === "/admin/calendar" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                          )}>
                          <Calendar className={cn(
                            "h-5 w-5 transition-colors",
                            location.pathname === "/admin/calendar" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                          <span>יומן תורים</span>
                        </Link>

                        <Link 
                          to="/admin/pending" 
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                            location.pathname === "/admin/pending" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                          )}>
                          <List className={cn(
                            "h-5 w-5 transition-colors",
                            location.pathname === "/admin/pending" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                          <span>תורים ממתינים</span>
                        </Link>

                        <Link 
                          to="/admin/customers" 
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                            location.pathname === "/admin/customers" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                          )}>
                          <Users className={cn(
                            "h-5 w-5 transition-colors",
                            location.pathname === "/admin/customers" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                          <span>לקוחות</span>
                        </Link>

                        <Link 
                          to="/admin/reviews" 
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                            location.pathname === "/admin/reviews" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                          )}>
                          <Star className={cn(
                            "h-5 w-5 transition-colors",
                            location.pathname === "/admin/reviews" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                          <span>ביקורות</span>
                        </Link>

                        <Link 
                          to="/admin/stats" 
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                            location.pathname === "/admin/stats" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                          )}>
                          <BarChart className={cn(
                            "h-5 w-5 transition-colors",
                            location.pathname === "/admin/stats" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                          <span>סטטיסטיקות</span>
                        </Link>

                        <Link 
                          to="/admin/settings" 
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex flex-row-reverse items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group",
                            location.pathname === "/admin/settings" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"
                          )}>
                          <Settings className={cn(
                            "h-5 w-5 transition-colors",
                            location.pathname === "/admin/settings" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                          )} />
                          <span>הגדרות</span>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </nav>
            </div>

            {/* Fixed bottom section */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex flex-row-reverse items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setIsProfileOpen(true);
                    setIsOpen(false);
                  }}
                  className="flex flex-row-reverse items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span>פרופיל</span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex flex-row-reverse items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5 text-gray-400" />
                  <span>התנתק</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-0 mt-12 md:mt-0">
          <Outlet />
        </main>
      </div>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פרופיל</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{user?.full_name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              {user?.business && (
                <>
                  <p className="text-gray-600">עסק: {user.business.name}</p>
                  <p className="text-gray-600">קוד הרשמה: {user.business.registration_code}</p>
                </>
              )}
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
              ערוך פרופיל
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;