import connectDB from '../_lib/db.js';
import Leaderboard from '../_lib/models/Leaderboard.js';
import { verifyToken } from '../_lib/auth.js';

export default async function handler(req, res) {
    await connectDB();

    if (req.method === 'GET') {
        try {
            const entries = await Leaderboard.find().sort({ score: -1 }).limit(100).lean();
            const ranked = entries.map((entry, i) => ({
                ...entry, id: entry.userId.toString(), rank: i + 1
            }));
            res.json({ players: ranked });
        } catch (err) {
            console.error('Get leaderboard error:', err);
            res.status(500).json({ error: 'Failed to load leaderboard.' });
        }
    } else if (req.method === 'PUT') {
        const decoded = verifyToken(req);
        if (!decoded) return res.status(401).json({ error: 'Not authenticated.' });

        try {
            const { displayName, photoURL, score, level, xp, scenariosCompleted, badgesCount } = req.body;
            await Leaderboard.findOneAndUpdate(
                { userId: decoded.id },
                {
                    userId: decoded.id,
                    displayName: displayName || 'Anonymous',
                    photoURL: photoURL || null,
                    score: score ?? 50, level: level ?? 1, xp: xp ?? 0,
                    scenariosCompleted: scenariosCompleted ?? 0,
                    badgesCount: badgesCount ?? 0,
                    updatedAt: new Date()
                },
                { upsert: true, new: true }
            );
            res.json({ success: true });
        } catch (err) {
            console.error('Upsert leaderboard error:', err);
            res.status(500).json({ error: 'Failed to update leaderboard.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
