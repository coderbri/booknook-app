import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

/**
 * Root Application Layout
 * Acts as the global entry gatekeeper. Monitors authentication states and intercepts
 * routing segments in real-time to force structural route redirects across the app.
 */

// Retains the native native splash screen layout on launch instead of displaying a blank white canvasSplashScreen.preventAutoHideAsync();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter(); 
  const segments = useSegments(); // Returns an array of active route paths (e.g., ["(auth)"] or ["(tabs)"])
  
  const { checkAuth, user, token } = useAuthStore();
  
  // Asynchronously load typography assets
  const [fontsLoaded] = useFonts({
    "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMono-Medium.ttf"),
  });
  
  /** Splash Screen Life-Cycle Coordinator:
   * Postpones hiding the branding screen until BOTH custom typography is mounted 
   * AND local session verification workflows conclude.
   */ 
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);
  
  // console.log("segments: ", segments);
  
  /** 1. Storage Re-Hydration
   * Check for cached tokens on boot to determine initial auth state  */
  useEffect(() => {
    checkAuth();
  }, []);
  
  /** 2. Navigation Guard & Route Redirection
   * handle navigation based on the auth state  */
  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;
    
    // Step A: Boot unauthenticated users straight out to the login/signup flow
    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)");
    // Step B: Bounce authenticated users away from login screens and into core app tabs
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)");
    
  }, [ user, token, segments ]); // Re-runs whenever authentication states or path segments change
  
  // 3. UI Shell Architecture
  return (
    <SafeAreaProvider>
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </SafeScreen>
        <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}