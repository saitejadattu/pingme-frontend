import { create } from "zustand";

import { User } from "../types";

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
};

const storedToken = localStorage.getItem("pingme-token");
const storedUser = localStorage.getItem("pingme-user");

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  setAuth: (token, user) => {
    localStorage.setItem("pingme-token", token);
    localStorage.setItem("pingme-user", JSON.stringify(user));
    set({ token, user });
  },
  updateUser: (user) => {
    localStorage.setItem("pingme-user", JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem("pingme-token");
    localStorage.removeItem("pingme-user");
    set({ token: null, user: null });
  },
}));
