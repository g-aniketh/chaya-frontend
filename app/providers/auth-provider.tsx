"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation"; // Import usePathname
import { clearSidebarCache } from "../(dashboard)/farmers/lib/sidebar-cache"; // Adjust path if needed

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void; // Allow setting user to null
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(null); // Renamed to avoid conflict
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  // No longer need BACKEND_API_URL directly in this component for /me or /logout

  const setUser = useCallback((userData: User | null) => {
    setUserState(userData);
  }, []);

  useEffect(() => {
    async function loadUserFromSession() {
      // Only attempt to load user if not on a public path like /login
      // to prevent loops if the /api/auth/current-user itself fails and redirects.
      // This check might need adjustment based on your public routes.
      if (pathname === "/login") {
        setLoading(false);
        setUserState(null); // Ensure user is null if on login page
        return;
      }

      setLoading(true); // Set loading true at the start of an attempt
      try {
        // Call your Next.js API route for fetching the current user
        const response = await fetch("/api/auth/current-user", {
          method: "GET", // GET is default, but explicit is fine
          headers: {
            "Content-Type": "application/json",
            // No credentials: "include" needed; cookies for the frontend domain are sent automatically
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Data from /api/auth/current-user: ", data);
          setUserState(data.user); // Assuming the proxy returns { user: ... }
        } else {
          console.error(
            "Failed to fetch user via /api/auth/current-user: ",
            response.status,
            response.statusText,
          );
          setUserState(null); // Clear user on failure
          if (response.status === 401 && pathname !== "/login") {
            // Only redirect if not already on login page to prevent redirect loops
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error fetching user via /api/auth/current-user:", error);
        setUserState(null); // Clear user on error
      } finally {
        setLoading(false);
      }
    }

    loadUserFromSession();
    // Rerun when pathname changes to re-evaluate auth state on navigation,
    // e.g., if user logs out in another tab and app_session_token is cleared.
  }, [pathname, router, setUserState]); // setUserState added to dependencies

  const signOut = useCallback(async () => {
    try {
      // Call your Next.js API route for logout
      await fetch("/api/auth/logout", {
        method: "POST",
        // No credentials: "include" needed
      });
    } catch (error) {
      console.error("Error during sign out via /api/auth/logout:", error);
      // Still proceed with client-side cleanup even if API call fails
    } finally {
      // Always perform client-side cleanup
      setUserState(null);
      clearSidebarCache(); // Assuming this is a client-side cache clear
      router.push("/login");
    }
  }, [router, setUserState]); // setUserState added to dependencies

  const contextValue = useMemo(
    () => ({ user, loading, setUser, signOut }),
    [user, loading, setUser, signOut],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
