/**
 * @file index.jsx (Root Index Screen)
 * @description Temporary application landing screen configured to handle state-driven welcome fields, 
 * run initial device profile re-hydration checks, and manage test routing operations.
 */
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function Index() {
  // 1. Global State Selectors & Hooks
  const { user, token, checkAuth, logout } = useAuthStore();
  
  // NOTE: Log wrapper groups state signatures together for quick verification during phone testing
  console.log((user, token));
  
  // 2. Session Re-Hydration Lifecycle
  useEffect(() => {
    // Inspects local device cache immediately upon component mounting to recover existing sessions
    checkAuth();
  }, []);
  
  // 3. UI Rendering
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {user?.username}</Text>
      <Text style={styles.title}>Token: {token}</Text>
      
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
      
      <Link href="/(auth)/signup">Signup </Link>
      <Link href="/(auth)">Login </Link>
    </View>
  );
}

// 4. Temporary Structural Layout Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
      justifyContent: "center",
      alignItems: "center",
  },
  title: { color: "blue" },
});