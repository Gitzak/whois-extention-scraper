import puppeteer from "puppeteer";
import prettyMilliseconds from "pretty-ms";
import extractDomainName from "../utils/domainExtractor.js";

export default async function getDomainAge(req, res) {
    try {
        const { domain } = req.params;

        // Use the extracted domain name
        const extractedDomain = extractDomainName(domain);

        // Validate domain format
        const domainRegex =
            /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

        if (!domainRegex.test(extractedDomain)) {
            return res.status(400).json({
                error: "Invalid domain format. Please provide a valid domain (e.g., example.com)",
            });
        }

        const browser = await puppeteer.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--single-process",
                "--no-zygote",
            ],
            executablePath:
                process.env.NODE_ENV === "production"
                    ? process.env.PUPPETEER_EXECUTABLE_PATH
                    : puppeteer.executablePath(),
            headless: true,
        });
        const page = await browser.newPage();

        // Set timeout for navigation
        page.setDefaultNavigationTimeout(30000);

        // Navigate to the target WHOIS page
        await page.goto(`https://whois.com/whois/${domain}`, {
            waitUntil: "domcontentloaded",
        });

        // Extract domain registration date
        const registeredOn = await page.evaluate(() => {
            const getTextContent = (element) =>
                element ? element.textContent.trim() : null;
            const row = Array.from(document.querySelectorAll(".df-row")).find(
                (row) =>
                    row
                        .querySelector(".df-label")
                        ?.textContent.includes("Registered On")
            );
            return getTextContent(row?.querySelector(".df-value"));
        });

        await browser.close();

        if (!registeredOn) {
            return res.status(404).json({
                error: "Domain registration date not found. The domain might not exist or WHOIS data is protected.",
            });
        }

        // Calculate domain age
        const registrationDate = new Date(registeredOn);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - registrationDate.getTime();
        const formattedAge = prettyMilliseconds(timeDiff, { verbose: true });

        // Return the result
        return {
            success: true,
            data: {
                domain,
                registrationYear: registrationDate.getFullYear(),
                currentYear: currentDate.getFullYear(),
                formattedAge,
                registrationDate: registeredOn,
            },
        };
    } catch (error) {
        console.error("Error:", error);
        throw new Error("Failed to fetch domain age. Please try again later.");
    }
}
