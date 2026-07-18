# BookEase — Full Stack Project
A full-stack property booking web application built using **HTML, CSS, Bootstrap, React.js, Node.js, Express.js, and MongoDB**.  

## Project Overview
This project allows users to simulate property booking activities including viewing listings, searching for destinations, managing bookings, and applying to host their own properties.
It provides a full-stack experience with a frontend user interface and a backend server with database integration.
The interface is clean, responsive, and user-friendly, with features similar to real-world vacation rental platforms.
It’s ideal for learning modern full-stack web development, secure authentication, media uploads, and payment integration.

## Features
- **User Authentication**: Sign up and login with secure sessions
- **Role-Based Access**: Specialized views and permissions for Users, Hosts, and Admins
- **Property Listings**: Browse, view details, and explore galleries of various accommodations
- **Booking System**: Select dates, calculate prices, and book properties
- **Dynamic Pricing**: Automatic calculation of base rates, cleaning fees, and service fees
- **Host Dashboard**: Apply to become a host, manage listings, and track earnings
- **Identity Verification**: Host applications require government ID submission for approval
- **Admin Dashboard**: Oversee users, approve host applications, and manage withdrawal requests
- **Payment Integration**: Secure checkout and simulated transactions using Razorpay
- **Interactive Reviews**: Guests can leave 5-star ratings and written reviews for past stays
- **Favorite Listings**: Users can bookmark their favorite properties for quick access
- **Image Uploads**: Upload property and profile images dynamically to Cloudinary
- **Search & Filter**: Look up properties by city, destination, or accommodation type
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Lazy Loading**: Optimized image rendering and routing for faster page loads
- **Backend API**: Handles user data, reservations, notifications, and property information
- **Database Integration**: MongoDB stores user profiles, reviews, listings, and bookings
- **Visitor Analytics**: Track user visits and geolocate traffic using IP logging
- **Notifications**: Alerts and system notifications for bookings and account updates
- **Multi-page Routing**: Navigate between pages using react-router-dom

## Technologies Used
- **HTML** – Structure of pages
- **CSS & Bootstrap** – Styling and responsive layout
- **JavaScript** – Core language for dynamic behavior and logic in React
- **React.js (Vite)** – Dynamic UI and component-based architecture
- **Node.js & Express.js** – Server-side logic and API routing
- **MongoDB** – Database for storing user data, listings, and bookings

### Tools & Libraries
- Passport (passport-local, passport-local-mongoose) for user authentication
- Cloudinary & Multer for cloud image storage and uploading
- Razorpay for payment gateway integration
- React Router for multi-page routing
- dotenv for environment variable management
- Helmet & Rate-Limiter for backend security

## Project Structure
```
BookEase/
│
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application pages (Home, Dashboard, Admin, etc.)
│   │   ├── Layout/       # Structural layouts (Navbar, Footer)
│   │   ├── main.jsx      # React entry point
│   └── package.json
│
├── backend/
│   ├── controllers/      # Business logic (User, Listing, Host, etc.)
│   ├── models/           # MongoDB schemas and models
│   ├── routes/           # API endpoints
│   ├── index.js          # Server entry point
│   ├── multer.js         # Cloudinary storage configuration
│   └── package.json
│
└── README.md             # Project documentation
```

## Learning Outcomes
By building this project, I learned:

### Frontend Skills
- Building component-based UI with React.js
- Implementing responsive designs with Bootstrap and CSS
- Managing state and props for complex dynamic interfaces
- Multi-page navigation with react-router-dom
- Handling complex forms and file uploads

### Backend Skills
- Creating robust RESTful APIs with Node.js and Express.js
- Database design and complex relational schema modeling with MongoDB & Mongoose
- Integrating third-party APIs (Cloudinary, Razorpay)
- Authentication using Passport.js and secure session cookies
- Security best practices including rate limiting and cross-origin resource sharing (CORS)
- Environment management with dotenv

### Full-Stack Skills
- Connecting frontend and backend via API calls
- Managing secure user sessions across different domains
- Handling asynchronous operations for file uploads and database queries
- Understanding the flow of data from the database to the client

## Note / Disclaimer
This project is for learning and showcase purposes.
It does not involve real money, real property rentals, or live bookings. Any properties or payments simulated in this application are for practice only.

Do not use this project for real financial transactions or live property management.
