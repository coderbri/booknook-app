/**
 * @file Book.js
 * @description Mongoose schema for book posts, including references
 * to the creating user and automated timestamps.
*/
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        caption: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    }, 
    {timestamps: true}
);

const Book = mongoose.model("Book", bookSchema);
export default Book;
