import express from "express";
import cors from "cors";
import helmet from "helmet";
import { PORT } from "./src/config/config.js";
import routes from "./src/routes/index.js";

const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Use Helmet middleware
app.use(helmet());

// Use the domain age router
app.use(routes.domainAgeRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
