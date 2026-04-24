import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Landing        from "./pages/Landing";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword  from "./pages/ResetPassword";
import Dashboard      from "./pages/Dashboard";
import Pressure       from "./pages/Pressure";
import Medications    from "./pages/Medications";
import Reports        from "./pages/Reports";
import Settings       from "./pages/Settings";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<Landing />} />
          <Route path="/login"             element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register"          element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password"   element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password"    element={<ResetPassword />} />
          <Route path="/dashboard"         element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/pressure"          element={<PrivateRoute><Pressure /></PrivateRoute>} />
          <Route path="/medications"       element={<PrivateRoute><Medications /></PrivateRoute>} />
          <Route path="/reports"           element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/export"            element={<Navigate to="/reports" replace />} />
          <Route path="/settings"          element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
