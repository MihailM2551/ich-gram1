import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { authApi } from "../api/services";
import { storage } from "../lib/storage";
import type { AuthenticatedUser } from "../types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  token: string | null;
  loading: boolean;
  login: (payload: { identifier: string; email: string; password: string }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    username: string;
    fullName: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthenticatedUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUserState] = useState<AuthenticatedUser | null>(storage.getUser());
  const [token, setToken] = useState<string | null>(storage.getToken());
  const [loading, setLoading] = useState(true);

  const setUser = (nextUser: AuthenticatedUser) => {
    storage.setUser(nextUser);
    setUserState(nextUser);
  };

  const applyAuth = (nextToken: string, nextUser: AuthenticatedUser) => {
    storage.setToken(nextToken);
    storage.setUser(nextUser);
    setToken(nextToken);
    setUserState(nextUser);
  };

  const logout = () => {
    storage.clearAuth();
    setToken(null);
    setUserState(null);
  };

  const refreshUser = async () => {
    const nextUser = await authApi.me();
    setUser(nextUser);
  };

  const login = async (payload: { identifier: string; email: string; password: string }) => {
    const response = await authApi.login(payload);
    applyAuth(response.token, response.user);
  };

  const register = async (payload: {
    email: string;
    password: string;
    username: string;
    fullName: string;
  }) => {
    const response = await authApi.register(payload);
    applyAuth(response.token, response.user);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
