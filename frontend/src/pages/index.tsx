import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from "./Login";
import RegisterEntry from "./RegisterEntry";
import RegisterBusiness from "./RegisterBusiness";
import RegisterCustomer from "./RegisterCustomer";
import Admin from "./Admin";
import AdminCalendar from "./AdminCalendar";
import AdminCustomers from "./AdminCustomers";
import AdminPending from "./AdminPending";
import AdminStats from "./AdminStats";
import AdminReviews from "./AdminReviews";
import AdminSettings from "./AdminSettings";
import Book from "./Book";
import Home from "./Home";
import Services from "./Services";
import Appointments from "./Appointments";
import Profile from "./Profile";
import ProfileSetup from "./ProfileSetup";
import Layout from "./Layout";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterEntry />} />
          <Route path="/register/business" element={<RegisterBusiness />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/setup" element={<ProfileSetup />} />
            <Route path="book" element={<Book />} />
            
            {/* Admin routes */}
            <Route path="admin" element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="admin/calendar" element={
              <ProtectedRoute requireAdmin>
                <AdminCalendar />
              </ProtectedRoute>
            } />
            <Route path="admin/customers" element={
              <ProtectedRoute requireAdmin>
                <AdminCustomers />
              </ProtectedRoute>
            } />
            <Route path="admin/pending" element={
              <ProtectedRoute requireAdmin>
                <AdminPending />
              </ProtectedRoute>
            } />
            <Route path="admin/stats" element={
              <ProtectedRoute requireAdmin>
                <AdminStats />
              </ProtectedRoute>
            } />
            <Route path="admin/reviews" element={
              <ProtectedRoute requireAdmin>
                <AdminReviews />
              </ProtectedRoute>
            } />
            <Route path="admin/settings" element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 