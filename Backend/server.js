import express from "express";
import app from "./app.js";
import connectDb from "./database/connectDb.js";

import config from "./config/config.js";

const PORT = config.PORT;

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () =>
      console.log(`server is running on http://localhost:${PORT}`),
    );
  } catch (error) {
    console.log("Failed to start server ", error.message);
    process.exit(1);
  }
};

startServer();
