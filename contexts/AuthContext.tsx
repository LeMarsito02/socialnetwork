import { User } from "@/types/common.type";
import { supabase } from "../utils/supabase";
import { createContext, useEffect, useState } from "react";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: User, password: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  fetchUser: () => Promise<void>; // 🔹 agregamos fetchUser al contexto
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión inicial
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await fetchUserById(session.user.id);
        }
      } catch (error) {
        console.error("Error cargando sesión:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listener de cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserById(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔹 Función interna para obtener usuario por ID
  const fetchUserById = async (id: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && profileData) {
        setUser(profileData);
      } else {
        setUser({ id, email: "", name: "" }); // fallback mínimo
      }
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
    }
  };

  // 🔹 Función pública para refrescar el usuario actual
  const fetchUser = async () => {
    if (!user?.id) return;
    await fetchUserById(user.id);
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        await fetchUserById(data.user.id);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const register = async (newUser: User, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password,
        options: { data: { name: newUser.name } },
      });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: newUser.email,
          name: newUser.name,
          username: newUser.username,
          birth_date: newUser.birth_date,
          created_at: new Date().toISOString(),
        });

        if (profileError) throw profileError;

        await fetchUserById(data.user.id);
        return true;
      }

      return false;
    } catch (err) {
      console.error("Register error:", err);
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user?.id) {
      console.error("No user ID disponible");
      return false;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) throw error;

      await fetchUser(); // 🔄 Refrescar usuario después de actualizar
      return true;
    } catch (err) {
      console.error("Update profile error:", err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      return true;
    } catch (err) {
      console.error("Reset password error:", err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        fetchUser, // 🔹 exportamos fetchUser
        setUser,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
