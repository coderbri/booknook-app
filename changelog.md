# BookNook – Changelog

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