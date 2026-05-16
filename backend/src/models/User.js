/**
 * @file User.js
 * @description Mongoose schema and model configuration for the user entity,
 * including pre-save hooks for password hashing.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    profileImage: {
        type: String,
        default: ""
    }
});

/**
 * Pre-save middleware hook to automatically hash passwords 
 * before saving a user document to the database.
*/
userSchema.pre("save", async function(next) {
    // Only has the password if it has been modified (or is new)
    if (!this.isModified("password")) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
});

const User = mongoose.model("User", userSchema);
export default User;
