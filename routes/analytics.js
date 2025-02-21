const express = require('express');
const router = express.Router();
const QRCode = require('../models/qrCode');
const geoip = require('geoip-lite');

router.post('/scan/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const geo = geoip.lookup(ip);

    const qrCode = await QRCode.findOne({ shortId });
    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR Code not found'
      });
    }

    qrCode.scans.push({
      timestamp: new Date(),
      deviceType: userAgent,
      ip,
      location: {
        country: geo?.country || 'Unknown',
        city: geo?.city || 'Unknown'
      }
    });

    await qrCode.save();

    res.json({
      success: true,
      data: qrCode.url
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
