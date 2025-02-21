// models/qrCode.js
const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Changed to false to make it optional
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scans: [{
    timestamp: Date,
    deviceType: String,
    browser: String,
    ip: String,
    location: {
      country: String,
      city: String
    }
  }]
});

qrCodeSchema.methods.getAnalytics = function() {
  return {
    totalScans: this.scans.length,
    deviceTypes: this.scans.reduce((acc, scan) => {
      acc[scan.deviceType] = (acc[scan.deviceType] || 0) + 1;
      return acc;
    }, {}),
    locations: this.scans.reduce((acc, scan) => {
      const location = `${scan.location.country}, ${scan.location.city}`;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {})
  };
};

module.exports = mongoose.model('QRCode', qrCodeSchema);