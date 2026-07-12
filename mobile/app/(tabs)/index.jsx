import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useAuthStore } from "../../store/authStore";

import { Image } from "expo-image"; // Optimized image component using memory/disk caching mechanisms
import { useEffect, useState } from "react";

import styles from "../../assets/styles/home.styles";
import { API_URL } from "../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { formatPublishDate } from "../../lib/utils";
import COLORS from "../../constants/colors";
import Loader from "../../components/Loader";

/**
 * Home Tab Screen Component
 * Renders the primary dashboard view context within the core tab navigator group.
 */

/**
 * Halts execution flow asynchronously for a specified duration.
 * Provides a manual rendering throttle to prevent layout flickering during rapid visual transitions.
 * @param {number} ms - The millisecond timeout window duration.
 * @returns {Promise<void>} An unvalued operational confirmation promise.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
    // 1. Pagination & Rendering Local States
    const { token } = useAuthStore();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    // 2. Data Acquisition Pipelines
    /**
     * Fetches segmented data chunks from backend books resource pathways.
     * Manages query-string indexing, data deduplication, and loading states.
     * @param {number} pageNum - The data chunk page index to request.
     * @param {boolean} refresh - Resets the main list collection array when true.
     */
    const fetchBooks = async (pageNum = 1, refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else if (pageNum === 1) setLoading(true);
            
            // Appends limit and item parameters into the URL string route query signatures
            const response = await fetch(`${API_URL}/books?page=${pageNum}&limit=2`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch books");
            
            // TODO: fix it later
            // setBooks((prevBooks) => [...prevBooks, ...data.books]);
            
            // Deduplication Filter Process:
            // Combines and maps lists into a unique Set mapping based on database ObjectId indicators.
            // Eliminates duplicate component layouts across swift client pagination actions.
            const uniqueBooks =
                refresh || pageNum === 1
                ? data.books
                : Array.from(new Set([...books, ...data.books].map((book) => book._id))).map((id) =>
                    [...books, ...data.books].find((book) => book._id === id)
                );
            
            setBooks(uniqueBooks);
            
            // Updates boolean flag based on current index comparisons against database records metadata
            setHasMore(pageNum < data.totalPages);
            setPage(pageNum);
            
        } catch (error) {
            console.log("Error fetching books", error);
        } finally {
            if (refresh) {
                // Adds layout throttle buffer to keep mechanical visual transitions clean
                await sleep(800);
                setRefreshing(false);
            } else setLoading(false);
        }
    };
    
    // Mount initial feed loading on component entry lifecycle
    useEffect(() => {
        fetchBooks();
    }, []);
    
    /**
     * Infinite Scroll Trigger Handler
     * Fires when structural flatlist rendering reaches threshold target limits.
     */
    const handleLoadMore = async () => {
        if (hasMore && !loading && !refreshing) {
            await fetchBooks(page + 1);
        }
    };
    
    // 3. UI Template Sub-Renderers
    /**
     * Template structural mapper handling card rendering configurations for singular items.
     */
    const renderItem = ({ item }) => (
        <View style={styles.bookCard}>
            <View style={styles.bookHeader}>
                <View style={styles.userInfo}>
                    <Image source={{ uri: item.user.profileImage }} style={styles.avatar} />
                    <Text style={styles.username}>{item.user.username}</Text>
                </View>
            </View>
            
            {/* Book Image Cover Layout */}
            <View style={styles.bookImageContainer}>
                <Image source={item.image} style={styles.bookImage} contentFit="cover" />
            </View>
            
            {/* Feed Text Core Content Block */}
            <View style={styles.bookDetails}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <View style={styles.ratingContainer}>{renderRatingStars(item.rating)}</View>
                <Text style={styles.caption}>{item.caption}</Text>
                <Text style={styles.date}>Shared on {formatPublishDate(item.createdAt)}</Text>
            </View>
        </View>
    );
    
    /**
     * Loops through isolated loops up to 5 stars to map horizontal vector icon rows.
     */
    const renderRatingStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={16}
                    color={i <= rating ? "#f4b400" : COLORS.textSecondary}
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };
    
    // 3.5 Operational Lifecycle Interception Gating
    // Hijacks default rendering pipeline while the initial hydration fetch is active.
    // Mounts full-screen native loading layout skeletons to hide structural layout shift anomalies.
    if (loading) return <Loader />;
    
    console.log(books);
    
    return (
        <View style={styles.container}>
            <FlatList
                data={books}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                
                // Pull-To-Refresh Layout Configuration Block
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchBooks(1, true)}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                    />
                }
                
                // Infinite Pagination Threshold Definitions
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                
                // Header Layout Title Blocks
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>BookWorm 🐛</Text>
                        <Text style={styles.headerSubtitle}>Discover great reads from the community👇</Text>
                    </View>
                }
                
                // Infinite Scroll Foot Loading Indicators
                ListFooterComponent={
                    hasMore && books.length > 0 ? (
                        <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
                    ) : null
                }
                
                // Zero Records Found Fallback Interface Layout
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
                        <Text style={styles.emptyText}>No recommendations yet</Text>
                        <Text style={styles.emptySubtext}>Be the first to share a book!</Text>
                    </View>
                }
            />
    </View>
    );
}