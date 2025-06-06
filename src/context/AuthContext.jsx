import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../utils/supabase";
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  const signInWithEmail = async (email, password, rememberMe = true) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) {
      console.log("Error in signInWithEmail: ", error);
      return { success: false, error };
    }

    if (!rememberMe) {
      const session = data.session;
      if (session) {
        sessionStorage.setItem("supabase.session", JSON.stringify(session));
        const projectRef = supabase.supabaseUrl.split("https://")[1].split(".")[0];
        localStorage.removeItem(`sb-${projectRef}-auth-token`);
      }
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error in signOut: ", error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const redirectUrl = `${window.location.origin}/update-password`;
      console.log("Redirect URL:", redirectUrl);

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
    const localSession = JSON.parse(sessionStorage.getItem("supabase.session"));
    if (localSession) {
      setSession(localSession);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
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