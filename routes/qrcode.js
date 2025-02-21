// routes/qrcode.js
const express = require('express');
const router = express.Router();
const QRCode = require('../models/qrCode');
const qrcode = require('qrcode');
const crypto = require('crypto');

// Generate QR Code
router.post('/generate', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Generate short ID for the QR code
    const shortId = crypto.randomBytes(4).toString('hex');
    
    // Create QR code document without requiring user
    const qrCode = new QRCode({
      url,
      shortId
    });
    
    // Save to database
    await qrCode.save();
    
    // Generate QR code image
    const qrImage = await qrcode.toDataURL(url);
    
    // Send response
    res.json({
      success: true,
      data: {
        id: qrCode._id,
        shortId,
        qrImage,
        url: qrCode.url
      }
    });
  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating QR code'
    });
  }
});

// Get QR code analytics
router.get('/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    const qrCode = await QRCode.findOne({ shortId });
    
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found'
      });
    }

    const analytics = qrCode.getAnalytics();
    
    res.json({
      success: true,
      data: {
        url: qrCode.url,
        ...analytics,
        createdAt: qrCode.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;