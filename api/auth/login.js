import connectDB from '../_lib/db.js';
import User from '../_lib/models/User.js';
import { generateToken } from '../_lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    await connectDB();

    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ error: 'Incorrect email or password.' });
        if (user.provider === 'google' && !user.password) {
            return res.status(401).json({ error: 'This account uses Google login. Please sign in with Google.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect email or password.' });

        res.json({ token: generateToken(user), user: user.toSafeObject() });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed.' });
    }
}
