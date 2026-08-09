const { connectDB } = require('../lib/db');
const Project = require('../models/Project');
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

    // ── GET: List all projects (public) ──
    if (req.method === 'GET') {
        try {
            const { id } = req.query;

            if (id) {
                const project = await Project.findById(id).lean();
                if (!project) {
                    return res.status(404).json({ error: 'Project not found.' });
                }
                return res.status(200).json({ success: true, data: project });
            }

            const projects = await Project.find({ featured: true })
                .sort({ order: 1, createdAt: -1 })
                .lean();
            return res.status(200).json({ success: true, data: projects });
        } catch (error) {
            console.error('Projects GET error:', error);
            return res.status(500).json({ error: 'Failed to fetch projects.' });
        }
    }

    // ── POST: Create a new project (admin only) ──
    if (req.method === 'POST') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { title, description, imageUrl, tags, projectUrl, order, featured } = req.body;

            if (!title || !description) {
                return res.status(400).json({ error: 'Title and description are required.' });
            }

            const project = await Project.create({
                title,
                description,
                imageUrl: imageUrl || '',
                tags: tags || [],
                projectUrl: projectUrl || '#',
                order: order || 0,
                featured: featured !== undefined ? featured : true
            });

            return res.status(201).json({ success: true, data: project });
        } catch (error) {
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(e => e.message);
                return res.status(400).json({ error: messages.join(', ') });
            }
            console.error('Projects POST error:', error);
            return res.status(500).json({ error: 'Failed to create project.' });
        }
    }

    // ── PUT: Update a project (admin only) ──
    if (req.method === 'PUT') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { id } = req.query;
            if (!id) {
                return res.status(400).json({ error: 'Project ID is required.' });
            }

            const updated = await Project.findByIdAndUpdate(id, req.body, {
                new: true,
                runValidators: true
            });

            if (!updated) {
                return res.status(404).json({ error: 'Project not found.' });
            }

            return res.status(200).json({ success: true, data: updated });
        } catch (error) {
            console.error('Projects PUT error:', error);
            return res.status(500).json({ error: 'Failed to update project.' });
        }
    }

    // ── DELETE: Delete a project (admin only) ──
    if (req.method === 'DELETE') {
        const auth = verifyAuth(req, res);
        if (!auth) return;

        try {
            const { id } = req.query;
            if (!id) {
                return res.status(400).json({ error: 'Project ID is required.' });
            }

            await Project.findByIdAndDelete(id);
            return res.status(200).json({ success: true, message: 'Project deleted.' });
        } catch (error) {
            console.error('Projects DELETE error:', error);
            return res.status(500).json({ error: 'Failed to delete project.' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed.' });
};
