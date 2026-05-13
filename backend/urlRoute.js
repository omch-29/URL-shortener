import express from "express";
import {nanoid} from "nanoid";
import Url from "./URL.js";

const router = express.Router();

function normalizeurl(url){
    if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}

router.post('/shorten', async(req,res) => {
    let {originalUrl, customCode} = req.body;
    if (!originalUrl) {
    return res.status(400).json({ error: "originalUrl is required" });
  }
  originalUrl = normalizeUrl(originalUrl.trim());
  try {
    new URL(originalUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }
  try {
    
    const existing = await Url.findOne({ originalUrl });
    if (existing && !customCode) {
      return res.json({
        shortCode: existing.shortCode,
        shortUrl: `${process.env.BASE_URL}/${existing.shortCode}`,
        originalUrl: existing.originalUrl,
        clicks: existing.clicks,
        createdAt: existing.createdAt,
      });
    }
    let shortCode = customCode ? customCode.trim() : nanoid(7);
    if (customCode && !/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
      return res
        .status(400)
        .json({ error: "Custom code can only contain letters, numbers, hyphens, and underscores" });
    }
    if (customCode) {
      const taken = await Url.findOne({ shortCode });
      if (taken) {
        return res.status(409).json({ error: "This custom code is already taken" });
      }
    }
    const url = new Url({ originalUrl, shortCode });
    await url.save();
 
    return res.status(201).json({
      shortCode,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      originalUrl,
      clicks: 0,
      createdAt: url.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stats/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });
    if (!url) return res.status(404).json({ error: "Short URL not found" });
 
    res.json({
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      lastAccessed: url.lastAccessed,
      createdAt: url.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
 
// GET /api/urls — get all shortened URLs (paginated)
router.get("/urls", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
 
    const [urls, total] = await Promise.all([
      Url.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Url.countDocuments(),
    ]);
 
    res.json({
      urls: urls.map((u) => ({
        shortCode: u.shortCode,
        shortUrl: `${process.env.BASE_URL}/${u.shortCode}`,
        originalUrl: u.originalUrl,
        clicks: u.clicks,
        lastAccessed: u.lastAccessed,
        createdAt: u.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/urls/:code", async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ shortCode: req.params.code });
    if (!url) return res.status(404).json({ error: "Short URL not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
 
export default router;