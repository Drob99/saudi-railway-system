import axios from "axios";
import React, { createContext, useCallback, useContext, useState } from "react";
import { API } from "../utils/api";

// Create context
const UserContext = createContext(undefined);

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${user?.token}`,
  });

  // Login function
  const login = useCallback(async (email, password, accountType) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API}/v1/auth/login`, {
        email,
        password,
        accountType,
      });
      const userData = response.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData.user));

      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to login";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async ({ endpoint, ...userDetails }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API}${endpoint}`, userDetails);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to register";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  // Update user profile
  const updateProfile = useCallback(
    async (profileData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.put(
          `${API}/v1/user/profile`,
          profileData,
          {
            headers: getAuthHeaders(),
          }
        );
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to update profile";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Add dependent
  const addDependent = useCallback(
    async (dependentData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(
          `${API}/v1/user/dependents`,
          dependentData,
          {
            headers: getAuthHeaders(),
          }
        );
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to add dependent";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Get user dependents
  const getDependents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API}/v1/user/dependents`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch dependents";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check authentication status
  const isAuthenticated = Boolean(user);

  // Check if user is admin
  const isStaff = !!user?.hiredate;

  // Get user token
  const getToken = useCallback(() => user?.token, [user]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isStaff,
    login,
    logout,
    register,
    updateProfile,
    addDependent,
    getDependents,
    getToken,
    setError, // Expose setError to clear errors when needed
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
