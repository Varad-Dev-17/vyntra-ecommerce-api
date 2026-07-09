# Project Report: Vyntra

## 1. Project Summary
**Application:** Vyntra
**Main Purpose:** A fullstack e-commerce platform allowing users to browse products, manage a cart/wishlist, place orders, and allowing administrators to manage inventory, categories, and track orders.
**User Roles:**
- **User:** Can browse products, add items to cart/wishlist, place orders, and leave reviews.
- **Admin:** Has elevated privileges (`isAdmin: true`) to access the dashboard, manage products, categories, users, orders, and coupons.

## 2. Tech Stack
* **Frontend:** React (v19.2.6), React DOM (v19.2.6)
* **Backend:** Node.js, Express (v5.1.0)
* **Database:** MongoDB via Mongoose (v8.14.0)
* **Styling:** Tailwind CSS (v4.3.1), PostCSS, Framer Motion (v12.40.0, animations), Lenis (v1.3.25, smooth scrolling)
* **State Management:** React Context API, Redux Toolkit (`@reduxjs/toolkit` v2.12.0, `react-redux` v9.3.0)
* **Authentication:** JSON Web Tokens (`jsonwebtoken` v9.0.2), Bcrypt.js (v2.4.3)
* **Libraries:** Axios (HTTP requests), React Hot Toast (notifications), Lucide React (icons), Joi (validation), Multer (file uploads), Nodemailer (email sending)
* **Build Tools:** Vite (v8.0.12), Concurrently (for dev script)

## 3. Complete Folder Structure
```text
vyntra/
├── server/                     # Backend API source code
│   ├── config/                 # Configuration files (e.g., database connection)
│   ├── controllers/            # Request handlers implementing business logic
│   ├── middlewares/            # Express middlewares (auth verification, admin check, validation)
│   ├── models/                 # Mongoose schemas for MongoDB collections
│   ├── routers/                # Express route definitions
│   └── utils/                  # Helper functions (email templates, hashing, GST calculation)
├── src/                        # Frontend React source code
│   ├── animations/             # Framer Motion animation configurations
│   ├── api/                    # Axios instances and API request logic
│   ├── components/             # Reusable React components (Navbar, Modals, Admin components)
│   │   ├── adminDashboardComponents/ # Components exclusively for the Admin Dashboard
│   │   └── trendingProductsComponents/ # Components for the trending section
│   ├── context/                # React Context providers (AuthContext, CartContext)
│   ├── hooks/                  # Custom React hooks
│   ├── pages/                  # Top-level page components (Home, SignIn, CartPage, etc.)
│   ├── App.jsx                 # Application entry point for routing and context providers
│   ├── index.css               # Global stylesheet and Tailwind imports
│   └── main.jsx                # React DOM render entry
├── package.json                # Project dependencies and scripts
├── vite.config.js              # Vite bundler configuration
└── tailwind.config.js          # Tailwind CSS configuration
```

## 4. Important Files
* **`server/index.js`**
  * **Purpose:** Main entry point for the backend server.
  * **Main Exports:** None (starts the Express server).
  * **Dependencies:** `express`, `mongoose`, `cors`, `cookie-parser`, `dotenv`.
* **`src/App.jsx`**
  * **Purpose:** Main React component handling routing (`react-router-dom`), layout structure, and wrapping the app in context providers.
  * **Main Exports:** `App` component.
  * **Dependencies:** `react-router-dom`, `react-hot-toast`, `AuthContext`, `CartContext`.
* **`server/config/db.js`**
  * **Purpose:** Establishes the connection to the MongoDB database.
  * **Main Exports:** `connectDB` function.
  * **Dependencies:** `mongoose`.
* **`server/middlewares/identification.js`**
  * **Purpose:** Middleware to protect routes by verifying JWT tokens from request cookies or headers.
  * **Main Exports:** `identifier` middleware function.
  * **Dependencies:** `jsonwebtoken`.

