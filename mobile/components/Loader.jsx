import { View, Text, ActivityIndicator } from "react-native";
import COLORS from "../constants/colors";

/**
 * Reusable Loading Spinner Layout
 * Spans viewport areas to display clean native system loaders during asynchronous data operations.
 * @param {string} size - Sizing dimension definition matching native tracking specifications ("small" | "large")
 */
export default function Loader({ size = "large" }) {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: COLORS.background,
            }}
        >
            <ActivityIndicator size={size} color={COLORS.primary} />
        </View>
    );
}