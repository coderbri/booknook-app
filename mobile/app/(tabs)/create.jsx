import { useState } from "react";
import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_URL } from "../../constants/api";

/**
 * Create Tab Screen Component
 * Renders the authoring interface container used to handle new user entries and submissions.
 */
export default function Create() {
    const [title, setTitle] = useState("");
    const [caption, setCaption] = useState("");
    const [rating, setRating] = useState(3);
    const [image, setImage] = useState(null); // to display the selected image local path (URI)
    const [imageBase64, setImageBase64] = useState(null); // stores raw string data for network transmission
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    
    const pickImage = async () => {
        /**
         * Controls native media library permissions authorization checks and manages
         * asset selection, transforming picked image data into localized path URIs and Base64 strings.
         */
        try {
            if (Platform.OS !== "web") { // if on device, not web
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                
                // console.log({ status }); --> {"status": "granted"}
                if (status !== "granted") {
                    Alert.alert("Permission Denied", "We need camera roll permissions to upload an image");
                    return;
                }
            }
            
            // launch image library
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5, // lower quality for smaller base64 representation
                base64: true,
            })
            
            if (!result.canceled) {
                // console.log("result is here: ", result); 
                // --> creates dictionary loading with a huge string in base64 format and all the other properties defined in result
                setImage(result.assets[0].uri)
                
                // if base64 is provided directly by picker asset, use it
                if (result.assets[0].base64) {
                    setImageBase64(result.assets[0].base64);
                } else {
                    // otherwise, manually convert local asset file system URI to base64 format string
                    const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setImageBase64(base64);
                }
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "There was a problem selecting your image");
        }
    };
    
    const handleSubmit = async () => {};
    
    const renderRatingPicker = () => {
        /**
          * Renders rating. If rated 1 star, make the following stars just outlined;
          * if user rated a higher star rating, fill up the previous unfilled stars if any.
          * 
          * Loops through an isolated index matrix to map touchable star interfaces.
          * Compares item indexes against current rating variables to fill or outlined icons.
          */
        const stars = [];
        
        for ( let i = 1; i <= 5; i++ ) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setRating(i)}
                    style={styles.starButton}
                    >
                    <Ionicons 
                        name={ i <= rating ? "star" : "star-outline" }
                        size={32}
                        color={i <= rating ? "#f4b400" : COLORS.textSecondary}
                    />
                </TouchableOpacity>
            )
        }
        return <View style={styles.ratingContainer}>{stars}</View>
    };
    
    // ========================
    // 4. Main Layout Rendering
    // ========================
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
                
                <View style={styles.card}>
                    
                    {/* HEADER */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Add Book Recommendation</Text>
                        <Text style={styles.subtitle}>Share your favorite reads with others</Text>
                    </View>
                    
                    <View style={styles.form}>
                        {/* BOOK TITLE */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Book Title</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                name="book-outline"
                                size={20}
                                color={COLORS.textSecondary}
                                style={styles.inputIcon}
                                />
                                <TextInput
                                style={styles.input}
                                placeholder="Enter book title"
                                placeholderTextColor={COLORS.placeholderText}
                                value={title}
                                onChangeText={setTitle}
                                />
                            </View>
                        </View>
                    </View>
                    
                    {/* RATING */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Your Rating</Text>
                        {renderRatingPicker()}
                    </View>
                    
                    {/* IMAGE */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Book Image</Text>
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.placeholderContainer}>
                                    <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                                    <Text style={styles.placeholderText}>Tap to select image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                    
                    {/* CAPTION */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Caption</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Write your review or thoughts about this book..."
                            placeholderTextColor={COLORS.placeholderText}
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                        />
                    </View>
                    
                    <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <>
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={20}
                                    color={COLORS.white}
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.buttonText}>Share</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}