export default function extractDomainName(url) {
  // Remove protocol (http://, https://, etc.)
  url = url.replace(/^https?:\/\//, "");

  // Remove trailing slash
  url = url.replace(/\/$/, "");

  // Split the URL by '/' to get the domain part
  const domainParts = url.split("/");

  // The second part is usually the domain name
  const domainName = domainParts[0];

  // Handle subdomains like 'www.'
  const domainPartsWithoutSubdomain = domainName.split(".");
  const domainWithoutSubdomain = domainPartsWithoutSubdomain
    .slice(-2)
    .join(".");

  return domainWithoutSubdomain;
}
