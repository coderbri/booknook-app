/**
 * @file authStore.js
 * @description Zustand state management store for application authentication. Handles 
 * asynchronous API interactions, local session persistence via AsyncStorage, and active global user states.
 */
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

export const useAuthStore = create((set) => ({
    // ==========================================
    // 1. Initial State Definitions
    // ==========================================
    user: null,
    token: null,
    isLoading: false,
    isCheckingAuth: true, // check for user authentication upon login
    
    // ==========================================
    // 2. State Actions / Operations
    // ==========================================
    
    /**
     * Sends user registration credentials to the backend, stores tokens, and updates global user state.
     * @param {string} username - Chosen display name.
     * @param {string} email - Valid unique email address.
     * @param {string} password - Form security password.
     * @returns {Promise<Object>} An object containing an explicit success status indicator and conditional error messages.
     */
    register: async (username, email, password) => {
        set({ isLoading: true });
        try {
            // 1. Backend Sync
            // Dynamically resolves target environments via central API_URL instead of hardcoded addresses,
            // tracking cleanly over local networks or staging links.
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || "Something went wrong");
            
            // 2. Device Session Persistence
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);
            
            // 3. Global Store Update
            set({ token: data.token, user: data.user, isLoading: false });
            return { success: true };
        
        } catch (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Authenticates an existing user profile against the database and stores session states locally.
     * @param {string} email - Profile lookup account email.
     * @param {string} password - Account identity verification password.
     * @returns {Promise<Object>} An object containing an explicit success status indicator and conditional error messages.
     */
    login: async (email, password) => {
        set({ isLoading: true });
        
        try {
            // 1. Backend Sync
            // Standardized to match variables configured across constant asset scopes
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Something went wrong");
            
            // 2. Device Session Persistence
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            await AsyncStorage.setItem("token", data.token);
            
            // 3. Global Store Update
            set({ token: data.token, user: data.user, isLoading: false });
            return { success: true };
            
        } catch (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
        }
    },
    
    /**
     * Inspects device local storage on initial application startup to re-hydrate active user sessions automatically.
     */
    checkAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const userJson = await AsyncStorage.getItem("user");
            const user = userJson ? JSON.parse(userJson) : null;
            
            set({ token, user });
        } catch (error) {
            console.log("Auth check failed", error);
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    
    /**
     * Removes session tracking objects locally and clears active user context trees from global memory.
     */
    logout: async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        set({ token: null, user: null });
    },
}));