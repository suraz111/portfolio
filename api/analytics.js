const crypto = require('crypto');
const { connectDB } = require('../lib/db');
const Analytics = require('../models/Analytics');
const { verifyAuth } = require('./middleware/auth');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ── POST: Track a page view (public, called from frontend) ──
    if (req.method === 'POST') {
        try {
            await connectDB();
            let body = req.body;
            if (typeof body === 'string') {
                try { body = JSON.parse(body); } catch (e) { body = {}; }
            }
            body = body || {};

            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            const referrer = body.referrer || 'direct';

            // Create a hash for visitor uniqueness (privacy-friendly, no raw IP stored)
            const visitorHash = crypto
                .createHash('sha256')
                .update(ip + userAgent + today)
                .digest('hex')
                .substring(0, 16);

            // Upsert today's analytics record
            let record = await Analytics.findOne({ date: today });

            if (!record) {
                record = await Analytics.create({
                    date: today,
                    pageViews: 1,
                    uniqueVisitors: 1,
                    visitorHashes: [visitorHash],
                    referrers: [{ source: referrer, count: 1 }]
                });
            } else {
                record.pageViews += 1;

                // Check if this is a unique visitor
                if (!record.visitorHashes.includes(visitorHash)) {
                    record.visitorHashes.push(visitorHash);
                    record.uniqueVisitors += 1;
                }

                // Update referrer count
                const existingRef = record.referrers.find(r => r.source === referrer);
                if (existingRef) {
                    existingRef.count += 1;
                } else {
                    record.referrers.push({ source: referrer, count: 1 });
                }

                await record.save();
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Analytics POST error:', error);
            return res.status(500).json({ error: 'Failed to track analytics.' });
        }
    }

    // ── GET: Fetch analytics data (admin only) ──
    if (req.method === 'GET') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { days } = req.query;
            const limit = parseInt(days) || 30;

            const records = await Analytics.find()
                .sort({ date: -1 })
                .limit(limit)
                .select('-visitorHashes')
                .lean();

            const totals = records.reduce(
                (acc, r) => {
                    acc.totalViews += r.pageViews;
                    acc.totalUnique += r.uniqueVisitors;
                    return acc;
                },
                { totalViews: 0, totalUnique: 0 }
            );

            return res.status(200).json({
                success: true,
                data: records,
                summary: {
                    ...totals,
                    daysTracked: records.length
                }
            });
        } catch (error) {
            console.error('Analytics GET error:', error);
            return res.status(500).json({ error: 'Failed to fetch analytics.' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed.' });
};
