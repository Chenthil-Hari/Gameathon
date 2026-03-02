import connectDB from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { generateToken } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    await connectDB();

    try {
        const { email, password, displayName } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ error: 'An account with this email already exists.' });

        const user = new User({
            email: email.toLowerCase(), password,
            displayName: displayName || email.split('@')[0], provider: 'email'
        });
        await user.save();
        res.status(201).json({ token: generateToken(user), user: user.toSafeObject() });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed.' });
    }
}
