import express from "express";
// import cors from "cors";
import http from "http";
import { json, urlencoded } from "body-parser";

// import routes from "./router/index";

// Initialize Express application
const app = express();

// Middleware setup
// app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
// app.use(routes);

// Create HTTP server using Express app
const server = http.createServer(app);

// Graceful shutdown handling
process.on("SIGINT", function () {
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
  process.exit(0);
});

// Also support ES module imports
export default server;
