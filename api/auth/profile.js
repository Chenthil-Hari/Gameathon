import connectDB from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ error: 'Not authenticated.' });

    await connectDB();

    try {
        const { displayName, photoURL } = req.body;
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (displayName !== undefined) user.displayName = displayName;
        if (photoURL !== undefined) user.photoURL = photoURL;
        await user.save();

        res.json({ user: user.toSafeObject() });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile.' });
    }
}
