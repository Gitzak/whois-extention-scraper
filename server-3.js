import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import prettyMilliseconds from "pretty-ms";
import extractDomainName from "./utils/domainExtractor.js";

const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// API endpoint to get domain age
app.get("/api/domain-age/:domain", async (req, res) => {
  try {
    const { domain } = req.params;

    // Use the extracted domain name
    const extractedDomain = extractDomainName(domain);

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

    if (!domainRegex.test(extractedDomain)) {
      return res.status(400).json({
        error:
          "Invalid domain format. Please provide a valid domain (e.g., example.com)",
      });
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set timeout for navigation
    await page.setDefaultNavigationTimeout(30000);

    // Navigate to the target WHOIS page
    await page.goto(`https://whois.com/whois/${domain}`, {
      waitUntil: "domcontentloaded",
    });

    // Extract domain registration date
    const registeredOn = await page.evaluate(() => {
      const getTextContent = (element) =>
        element ? element.textContent.trim() : null;
      const row = Array.from(document.querySelectorAll(".df-row")).find((row) =>
        row.querySelector(".df-label")?.textContent.includes("Registered On")
      );
      return getTextContent(row?.querySelector(".df-value"));
    });

    await browser.close();

    if (!registeredOn) {
      return res.status(404).json({
        error:
          "Domain registration date not found. The domain might not exist or WHOIS data is protected.",
      });
    }

    // Calculate domain age
    const registrationDate = new Date(registeredOn);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - registrationDate.getTime();
    const formattedAge = prettyMilliseconds(timeDiff, { verbose: true });

    // Return the result
    res.json({
      success: true,
      data: {
        domain,
        registrationYear: registrationDate.getFullYear(),
        currentYear: currentDate.getFullYear(),
        formattedAge,
        registrationDate: registeredOn,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Failed to fetch domain age. Please try again later.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
