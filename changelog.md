# BookNook – Changelog

## [ v0.8.0 ] – React Native & Expo Environment Setup
**Release Date:** June 5, 2026

### Overview
Initialized the mobile application inside the `mobile/` directory and configured the Expo development environment. Boilerplate was stripped down and the assets directory was prepped with the foundational resources needed for frontend development.

### Setup
- Initialized a new Expo project in the `mobile/` directory using the latest template:
  ```bash
  npx create-expo-app@latest .
  ```

- Removed Expo boilerplate to start from a clean slate:
  ```bash
  npm run reset-project
  ```
  
- Started the Expo development server to confirm the environment is running:
  ```bash
  npx expo
  ```
⠀
### Assets Preparation
- Populated the `assets/` directory with the following resources needed for the UI build:
  - `fonts/` — Custom typefaces to be loaded via Expo's font utilities
  - `images/` — Static image assets (icons, placeholders, etc.)
  - `styles/` — Shared base styles to be referenced across screens and components

---

## [ v0.7.0 ] – Delete Book Route, Get Books by User & API Completion
**Release Date:** May 26, 2026

### Overview
Completed the backend API by adding the remaining book routes and enabling CORS middleware. The server now supports the full set of operations needed by the mobile client: create, read (paginated + by user), and delete.

### Files Modified
- `src/routes/bookRoutes.js` — Added two new endpoints and updated the file description comment:
  - `GET /api/books/user` — Retrieves all book posts created exclusively by the currently authenticated user; filters the `Book` collection by `req.user._id` and sorts results by `createdAt` descending so the user's most recent recommendations appear first on their profile page
  - `DELETE /api/books/:id` — Owner-enforced deletion with Cloudinary asset cleanup:
    1. Looks up the book by the `:id` route parameter; returns `404` if not found
    2. Compares the book's `user` field against req.user._id as strings; returns `401` if they don't match, ensuring users can only delete their own posts
    3. If the stored image URL contains `"cloudinary"`, extracts the public asset ID by parsing the URL path (everything after the last `/`, minus the file extension) and calls `cloudinary.uploader.destroy()` to remove the asset from cloud storage; Cloudinary cleanup errors are caught separately so a storage failure doesn't block the database deletion
    4. Calls `book.deleteOne()` to remove the document and returns a success message
  
- `src/index.js` — Imported `cors` and added `app.use(cors())` middleware before the route mounts; allows the React Native client to make cross-origin requests to the API without being blocked by the browser's same-origin policy

---

## [ v0.6.0 ] – Get Books with Pagination
**Release Date:** May 19, 2026

### Overview
Implemented paginated retrieval for book posts to support infinite scrolling in the home feed. Rather than loading all posts at once, the endpoint fetches a controlled subset per request using query parameters — keeping API response sizes small and predictable as the dataset grows.

### Pagination Logic
The `GET /api/books` endpoint accepts two optional query parameters:
| **Parameter** | **Default** | **Description**                   |
|:-------------:|:-----------:|:---------------------------------:|
| `page`        | `1`         | Which page of results to return   |
| `limit`       | `5`         | How many books to return per page |

These drive three key values inside the route:
- `page` — The current page number parsed from the query string; determines which slice of results to return
- `limit` — The maximum number of books returned per response; controls payload size
- `skip` — Calculated as `(page - 1) * limit`; tells MongoDB how many documents to skip before returning results (e.g. page 2 with a limit of 5 skips the first 5 documents)
- `.populate("user", "username profileImage")` — Replaces the raw `ObjectId` stored in the book's user `field` with the actual `username` and `profileImage` values from the referenced `User` document, so the client receives full creator details without a separate request

Example request for page 2 with 5 results per page:
```
GET http://localhost:3000/api/books?page=2&limit=5
```

### Files Modified
- `src/routes/bookRoutes.js` — Added the `GET /api/books` endpoint:
  - Reads `page` and `limit` from query params (defaults: `1` and `5`)
  - Calculates `skip` offset for MongoDB cursor positioning
  - Queries the `Book` collection sorted by `createdAt` descending (newest first), with pagination applied via `.skip()` and `.limit()`
  - Populates the `user` field with `username` and `profileImage` from the `User` collection
  - Returns the books array alongside `currentPage`, `totalBooks`, and `totalPages` metadata for the client to manage infinite scroll state
  - Updated file description comment to reflect paginated retrieval

---

## [ v0.5.0 ] – Model Setup: Create Book Route
**Release Date:** May 19, 2026

### Overview
Set up the book model, routes, and supporting infrastructure for book post creation. Book posts are linked to the user who created them and support image uploads via Cloudinary. Route access is restricted to authenticated users through a new middleware layer.