## 5. Frontend
* **Pages:** `AdminDashBoard.jsx`, `AdminSignInPage.jsx`, `CartPage.jsx`, `ChangePasswordPage.jsx`, `ForgotPasswordPage.jsx`, `Home.jsx`, `ProductsPage.jsx`, `SignIn.jsx`, `SignUp.jsx`.
* **Components:** `Category.jsx`, `Footer.jsx`, `HeroCarousel.jsx`, `Navbar.jsx`, `Newsletter.jsx`, `PageNotFound.jsx`, `ProductDetailsModal.jsx`, `SmoothScrollbar.jsx`, `SmoothScrollProvider.jsx`, `TrendingProducts.jsx`, plus multiple admin dashboard specific components (`SideBar.jsx`, `StocksSection.jsx`, etc.).
* **Layouts:** Implemented within `App.jsx` (`UserLayout` containing Navbar/Footer, and `AdminLayout`).
* **Routes:** `/`, `/signin`, `/signup`, `/admin/signin`, `/forgot-password`, `/home`, `/trending`, `/change-password`, `/products`, `/new-arrivals` (placeholder), `/cart`, `/admin/dashboard`.
* **Contexts:** `AuthContext.jsx` (handles user authentication state), `CartContext.jsx` (handles shopping cart state).
* **Hooks:** Found in `src/hooks/` directory.
* **Services / API layer:** Found in `src/api/` directory (likely Axios configurations).
* **Utilities:** Not explicitly found in a `utils` folder on the frontend, utility logic resides in contexts and components.

## 6. Backend
* **Routes:** `adminRoutes.js`, `attributeAdminRoutes.js`, `authroutes.js`, `cartRoutes.js`, `categoryAdminRoutes.js`, `couponRoutes.js`, `dashboardRoutes.js`, `orderAdminRoutes.js`, `productAdminRoutes.js`, `productPublicRoutes.js`, `reviewRoutes.js`, `subCategoryAdminRoutes.js`, `uploadRoutes.js`, `userRoutes.js`, `wishlistRoutes.js`, etc.
* **Controllers:** `adminController.js`, `attributeController.js`, `authController.js`, `cartController.js`, `categoryController.js`, `couponController.js`, `dashboardController.js`, `orderController.js`, `productController.js`, `reviewController.js`, `subCategoryController.js`, `userController.js`, `wishlistController.js`.
* **Middleware:** `identification.js` (verifies JWT), `isAdmin.js` (checks for `isAdmin: true`), `sendMail.js` (Nodemailer configuration), `validator.js` (Joi validation schemas).
* **Models:** `attribute.js`, `attributeOption.js`, `brand.js`, `cart.js`, `category.js`, `coupon.js`, `order.js`, `product.js`, `productReview.js`, `subCategory.js`, `user.js`, `wishlist.js`.
* **Utilities:** `forgotPasswordEmailTemplate.js`, `verificationEmailTemplate.js`, `gstCalculator.js`, `hash.js`.

## 7. Database
### `User` Schema
* **Fields:** `username` (String), `email` (String), `password` (String), `verified` (Boolean), `verificationCode` (String), `verificationCodeValidation` (Date), `forgotPasswordCode` (String), `forgotPasswordCodeValidation` (Date), `isAdmin` (Boolean), `isBlocked` (Boolean).
* **Validation:** Required fields (username, email, password), minLength constraints.
* **Indexes:** `username` (unique), `email` (unique).

### `Product` Schema
* **Fields:** `title` (String), `description` (String), `images` ([String]), `price` (Number), `stock` (Number), `ratingAverage` (Number), `ratingCount` (Number), `wishlistCount` (Number), `status` (String: active/inactive).
* **Relationships:** `category` (ref: Category), `subCategory` (ref: SubCategory), `brand` (ref: Brand), `attributes` (Array of objects referencing Attribute), `createdBy` (ref: User).
* **Validation:** Required fields (title, description, category, subCategory, price).
* **Indexes:** `title` (unique).

### `Category` & `SubCategory` Schemas
* **Fields:** `name` (String), `description` (String), `status` (String).
* **Relationships:** SubCategory has `category` (ref: Category). Both have `createdBy` (ref: User). Category has `attributes` (ref: Attribute).
* **Indexes:** SubCategory has compound unique index on `{ category: 1, name: 1 }`. Category `name` is unique.

### `Cart` Schema
* **Fields:** `products` (Array of objects containing `quantity` (Number), `size` (String), `color` (String)).
* **Relationships:** `userId` (ref: User), product objects have `productId` (ref: Product).
* **Indexes:** `userId` (unique).

### `Order` Schema
* **Fields:** `amount` (Number), `address` (Object), `status` (String: pending, processing, shipped, delivered, cancelled).
* **Relationships:** `userId` (ref: User), `products` array contains `productId` (ref: Product).

### `Coupon` Schema
* **Fields:** `code` (String), `description` (String), `discountType` (String: percentage/fixed), `discountValue` (Number), `minimumOrderAmount` (Number), `maximumDiscount` (Number), `usageLimit` (Number), `usedCount` (Number), `startDate` (Date), `expiryDate` (Date), `status` (String).
* **Relationships:** `createdBy` (ref: User).
* **Indexes:** `code` (unique).

