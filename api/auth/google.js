import { OAuth2Client } from 'google-auth-library';
import connectDB from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { generateToken } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    await connectDB();

    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: 'Google credential is required.' });

        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { sub: googleId, email, name, picture } = ticket.getPayload();

        let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

        if (user) {
            if (!user.googleId) user.googleId = googleId;
            if (!user.photoURL && picture) user.photoURL = picture;
            if (!user.displayName && name) user.displayName = name;
            user.provider = 'google';
            await user.save();
        } else {
            user = new User({
                email: email.toLowerCase(), displayName: name || email.split('@')[0],
                photoURL: picture || null, provider: 'google', googleId
            });
            await user.save();
        }

        res.json({ token: generateToken(user), user: user.toSafeObject() });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(401).json({ error: 'Google authentication failed.' });
    }
}