### Cloudinary Integration
- Created an account on [Cloudinary](https://cloudinary.com/) for cloud-based image storage
- Added the following environment variables to `.env` using credentials from the Cloudinary dashboard (Settings > API Keys):

  ```
    CLOUDINARY_CLOUD_NAME=<cloud_name>
    CLOUDINARY_API_KEY=<api_key>
    CLOUDINARY_API_SECRET=<api_secret>
  ```

### Files Added
- `src/models/Book.js` — Mongoose schema for book posts with `title`, `caption`, `image` (Cloudinary URL), and `rating` (1–5) fields; includes a user field referencing the `User` model via `ObjectId` to associate each post with its creator; timestamps enabled
- `src/routes/bookRoutes.js` — Defines the `POST /api/books` endpoint for creating a new book post:
  - Validates that all fields (`title`, `caption`, `rating`, `image`) are present
  - Uploads the provided base64 image to Cloudinary and stores the returned secure URL
  - Saves the new book document to the database with the authenticated user's ID attached via `req.user._id`
  - Stubbed with a comment for future `READ`, `UPDATE`, and `DELETE` implementations
- `src/lib/cloudinary.js` — Initializes and exports the Cloudinary SDK instance configured with environment variables
- `src/middleware/auth.middleware.js` — `protectRoute` middleware that guards private routes by:
  - Extracting the Bearer token from the `Authorization` request header
  - Verifying the token signature against `JWT_SECRET`
  - Fetching the corresponding user from the database (excluding the password field)
  - Attaching the user document to `req.user` for use in downstream route handlers
  - Returning a `401` response if the token is missing, expired, or invalid
- `src/middleware/` — New directory created within `backend/src/` to house all Express middleware

### ⠀Files Modified
- `src/index.js` — Imported `bookRoutes` and mounted it at `/api/books`

---

## [ v0.4.1 ] – Stronger JWT Secret
**Release Date:** May 18, 2026

### Configuration
- Replaced the manual `JWT_SECRET` value in `.env` with a cryptographically secure key generated via OpenSSL:
  
  ```bash
  openssl rand -base64 32
  ```
  
  This produces a random 32-byte string encoded in Base64, making the secret significantly harder to brute-force than a hand-written passphrase. Copy the output directly into `.env`:
  
  ```
  JWT_SECRET=<generated_key>
  ```

---

## [ v0.4.0 ] – Login Route
**Release Date:** May 18, 2026

### Login Workflow
The login process mirrors the signup flow but focuses on verifying an existing user's identity rather than creating a new one:
1. User types their email and password into the login form
2. The app validates that all required fields are filled out
3. On tap of "Login", credentials are sent to the server
4. The server queries the database for a user matching the provided email
5. If found, the server compares the entered password against the stored hashed password
6. If the passwords match, the server generates a JWT — a signed digital ID tied to the user's account
7. The token and basic account info are sent back to the app
8. The app stores the token on the device using AsyncStorage for session persistence
9. The user is now logged in and can access the app

### ⠀Files Modified
- `src/models/User.js` — Added a `comparePassword` instance method to the schema that uses `bcrypt.compare` to securely check a plain-text password against the stored hash; keeps password comparison logic on the model rather than in the route
- `src/routes/authRoutes.js` — Replaced the placeholder `POST /login` stub with a fully implemented endpoint:
  - Validates that both `email` and `password` fields are present
  - Queries the database for a user by email; returns a generic `"Invalid credentials"` message if not found (intentionally avoids confirming whether the email exists)
  - Calls `user.comparePassword()` to verify the password; returns the same generic error on mismatch to prevent user enumeration
  - On success, generates a JWT via generateToken and returns it alongside the user's `_id`, `username`, `email`, and `profileImage`

### ⠀Testing
- Verified the `POST /api/auth/login` endpoint in Postman with a valid request body; confirmed a successful `200` response returning a signed JWT and account info
- Verified error handling for missing fields and invalid credentials

---

## [ v0.3.1 ] – Signup Route: Bug Fixes & Postman Testing
**Release Date:** May 16, 2026

### Bug Fixes
* `src/index.js` — Added the missing `express.json()` middleware so Express can parse incoming JSON request bodies; without it, `req.body` was always `undefined`, causing the register route to throw a destructuring error
* `src/models/User.js` — Removed the `next` parameter from the `pre("save")` hook and replaced the early return with a plain return instead of `return next()`; Mongoose's `async` pre-hooks resolve automatically when the function returns, so passing `next` as a parameter was causing a `TypeError: next is not a function error at runtime`
  * Also corrected `minLength` → `minlength` on the `password` field to match Mongoose's expected casing
  * Added `{ timestamps: true }` to the schema options to automatically track `createdAt` and `updatedAt` on every document

### Testing
* Verified the `POST /api/auth/register` endpoint in Postman with a valid request body; confirmed a successful `201` response returning a signed JWT and the new user's account info (excluding the hashed password)
* Verified error handling for invalid submissions (missing fields, short password, duplicate email/username)

---

## [ v0.3.0 ] – Model Setup: Signup Route
**Release Date:** May 15, 2026

### Authentication Overview
Implemented **token-based authentication** using JWT. Rather than re-validating credentials on every request, the server issues a signed token containing the user's ID at login. The app stores this token and sends it with future requests to prove identity. The signup workflow is as follows:

1. User fills out the signup form (username, email, password)
2. Client-side validation ensures all fields meet requirements (valid email, minimum password length, etc.)
3. On submit, the form data is sent to the server
4. Server checks the database to ensure the email and username are not already taken
5. If available, the server creates a new user account and hashes the password before saving
6. Server generates a JWT (JSON Web Token) — a signed, encrypted digital ID tied to the user
7. The token and basic account info are sent back to the app
8. The app stores the token in **AsyncStorage** — React Native's built-in key-value storage for persisting small pieces of data on the device (similar to `localStorage` in the browser)
9. The user is now authenticated and can access the app

### ⠀Files Added
- `src/models/User.js` — Mongoose schema for the user entity with `username`, `email`, `password`, and `profileImage` fields; includes a `pre("save")` middleware hook that automatically hashes the password using `bcryptjs` before storing it, so plain-text passwords are never written to the database
- `src/models/` — New directory created within `backend/src/` to house all Mongoose models

### ⠀Files Modified
- `src/routes/authRoutes.js` — Replaced the placeholder `GET /register` test route with a fully implemented `POST /register` endpoint:
  - Validates that all fields are present and meet minimum length requirements
  - Checks the database for duplicate email or username before proceeding
  - Generates a unique avatar via the ~[DiceBear Avataaars API](https://www.dicebear.com/)~ seeded with the username
  - Saves the new user to the database and returns a JWT along with basic account info
  - Added a `generateToken` helper that signs a JWT using `JWT_SECRET` from the environment, valid for 15 days
  - Added `JWT_SECRET` to `.env `for token signing

---

## [ v0.2.0 ] – Database Setup
**Release Date:** May 14, 2026

### MongoDB Atlas Configuration
- Created a new organization, project, and free-tier cluster on MongoDB Atlas (AWS, local timezone)
- Created a database user via the Atlas cluster connection wizard; selected the Node.js driver and copied the connection string to the `.env` file
- Added network access for the local IP address to allow connections to the cluster

    ```
    PORT=####
    MONGO_URI=mongodb+srv://<db_user>:<db_password>@cluster0.teqxf79.mongodb.net/db_name?appName=Cluster0
    ```

- Installed the MongoDB driver:

    ```bash
    npm install mongodb
    ```

### Files Added

- `src/lib/db.js` — Async connectDB function using Mongoose; logs the connected host on success and exits the process with a failure code on error

### Files Modified

- `src/index.js` — Imported connectDB and called it inside the app.listen callback so the database connection is established when the server starts

---

## [ v0.1.0 ] – Server Setup
**Release Date:** May 14, 2026

### Project Goals
- API development with Node.js and Express
- MongoDB as database, authentication with JWT
- Deploy API
- Build mobile application with React Native and Expo

### Project Structure
- Created two directories in the project root: `backend/` and `mobile/`
- Inside `backend/`, initialized the project and installed core dependencies:
  ```bash
  npm init -y
  npm i express mongoose dotenv jsonwebtoken cloudinary bcryptjs cors
  ```
  | Package | Purpose |
  |---|---|
  | `express` | Web framework for building the REST API |
  | `mongoose` | ODM for modeling and interacting with MongoDB |
  | `dotenv` | Loads environment variables from a `.env` file |
  | `jsonwebtoken` | Handles JWT creation and verification for auth |
  | `cloudinary` | Cloud storage for user-uploaded images |
  | `bcryptjs` | Hashes passwords before storing them |
  | `cors` | Enables cross-origin requests between the app and API |

- Installed `nodemon` as a dev dependency for auto-restarting the server during development:
  ```bash
  npm i nodemon -D
  ```

### Configuration
- Added `"type": "module"` to `package.json` to enable ES module syntax (`import`/`export`)
- Added a `dev` script to `package.json`:
  ```json
  "scripts": {
    "dev": "nodemon src/index.js"
  }
  ```
- Created a `src/` directory and moved `index.js` there — this is where all API logic will live

### Files Added
- **`src/index.js`** — Entry point; initializes the Express app, loads env variables, and mounts the auth router at `/api/auth`
- **`src/routes/authRoutes.js`** — Defines `/register` and `/login` routes; temporarily set as `GET` requests for browser-based testing during development

---

<section align="center">
  <code>coderBri © 2026</code>
</section>