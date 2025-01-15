// Import necessary modules
const http = require('http'); // Core module to create an HTTP server
const fs = require('fs'); // File system module for reading files
const path = require('path'); // Path module to work with file paths
const axios = require('axios'); // Axios library for making HTTP requests
const url = require('url'); // Core module for parsing URL strings

// Exchange rate API key and base URL
const API_KEY = '3ab70965fa06569a4396f482';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

// Function to get exchange rate between two currencies
async function getExchangeRate(fromCurrency, toCurrency) {
    // Make API call to get exchange rates for the given currency
    const response = await axios.get(`${API_URL}${fromCurrency}`);
    return response.data.conversion_rates[toCurrency]; // Return the rate for the target currency
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true); // Parse the request URL
    const pathName = parsedUrl.pathname; // Extract the pathname

    // Serve static files from the "public" directory
    if (pathName.startsWith('/public')) {
        const filePath = path.join(__dirname, pathName); // Get the full path to the file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                // If file not found, send a 404 response
                res.writeHead(404);
                res.end('File not found');
            } else {
                // Set content type based on file extension
                const ext = path.extname(filePath);
                let contentType = 'text/plain';
                if (ext === '.html') {
                    contentType = 'text/html';
                } else if (ext === '.css') {
                    contentType = 'text/css';
                } else if (ext === '.js') {
                    contentType = 'application/javascript';
                }
                // Send file data with the appropriate content type
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    } else if (pathName === '/' || pathName === 'index.html') {
        // Serve the main HTML file for root or index route
        fs.readFile('./index.html', (err, data) => {
            if (err) {
                // If error reading file, send a 500 error response
                res.writeHead(500);
                res.end('Error loading the page');
            } else {
                // Send HTML content with appropriate content type
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (pathName === '/convert') {
        // Handle conversion request to get converted amount
        const { amount, from, to } = parsedUrl.query; // Extract query parameters
        try {
            const exchangeRate = await getExchangeRate(from, to); // Get exchange rate
            const convertedAmount = (amount * exchangeRate).toFixed(2); // Calculate converted amount
            // Send JSON response with the converted amount
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ converted: convertedAmount }));
        } catch (error) {
            // If error during API call, send a 500 error response
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error fetching conversion rate' }));
        }
    } else {
        // Send a 404 response if route is not found
        res.writeHead(404);
        res.end('Page not found');
    }
});

// Server port
const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
