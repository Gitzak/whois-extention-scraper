import express from "express";
import getDomainAge from "../controllers/domainAgeController.js";

const router = express.Router();

router.get("/domain-age/:domain", async (req, res) => {
  try {
    const result = await getDomainAge(req, res);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export default router;