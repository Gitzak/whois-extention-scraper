const puppeteer = require('puppeteer');

async function getDomainInfo(domain) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navigate to the target WHOIS page
        await page.goto(`https://whois.com/whois/${domain}`, { waitUntil: 'domcontentloaded' });

        // Extract domain information
        const info = await page.evaluate(() => {
            const getTextContent = (element) => element ? element.textContent.trim() : 'N/A';

            // Get the domain name
            const domainName = getTextContent(document.querySelector('.whois-data .head h1'));

            // Get all rows once for later use
            const rows = Array.from(document.querySelectorAll('.df-row'));

            // Helper to find specific data based on label text
            const getRowValue = (label) => {
                const row = rows.find(row => row.querySelector('.df-label')?.textContent.includes(label));
                return getTextContent(row?.querySelector('.df-value'));
            };

            // Extract domain details
            const registrar = getRowValue('Registrar');
            const registeredOn = getRowValue('Registered On');
            const expiresOn = getRowValue('Expires On');
            const updatedOn = getRowValue('Updated On');
            const status = getRowValue('Status');

            // Extract and format name servers
            const nameServerElement = rows.find(row => row.querySelector('.df-label')?.textContent.includes('Name Servers'));
            const nameServers = nameServerElement ? nameServerElement.querySelector('.df-value').innerHTML.replace(/<br\s*\/?>/gi, ', ') : 'N/A';

            // Function to extract contact information
            const getContactInfo = (contactType) => {
                const contactElement = Array.from(document.querySelectorAll('.df-block')).find(block => block.querySelector('.df-heading')?.textContent.includes(contactType));
                const name = getTextContent(contactElement?.querySelector('.df-row:nth-child(2) .df-value'));
                const phone = getTextContent(contactElement?.querySelector('.df-row:nth-child(3) .df-value'));
                const email = getTextContent(contactElement?.querySelector('.df-row:nth-child(4) .df-value'));
                return { name, phone, email };
            };

            // Extract contact information
            const registrantContact = getContactInfo('Registrant Contact');
            const adminContact = getContactInfo('Administrative Contact');
            const technicalContact = getContactInfo('Technical Contact');

            return {
                domainName,
                registrar,
                registeredOn,
                expiresOn,
                updatedOn,
                status,
                nameServers,
                registrantContact,
                adminContact,
                technicalContact
            };
        });

        // Log the extracted information
        console.log(`Information for ${domain}:`, info);

        await browser.close();
        return info;
    } catch (error) {
        console.error('Error fetching domain info:', error);
    }
}

// Run the function
const domain = 'https://www.kooora.com/'; // Replace with your domain
getDomainInfo(domain);