### `ProductReview` Schema
* **Fields:** `rating` (Number, 1-5), `review` (String).
* **Relationships:** `product` (ref: Product), `user` (ref: User).
* **Indexes:** Compound unique index on `{ product: 1, user: 1 }`.

### `Wishlist` Schema
* **Relationships:** `user` (ref: User), `product` (ref: Product).
* **Indexes:** Compound unique index on `{ user: 1, product: 1 }`.

## 8. API Documentation
*Verified from routing files and controller imports structure.*

* **Auth (`/auth`)**
  * `POST /signup`: Registers user, sends verification OTP.
  * `POST /signin`: Authenticates user, returns JWT.
  * `POST /send-verification-code`: Resends OTP.
  * `PATCH /verify-verification-code`: Validates OTP and sets `verified: true`.
  * `PATCH /change-password`: Updates password (requires authentication).
  * `PATCH /send-forgot-password-code`: Sends password reset OTP.
  * `PATCH /verify-forgot-password-code`: Validates reset OTP and updates password.
* **Products (`/products`, `/admin/products`)**
  * `GET /`: Lists products.
  * `GET /:id`: Product details.
  * `POST /`, `PUT /:id`, `DELETE /:id` (Admin only): CRUD operations handled by `productController.js`.
* **Categories (`/categories`, `/admin/categories`)**
  * `GET /`: Lists categories.
  * `POST /`, `PUT /:id`, `DELETE /:id` (Admin only): Handled by `categoryController.js`.
* **Cart (`/cart`)**
  * Requires authentication (`identification` middleware). Handled by `cartController.js`. Operations to add, remove, and update quantities.
* **Orders (`/orders`, `/admin/orders`)**
  * `POST /`: Create new order.
  * `GET /`: Get user's orders.
  * Admin endpoints for updating order `status`. Handled by `orderController.js`.
* **Coupons (`/admin/coupons`)**
  * Admin only routes for CRUD on coupons. Handled by `couponController.js`.

## 9. Authentication Flow
1. **Registration:** User submits data to `/auth/signup`. The `authController` hashes the password with `bcryptjs`, creates an unverified `User` document, and generates an OTP.
2. **Email Verification:** The OTP is signed using `HMAC_VERIFICATION_CODE_SECRET` and sent via `nodemailer`. User submits OTP to `/auth/verify-verification-code` to become verified.
3. **Login:** User submits credentials to `/auth/signin`. Controller verifies password. A JWT is generated using `jsonwebtoken` and `JWT_TOKEN_SECRET`.
4. **Session:** The JWT is returned in the response (and typically stored in HTTP-only cookies).
5. **Authorization:** Subsequent requests to protected routes pass through `server/middlewares/identification.js`. This middleware extracts the token (from cookies or `Authorization` header), verifies it against `JWT_TOKEN_SECRET`, and attaches the decoded user data to the request object.
6. **Admin Checking:** For admin routes, `server/middlewares/isAdmin.js` checks if the authenticated user object has `isAdmin: true`.

## 10. Application Flow
1. **Client Interaction:** User interacts with the React frontend (e.g., clicks "Add to Cart").
2. **State & Request:** Frontend state (React Context/Redux) updates. Axios makes an HTTP request to the Express backend (e.g., `POST /cart`).
3. **Routing:** `server/index.js` routes the request to `cartRoutes.js`.
4. **Middleware:** The request passes through `identification.js` which verifies the user's JWT.
5. **Controller:** The request reaches `cartController.js`.
6. **Database:** Controller queries MongoDB via Mongoose (`Cart` model) to update the document.
7. **Response:** Controller sends a JSON response back to the frontend.
8. **UI Update:** The React component receives the response and displays a success toast notification using `react-hot-toast`.

## 11. Environment Variables
Verified usage in the codebase via `process.env`:
* `CLOUDINARY_CLOUD_NAME`: Used in `uploadRoutes.js`.
* `CLOUDINARY_API_KEY`: Used in `uploadRoutes.js`.
* `CLOUDINARY_API_SECRET`: Used in `uploadRoutes.js`.
* `NODE_CODE_SENDING_EMAIL_ADDRESS`: Used in `sendMail.js` and `authController.js` (SMTP User).
* `NODE_CODE_SENDING_EMAIL_PASSWORD`: Used in `sendMail.js` (SMTP Pass).
* `PORT`: Used in `server/index.js` to set the server port.
* `JWT_TOKEN_SECRET`: Used in `authController.js`, `adminController.js`, and `identification.js` to sign/verify JWTs.
* `MONGO_URI`: Used in `server/config/db.js` to connect to MongoDB.
* `HMAC_VERIFICATION_CODE_SECRET`: Used in `authController.js` for signing OTPs.
* `NODE_ENV`: Used in `authController.js` and `adminController.js` to set cookie `secure` flag (true if "production").

