import { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import CalendarPage from "./pages/Calendar";
import DayView from "./pages/DayView";
import Login from "./pages/Login";
import OAuthCallback from "./pages/OAuthCallback";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import { useAuthStore } from "./store/authStore";

function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const authPages = ["/login", "/signup", "/verify", "/oauth/callback"];
  const showNavbar = !authPages.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <CalendarPage />
            </AuthGuard>
          }
        />
        <Route
          path="/day/:date"
          element={
            <AuthGuard>
              <DayView />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />
      </Routes>
    </AppShell>
  );
}
