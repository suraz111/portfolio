const { connectDB } = require('../lib/db');
const BlogPost = require('../models/BlogPost');
const { verifyAuth } = require('./middleware/auth');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    await connectDB();

    // ── GET: List blog posts ──
    if (req.method === 'GET') {
        try {
            const { id, slug, all } = req.query;

            // Get single post by ID or slug
            if (id) {
                const post = await BlogPost.findById(id).lean();
                if (!post) return res.status(404).json({ error: 'Post not found.' });
                return res.status(200).json({ success: true, data: post });
            }

            if (slug) {
                const post = await BlogPost.findOne({ slug }).lean();
                if (!post) return res.status(404).json({ error: 'Post not found.' });
                return res.status(200).json({ success: true, data: post });
            }

            // If "all" param present and admin, show all (including drafts)
            if (all) {
                const auth = verifyAuth(req, res);
                if (!auth) return;
                const posts = await BlogPost.find().sort({ createdAt: -1 }).lean();
                return res.status(200).json({ success: true, data: posts });
            }

            // Public: only show published posts
            const posts = await BlogPost.find({ published: true })
                .sort({ createdAt: -1 })
                .select('-content')
                .lean();
            return res.status(200).json({ success: true, data: posts });
        } catch (error) {
            console.error('Blog GET error:', error);
            return res.status(500).json({ error: 'Failed to fetch posts.' });
        }
    }

    // ── POST: Create blog post (admin only) ──
    if (req.method === 'POST') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { title, slug, content, excerpt, published } = req.body;

            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required.' });
            }

            const post = await BlogPost.create({
                title,
                slug: slug || undefined,
                content,
                excerpt: excerpt || content.substring(0, 200) + '...',
                published: published || false
            });

            return res.status(201).json({ success: true, data: post });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ error: 'A post with that slug already exists.' });
            }
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({ error: messages.join(', ') });
            }
            console.error('Blog POST error:', error);
            return res.status(500).json({ error: 'Failed to create post.' });
        }
    }

    // ── PUT: Update blog post (admin only) ──
    if (req.method === 'PUT') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Post ID is required.' });

            const updateData = { ...req.body, updatedAt: Date.now() };
            const updated = await BlogPost.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true
            });

            if (!updated) return res.status(404).json({ error: 'Post not found.' });
            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error('Blog PUT error:', error);
            return res.status(500).json({ error: 'Failed to update post.' });
        }
    }

    // ── DELETE: Delete blog post (admin only) ──
    if (req.method === 'DELETE') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Post ID is required.' });

            await BlogPost.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: 'Post deleted.' });
        } catch (error) {
            console.error('Blog DELETE error:', error);
            return res.status(500).json({ error: 'Failed to delete post.' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed.' });
};
