import type { ReactElement } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader } from "./components/common/Loader";
import { useAuth } from "./context/AuthContext";
import { AppShell } from "./components/layout/AppShell";
import { ExplorePage } from "./pages/ExplorePage";
import { FeedPage } from "./pages/FeedPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { SearchPage } from "./pages/SearchPage";

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader label="Preparing the app..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <AppShell />;
};

const PublicOnly = ({ children }: { children: ReactElement }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Checking your session..." />;
  }

  return user ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnly>
            <ForgotPasswordPage />
          </PublicOnly>
        }
      />
      <Route path="/" element={<ProtectedRoutes />}>
        <Route index element={<FeedPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="profile">
          <Route index element={<ProfilePage />} />
          <Route path=":username" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
