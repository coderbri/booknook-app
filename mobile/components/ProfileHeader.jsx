import { View, Text } from "react-native"
import { useAuthStore } from "../store/authStore";
import { Image } from "expo-image";
import styles from "../assets/styles/profile.styles";
import { formatMemberSince } from "../lib/utils";

/**
 * Profile Header Sub-Component
 * Extracts user registration states from local stores and renders identity layouts.
 */

export default function ProfileHeader() {
    
    const { user } = useAuthStore();
    
    // Render safeguard to prevent property parsing exceptions when authentication processes are settling
    if (!user) return null;
    
    return (
        <View style={styles.profileHeader}>
            
            {/* User Profile Avatar Frame */}
            <Image 
                source={{ uri: user.profileImage }} 
                style={styles.profileImage}
            />
            
            {/* Identity Details Block */}
            <View style={styles.profileInfo}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
                
                {/* Formatted Date Block referencing custom localization utils */}
                <Text style={styles.memberSince}>🗓️ Joined {formatMemberSince(user.createdAt)}</Text>
            </View>
            
        </View>
    );
}