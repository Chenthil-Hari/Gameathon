import connectDB from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ error: 'Not authenticated.' });

    await connectDB();

    try {
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: user.toSafeObject() });
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({ error: 'Failed to get user info.' });
    }
}
