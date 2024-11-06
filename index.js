import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PORT, EXTENSION_ORIGIN } from "./src/config/config.js";
import routes from "./src/routes/index.js";

const app = express();

// const allowedOrigins = [EXTENSION_ORIGIN];

// // CORS options with dynamic origin validation
// const corsOptions = {
//     origin: (origin, callback) => {
//         // Check if the origin is in the allowedOrigins list
//         if (allowedOrigins.includes(origin) || !origin) {
//             // Allow the request if the origin is allowed or it's a request without origin (e.g., from same-origin)
//             callback(null, true);
//         } else {
//             // Reject the request if the origin is not allowed
//             callback(new Error("Origin is not allowed by CORS"));
//         }
//     },
// };

// // Enable CORS and JSON parsing
// app.use(cors(corsOptions));

app.use(express.json());

// Use Helmet middleware
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // default source is self (your domain)
            scriptSrc: ["'self'", "blob:", "https://infird.com"], // Allow 'self' and blob URLs for scripts
            // You can add other directives as needed, such as styleSrc, imgSrc, etc.
        },
    })
);

// Use the domain age router
app.use("/api", routes.domainAgeRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
