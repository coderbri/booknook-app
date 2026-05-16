# BookNook – Changelog

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