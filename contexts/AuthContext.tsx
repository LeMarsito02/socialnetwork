import { User } from "@/types/common.type";
import { supabase } from "../utils/supabase";
import { createContext, useEffect, useState } from "react";

interface AuthContextProps {
  user: User | null;
  loading: boolean; // 👈 nuevo estado de carga
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: User, password: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 👈 inicia cargando

  useEffect(() => {
    // Verificar sesión inicial
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (!error && profileData) {
          setUser(profileData);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name:
              session.user.user_metadata.name ||
              session.user.email!.split("@")[0],
          });
        }
      }
      setLoading(false);
    };

    getSession();

    // Listener de cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          setUser(profileData || null);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        return false;
      }

      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        setUser(profileData || null);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (user: User, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password,
        options: {
          data: {
            name: user.name,
          },
        },
      });

      if (error) {
        console.error("Registration error:", error.message);
        return false;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          birth_date: user.birth_date,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Profile creation error:", profileError.message);
          return false;
        }

        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: user.name,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user?.id) {
      console.error("No user ID available");
      return false;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Update profile error:", error.message);
        return false;
      }

      setUser({
        ...user,
        ...profileData,
      });

      return true;
    } catch (error) {
      console.error("Update profile error:", error);
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
    } catch (error) {
      console.error(error);
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
        setUser,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