## 12. Features
**Implemented Features:**
* JWT-based authentication (Login, Register).
* Email verification via OTP.
* Password reset flow via email OTP.
* Role-based access control (Admin/User).
* Product catalog browsing.
* Shopping Cart management.
* Wishlist management.
* Order placement and status tracking.
* Product Reviews system.
* Admin Dashboard for managing Inventory (Products, Categories, SubCategories, Brands, Attributes).
* Admin Dashboard for managing Orders and Users.
* Coupon/Discount system.
* Image uploading via Cloudinary.

**Partially Implemented / Missing Features:**
* **New Arrivals Page:** Route exists in `App.jsx`, but renders a hardcoded placeholder: `<div>New Arrivals Page Coming Soon</div>`.
* **Payment Gateway:** Not Found. No Stripe, Razorpay, or similar SDKs are present in `package.json` or controllers.

## 13. Third-Party Services
* **MongoDB Atlas:** Database hosting (configured via `MONGO_URI`).
* **Cloudinary:** Used for product image hosting and upload handling (configured via `cloudinary` package).
* **SMTP Email Service:** Used for sending OTPs and reset links (configured via `nodemailer`).

## 14. Run Instructions
1. Clone the repository and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and populate it with the variables listed in Section 11.
4. Run the development server (starts both React and Express concurrently):
   ```bash
   npm run dev
   ```
5. (Production Build):
   ```bash
   npm run build
   npm start
   ```

## 15. Known Issues
* **Unfinished Code:** The `/new-arrivals` route in `App.jsx` renders a placeholder instead of an actual page component.
* **TODOs:** Not Found. No explicit `TODO` or `FIXME` comments were found in the source code files.

## 16. Dependency Report
* **`@reduxjs/toolkit` / `react-redux`:** State management libraries.
* **`axios`:** Promise-based HTTP client for the browser and Node.js.
* **`bcryptjs`:** Password hashing utility.
* **`cloudinary`:** SDK for integrating with Cloudinary's image hosting API.
* **`cookie-parser`:** Express middleware to parse cookie headers.
* **`cors`:** Express middleware to enable Cross-Origin Resource Sharing.
* **`dotenv`:** Loads environment variables from a `.env` file into `process.env`.
* **`express`:** Fast, unopinionated, minimalist web framework for Node.js.
* **`framer-motion`:** Animation library for React.
* **`joi`:** Object schema description language and validator for JavaScript objects (used for request validation).
* **`jsonwebtoken`:** Implementation of JSON Web Tokens.
* **`lenis`:** Lightweight smooth scrolling library.
* **`lucide-react`:** Icon library.
* **`mongoose`:** MongoDB object modeling tool (ODM).
* **`multer`:** Node.js middleware for handling `multipart/form-data` (used for file uploads).
* **`nodemailer`:** Module for Node.js applications to allow easy email sending.
* **`react` / `react-dom`:** Core React libraries.
* **`react-hot-toast`:** Toast notification library for React.
* **`react-router-dom`:** DOM bindings for React Router.
* **`tailwindcss` / `@tailwindcss/postcss` / `postcss` / `autoprefixer`:** Utility-first CSS framework and its post-processing dependencies.
* **`vite` / `@vitejs/plugin-react`:** Next-generation frontend tooling (bundler).
* **`concurrently`:** Utility to run multiple commands concurrently (used in the `dev` script).
* **`nodemon`:** Utility that monitors for changes and automatically restarts the Node server.

## 17. Overall Architecture
The project utilizes the **MERN** (MongoDB, Express, React, Node.js) stack in a unified monorepo structure.
* **Client-Server Separation:** The React frontend and Express backend are logically separated but housed in the same repository.
* **Development:** The `npm run dev` script uses `concurrently` to spin up two separate servers: the Vite development server (providing hot-module replacement for React) and the Nodemon server (running the Express API).
* **Production:** The `npm run build` script bundles the React application into a static `dist` folder. The `npm start` script then runs the Express server, which acts as a traditional API server for API routes, while also serving the static HTML/JS/CSS files from the `dist` folder for any non-API routes (enabling client-side routing).
* **Database Layer:** The backend interacts with MongoDB exclusively through Mongoose schemas and models, ensuring data validation at the application layer.
