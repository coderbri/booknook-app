import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useAuthStore } from "../store/authStore";
import styles from "../assets/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";

/**
 * Logout Button Component
 * Triggers modal confirmation sequences and clears active device sessions.
 */
export default function LogoutButton() {
    
    const { logout } = useAuthStore();
    
    /**
     * Intercepts immediate logout triggers to require user double-confirmation.
     */
    const confirmLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" }, // Safely abort operations without execution changes
            { text: "Logout", onPress: () => logout(), style: "destructive" }, // Clear memory/AsyncStorage session tokens
        ]);
    };
    
    return (
        <TouchableOpacity 
            style={styles.logoutButton}
            onPress={confirmLogout}
        >
            <Ionicons 
                name="log-out-outline"
                size={20}
                color={COLORS.white}
            />
            <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
    );
}