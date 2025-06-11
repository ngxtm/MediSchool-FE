import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../utils/supabase";
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  const signInWithEmail = async (email, password, rememberMe = true) => {
    localStorage.setItem("rememberMePreference", rememberMe.toString());
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) {
      console.log("Error in signInWithEmail: ", error);
      return { success: false, error };
    }
    if (!rememberMe && data.session) {
      // Lưu session vào sessionStorage cho trường hợp không remember me
      sessionStorage.setItem("tempSession", JSON.stringify(data.session));
      // Xóa localStorage token để đảm bảo session chỉ tồn tại trong phiên hiện tại
      setTimeout(() => {
        const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(`sb-${projectRef}-auth-token`)) {
            localStorage.removeItem(key);
          }
        });
      }, 100);
    }
    return { success: true, data };
  };

  const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      console.log("Error in signUpWithEmail: ", error);
      return { success: false, error };
    }
    return { success: true, data };
  };

  const signInWithGoogle = async (rememberMe = true) => {
    localStorage.setItem("rememberMePreference", rememberMe.toString());
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.log("Error in signInWithGoogle: ", error);
      return { success: false, error };
    }
    return { success: true, data };
  };

  const signOut = async () => {
    setSession(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error in signOut: ", error);
    }
    sessionStorage.removeItem("tempSession");
    localStorage.removeItem("rememberMePreference");
    const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(`sb-${projectRef}-auth-token`)) {
        localStorage.removeItem(key);
      }
    });
  };

  const resetPassword = async (email) => {
    try {
      const redirectUrl = `${window.location.origin}/update-password`;
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        console.log("Error in resetPassword: ", error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error("Unexpected error in resetPassword:", err);
      return { success: false, error: err };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        console.log("Error in updatePassword: ", error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      console.error("Unexpected error in updatePassword:", err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          return;
        }
        const tempSession = sessionStorage.getItem("tempSession");
        if (tempSession) {
          const parsedSession = JSON.parse(tempSession);
          setSession(parsedSession);
          return;
        }
        await signOut();
      } catch (error) {
        console.error("Error checking session:", error);
        await signOut();
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        const rememberMe = localStorage.getItem("rememberMePreference") === "true";
        if (event === "SIGNED_IN") {
          if (!rememberMe) {
            sessionStorage.setItem("tempSession", JSON.stringify(currentSession));
          }
          setSession(currentSession);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          sessionStorage.removeItem("tempSession");
        }
      }
    );
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        signUpWithEmail,
        signOut,
        signInWithEmail,
        signInWithGoogle,
        resetPassword,
        updatePassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};