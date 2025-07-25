import { registerUser, loginUser } from "../services/api";
import { createContext, useState, useEffect, useContext } from "react";

// Initialize context
export const AuthContext = createContext();

// Create provider
export const AuthProvider = ({ children }) => {
  // State to hold user information and loading state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing token in localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error loading auth data from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false); // Set loading to false after initialization
      }
    };

    initializeAuth();
  }, []);

  // Function to register a user
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const userData = await registerUser(username, email, password);

      setUser(userData.user || userData); // Handle different response structures

      // Handle token if provided during registration
      if (userData.token) {
        setToken(userData.token);
        localStorage.setItem("token", userData.token);
      }

      localStorage.setItem("user", JSON.stringify(userData.user || userData));
      return userData;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to login a user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await loginUser(email, password);

      const userData = response.user || response;
      const userToken = response.token;

      setUser(userData);
      setToken(userToken);

      // Store user data and token in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userToken);

      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function to logout a user
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoading(false);

    // Better navigation approach
    window.location.href = "/login";
  };

  // Better logout with React Router (if you're using it)
  const logoutWithRouter = (navigate) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoading(false);

    if (navigate) {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(user && token);
  };

  // Check if user is admin (assuming your user object has a role field)
  const isAdmin = () => {
    return user?.role === "admin" || user?.isAdmin === true;
  };

  const authContextValue = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    logoutWithRouter, // Alternative logout for React Router
    isAuthenticated,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


