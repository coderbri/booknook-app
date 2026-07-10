import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "../../store/authStore";

/**
 * Home Tab Screen Component
 * Renders the primary dashboard view context within the core tab navigator group.
 */
export default function Home() {
    
    const { logout } = useAuthStore();
    
    return (
        <View>
            <Text>Home tab</Text>
                
            <TouchableOpacity onPress={logout}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}