const express = require("express");
const { join } = require("path");
const app = express();

// Serve static assets from the /public folder
app.use(express.static(join(__dirname)));

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

// Serve the index page for all other requests
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// Listen on port 3000
app.listen(8080, () => console.log("Application running on port 8080"));