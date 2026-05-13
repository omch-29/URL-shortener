import { configDotenv } from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import urlRoute from './urlRoute.js';
import Url from './URL.js';


dotenv.config();
const app=express();
const PORT=process.env.PORT || 5000;

const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.use(cors());
app.use(express.json());

app.use('/api', urlRoute);

app.get("/:code", async (req, res) => {
  const { code } = req.params;
 
  try {
    const url = await Url.findOneAndUpdate(
      { shortCode: code },
      { $inc: { clicks: 1 }, $set: { lastAccessed: new Date() } },
      { new: true }
    );
 
    if (!url) {
      return res.status(404).json({ error: "Short URL not found" });
    }
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/urlshortener")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at ${BASE_URL}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

