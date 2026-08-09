const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        unique: true
    },
    pageViews: {
        type: Number,
        default: 0
    },
    uniqueVisitors: {
        type: Number,
        default: 0
    },
    visitorHashes: [{
        type: String
    }],
    referrers: [{
        source: { type: String, default: 'direct' },
        count: { type: Number, default: 1 }
    }]
});

module.exports = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
