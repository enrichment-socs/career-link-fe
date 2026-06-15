import { z } from "zod";
import type { ApiResponse, AuthResponse, User } from "~/types/api";
import { api } from "./api-client";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const loginInputSchema = z.object({
  nim: z.string().min(1, "NIM is required"),
  password: z.string().min(1, "Password is required"),
});



export type LoginInput = z.infer<typeof loginInputSchema>;

export const login = ({
  data,
}: {
  data: LoginInput;
}): Promise<ApiResponse<AuthResponse>> => {
  return api.post("/user/login", data);
};

export type ForgetPasswordInput = z.infer<typeof forgetPasswordInputSchema>;
export const forgetPasswordInputSchema = z.object({
  nim: z.string().min(1, "NIM is required"),
});

export const forgetPassword = ({
  data,
}: {
  data: ForgetPasswordInput;
}): Promise<ApiResponse<null>> => {
  return api.post("/user/forgot-password", data);
};

export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
export const resetPasswordInputSchema = z.object({
  email: z.string(),
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

export const resetPassword = ({
  data,
}: {
  data: ResetPasswordInput;
}): Promise<ApiResponse<null>> => {
  return api.post("/user/reset-password", data);
};

export const getUser = (): Promise<{ data: User }> => {
  return api.get("user/me");
};


interface AuthContextType {
  user: User | null;
  loading: boolean;
  fetchUser: () => void;
  logout: (redirectTo: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const logout = (redirectTo: string) => {
    Cookies.remove("access_token");
    navigate(redirectTo);
  };

  const token = Cookies.get("access_token");

  const fetchUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await getUser();
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, logout, fetchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("userAuth must be within an AuthProvider");
  return context;
};
