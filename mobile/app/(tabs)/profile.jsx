import { useEffect, useState } from "react";
import {
    View,
    Alert,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import { sleep } from "."; // Reusing the shared async sleep utility imported from the primary index view file
import Loader from "../../components/Loader";

/**
 * Profile Tab Screen Component
 * Renders user account metrics, active configuration parameters, and session management contexts.
 */
export default function Profile() {
    // 1. Component State Definitions
    const [books, setBooks] = useState([]);                      // Holds personal recommendation records filtered by active user
    const [isLoading, setIsLoading] = useState(true);            // Controls full-screen initial component loading state
    const [refreshing, setRefreshing] = useState(false);         // Tracks pull-to-refresh execution states
    const [deleteBookId, setDeleteBookId] = useState(null);      // Stores current target recommendation ID undergoing deletions
    
    const { token } = useAuthStore();
    const router = useRouter();
    
    // 2. Data Transfer Operations
    /**
     * Pulls filtered database records owned exclusively by the current authenticated session.
     */
    const fetchData = async () => {
        try {
            setIsLoading(true);
            
            const response = await fetch(`${API_URL}/books/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch user books");
            
            setBooks(data);
            
        } catch (error) {
            console.error("Error fetching data:", error);
            Alert.alert("Error", "Failed to load profile data. Pull down to refresh.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    /**
     * Executes delete requests targeting a single recommendation post ID.
     * On network success, purges the target item locally to keep UI state unified.
     * @param {string} bookId - Unique identifier of the target recommendation post to delete.
     */
    const handleDeleteBook = async (bookId) => {
        setDeleteBookId(bookId); // Triggers loading spinner for the specific target item card
        try {
            const response = await fetch(`${API_URL}/books/${bookId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to delete book");
            
            // Client-side UI State Sync: Filter out the deleted record instantly
            setBooks(books.filter((book) => book._id !== bookId));
            Alert.alert("Success", "Recommendation deleted successfully");
            
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to delete recommendation");
        } finally {
            setDeleteBookId(null); // Reset target ID selector to clear loading states
        }
    };
    
    /**
     * Prompts the user with a confirmation overlay before firing delete pipelines.
     */
    const confirmDelete = (bookId) => {
        Alert.alert("Delete Recommendation", "Are you sure you want to delete this recommendation?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => handleDeleteBook(bookId)}
        ]);
    };
    
    // 3. UI Component Sub-Renderers
    /**
     * Renders a simplified, single-row preview card representing a user's personal post.
     */
    const renderBookItem = ({ item }) => (
        <View style={styles.bookItem}>
            <Image source={item.image} style={styles.bookImage} />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
                <Text style={styles.bookCaption} numberOfLines={2}>
                    {item.caption}
                </Text>
                <Text style={styles.bookDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            
            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item._id)}>
                {deleteBookId === item._id ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                    <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
                )}
            </TouchableOpacity>
        </View>
    );
    
    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={14}
                    color={i <= rating ? "#f4b400" : COLORS.textSecondary}
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };
    
    /**
     * Pull-to-refresh execution wrapper. Employs micro-timeout sleep throttling.
     */
    const handleRefresh = async() => {
        setRefreshing(true);
        await sleep(500); // Prevents visual UI jumping during extremely fast database updates
        await fetchData();
        setRefreshing(false);
    };
    
    // Loader gating (only runs on initial mounting, not on manual pull-to-refresh requests)
    if (isLoading && !refreshing) return <Loader />;
    
    return (
        <View style={styles.container}>
            
            {/* User Profile Bio Summary Header Section */}
            <ProfileHeader />
            {/* Interactive Global Session Termination Button */}
            <LogoutButton />
            
            {/* Section Header */}
            <View style={styles.container}>
                <Text style={styles.booksTitle}>Your Recommendations 📚</Text>
                <Text style={styles.booksCount}>{books.length} books</Text>
            </View>
            
            <FlatList
                data={books}
                renderItem={renderBookItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.booksList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="book-outline" size={50}
                            color={COLORS.textSecondary}
                        />
                        <Text style={styles.emptyText}>No recommendations yet</Text>
                        
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push("/create")}
                        >
                            <Text style={styles.addButtonText}>Add Your First Book</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}