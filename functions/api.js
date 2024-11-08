const express = require("express");
const serverless = require("serverless-http");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const cors = require("cors");
const humanizeDuration = require("humanize-duration");

const app = express();
const router = express.Router();

// Extract the clean domain name
function extractDomain(url) {
    try {
        url = url.replace(/^https?:\/\//, "");
        url = url.replace(/\/$/, "");
        const domainParts = url.split("/");
        const domainName = domainParts[0];
        const domainPartsWithoutSubdomain = domainName.split(".");
        const domainWithoutSubdomain = domainPartsWithoutSubdomain
            .slice(-2)
            .join(".");
        return domainWithoutSubdomain;
    } catch (error) {
        return null;
    }
}

router.get("/domain-checker/:domain", async (req, res) => {
    try {
        const { domain } = req.params;

        const domainName = extractDomain(domain);

        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

        if (!domainRegex.test(domainName)) {
            return res.status(400).json({
                error: "Invalid domain format. Please provide a valid domain (e.g., example.com)",
            });
        }

        const browser = await puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        await page.goto(`https://whois.com/whois/${domainName}`, {
            waitUntil: "domcontentloaded",
        });

        // Extract domain registration date
        const registeredOn = await page.evaluate(() => {
            const getTextContent = (element) =>
                element ? element.textContent.trim() : null;
            const row = Array.from(document.querySelectorAll(".df-row")).find(
                (row) => row.querySelector(".df-label")?.textContent.includes("Registered On")
            );
            return getTextContent(row?.querySelector(".df-value"));
        });

        if (!registeredOn) {
            res.status(404).json({
                status: "error",
                message: "Domain registration date not found. The domain might not exist or WHOIS data is protected.",
            });
        }

        // Calculate domain age
        const registrationDate = new Date(registeredOn);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - registrationDate.getTime();
        const formattedAge = humanizeDuration(timeDiff, { largest: 3, conjunction: " and " });
        
        res.status(200).json({
            status: "success",
            data: { 
                domain,
                registrationYear: registrationDate.getFullYear(),
                currentYear: currentDate.getFullYear(),
                formattedAge,
                registrationDate: registeredOn,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch domain age. Please try again later.",
            error: error.message,
        });
    }
});

app.use(cors({ origin: "*" }));

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
