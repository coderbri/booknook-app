/**
 * @file bookRoutes.js
 * @description Routes for book operations, inluding creation, 
 * image handling, paginated retrieval, and owner-enforced deletion.
*/
import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/books
 * @desc    Create a new book entry with an image upload
 * @access  Private
*/
router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        
        // 1. Validation
        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }
        
        // 2. Cloudinary Upload
        // Uploads the base64 or file path image to Cloudinary storage
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;
        
        // 3. Database Persistence
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id, // User ID provided by protectRoute middleware
        });
        
        await newBook.save();
        
        // 4. Response Dispatch
        res.status(201).json(newBook);
        
    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @route   GET /api/books
 * @desc    Retrieve a paginated list of all books with creator details.
 * @access  Private
*/
// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    // Example call from react native – frontend
    // const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");
    try {
        // 1. Pagination Setup
        // Convert strings from query params to numbers; default to page 1, limit 5
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page -1) * limit;
        
        // 2. Query Execution
        // Sort by 'createdAt' descending (-1) to show newest books first
        const books = await Book.find()
            .sort({ createdAt: -1 }) // desc
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");
        
        // 3. Metadata Calculation 
        const totalBooks = await Book.countDocuments();
        
        // 4. Response Dispatch
        res.send({
            books,
            currentPage: page,
            totalBooks: totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
        
    } catch (error) {
        console.log("Error in get all books route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @route   GET /api/books/user
 * @desc    Retrieve all books recommended exclusively by the logged-in user
 * @access  Private
*/
router.get("/user", protectRoute, async (req, res) => {
    try {
        // 1. Query Execution
        // Filter collection to match only the current authenticated user's ID
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        
        // 2. Response Dispatch
        res.json(books);
    } catch (error) {
        console.error("Get user books error:", error.message);;
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book entry from the database and its asset from cloudinary
 * @access  Private
*/
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        // 1. Document Existence Check
        const book = await Book.findById(req.params.id); // id matches the param passed in the route
        if (!book) return res.status(404).json({ message: "Book not found" });
        
        // 2. Ownership Verification
        // Compare target book owner ID string with the current user ID string
        if (book.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorized" });
        
        // 3. Cloudinary Asset Cleanup
        if (book.image && book.image.includes("cloudinary")) {
            try {
                // Extracts the public asset ID from the stored URL string
                // e.g., "https://res.cloudinary.com/.../v12345/publicId.png" -> "publicId"
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId); // destroy image stored with this publicid
                
            } catch (deleteError) {
                console.log("Error deleting image from cloudinary", deleteError);
            }
        }
        
        // 4. Database Deletion & Response
        await book.deleteOne();
        res.json({ message: "Book deleted successfully" });
        
    } catch (error) {
        console.log("Error deleting book successfully", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;