import puppeteer from "puppeteer";
import prettyMilliseconds from "pretty-ms";

async function calculateDomainAge(domain) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to the target WHOIS page
    await page.goto(`https://whois.com/whois/${domain}`, {
      waitUntil: "domcontentloaded",
    });

    // Extract domain registration date
    const registeredOn = await page.evaluate(() => {
      const getTextContent = (element) =>
        element ? element.textContent.trim() : "N/A";
      const row = Array.from(document.querySelectorAll(".df-row")).find((row) =>
        row.querySelector(".df-label")?.textContent.includes("Registered On")
      );
      return getTextContent(row?.querySelector(".df-value"));
    });

    // Calculate domain age in years and days
    const registrationDate = new Date(registeredOn);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - registrationDate.getTime();
    const formattedAge = prettyMilliseconds(timeDiff, { verbose: true });

    // Get the current year
    const currentYear = currentDate.getFullYear();

    // Determine the domain registration year
    const registrationYear = registrationDate.getFullYear();

    await browser.close();
    return { formattedAge, registrationYear, currentYear };
  } catch (error) {
    console.error("Error fetching domain info:", error);
  }
}

// Example usage
const domain = "https://www.kooora/"; // Replace with your domain
calculateDomainAge(domain).then(
  ({ formattedAge, registrationYear, currentYear }) => {
    console.log(
      `The domain ${domain} was registered in ${registrationYear} and is ${formattedAge} old.`
    );
  }
);
