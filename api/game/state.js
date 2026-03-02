import connectDB from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
    const decoded = verifyToken(req);
    if (!decoded) return res.status(401).json({ error: 'Not authenticated.' });

    await connectDB();

    if (req.method === 'GET') {
        try {
            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ error: 'User not found.' });
            res.json({ gameState: user.gameState, settings: user.settings });
        } catch (err) {
            console.error('Load game state error:', err);
            res.status(500).json({ error: 'Failed to load game state.' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { gameState, settings } = req.body;
            const user = await User.findById(decoded.id);
            if (!user) return res.status(404).json({ error: 'User not found.' });

            if (gameState) {
                user.gameState = { ...user.gameState.toObject?.() || user.gameState, ...gameState };
            }
            if (settings) {
                user.settings = { ...user.settings.toObject?.() || user.settings, ...settings };
            }
            await user.save();
            res.json({ gameState: user.gameState, settings: user.settings });
        } catch (err) {
            console.error('Save game state error:', err);
            res.status(500).json({ error: 'Failed to save game state.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
