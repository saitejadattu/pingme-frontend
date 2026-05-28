import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { AuthResponse, User } from "../types";

export function useAuth() {
  const navigate = useNavigate();
  const { token, user, setAuth, updateUser, logout } = useAuthStore();

  return {
    token,
    user,
    async login(email: string, password: string) {
      const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
      setAuth(data.access_token, data.user);
      navigate("/");
    },
    async signup(payload: { name: string; email: string; password: string; phone?: string }) {
      const { data } = await api.post<{ message: string }>("/auth/signup", payload);
      return data;
    },
    async verifyEmail(tokenValue: string) {
      const { data } = await api.get<{ message: string }>("/auth/verify", {
        params: { token: tokenValue },
      });
      return data;
    },
    async refreshProfile() {
      const { data } = await api.get<User>("/profile");
      updateUser(data);
      return data;
    },
    setOAuthAuth(tokenValue: string, oauthUser: User) {
      setAuth(tokenValue, oauthUser);
      window.location.replace("/");
    },
    logout() {
      logout();
      navigate("/login");
    },
  };
}
