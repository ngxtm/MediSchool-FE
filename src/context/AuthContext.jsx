import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../utils/supabase";
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log("Error in signInWithEmail: ", error);
      return { success: false, error };
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

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/nurse`,
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
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