import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Shield, User, Crown } from 'lucide-react';
import './Leaderboard.css';

export default function Leaderboard() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const q = query(
                collection(db, 'leaderboard'),
                orderBy('score', 'desc'),
                limit(50)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map((doc, index) => ({
                id: doc.id,
                rank: index + 1,
                ...doc.data()
            }));
            setPlayers(data);
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown size={22} className="rank-icon gold" />;
        if (rank === 2) return <Medal size={22} className="rank-icon silver" />;
        if (rank === 3) return <Medal size={22} className="rank-icon bronze" />;
        return <span className="rank-number">{rank}</span>;
    };

    const getRankClass = (rank) => {
        if (rank === 1) return 'rank-gold';
        if (rank === 2) return 'rank-silver';
        if (rank === 3) return 'rank-bronze';
        return '';
    };

    if (loading) {
        return (
            <div className="leaderboard-page">
                <div className="leaderboard-loading">
                    <Trophy size={48} />
                    <p>Loading rankings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <div className="leaderboard-title">
                    <Trophy size={32} />
                    <div>
                        <h1>Leaderboard</h1>
                        <p>Top cyber defenders ranked by safety score</p>
                    </div>
                </div>
                <button className="btn-outline refresh-btn" onClick={() => { setLoading(true); fetchLeaderboard(); }}>
                    Refresh
                </button>
            </div>

            {players.length > 0 ? (
                <>
                    {/* Top 3 Podium */}
                    <div className="podium">
                        {players.slice(0, 3).map((player) => (
                            <div key={player.id} className={`podium-card ${getRankClass(player.rank)} ${player.id === user?.uid ? 'is-you' : ''}`}>
                                <div className="podium-rank">{getRankIcon(player.rank)}</div>
                                <div className="podium-avatar">
                                    {player.photoURL ? (
                                        <img src={player.photoURL} alt={player.displayName} />
                                    ) : (
                                        <User size={28} />
                                    )}
                                </div>
                                <h3 className="podium-name">{player.displayName}</h3>
                                <div className="podium-score">
                                    <Shield size={16} />
                                    <span>{player.score}/100</span>
                                </div>
                                <div className="podium-stats">
                                    <span>Lvl {player.level}</span>
                                    <span>•</span>
                                    <span>{player.xp} XP</span>
                                </div>
                                {player.id === user?.uid && <div className="you-badge">You</div>}
                            </div>
                        ))}
                    </div>

                    {/* Full Table */}
                    <div className="leaderboard-table-container">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Score</th>
                                    <th>Level</th>
                                    <th>XP</th>
                                    <th>Scenarios</th>
                                    <th>Badges</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player) => (
                                    <tr key={player.id} className={`${getRankClass(player.rank)} ${player.id === user?.uid ? 'is-you' : ''}`}>
                                        <td className="rank-cell">
                                            {getRankIcon(player.rank)}
                                        </td>
                                        <td className="player-cell">
                                            <div className="player-info">
                                                <div className="player-avatar-small">
                                                    {player.photoURL ? (
                                                        <img src={player.photoURL} alt={player.displayName} />
                                                    ) : (
                                                        <User size={16} />
                                                    )}
                                                </div>
                                                <span>{player.displayName}</span>
                                                {player.id === user?.uid && <span className="you-tag">You</span>}
                                            </div>
                                        </td>
                                        <td className="score-cell">{player.score}/100</td>
                                        <td>{player.level}</td>
                                        <td>{player.xp}</td>
                                        <td>{player.scenariosCompleted || 0}</td>
                                        <td>{player.badgesCount || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="leaderboard-empty">
                    <Trophy size={60} />
                    <h3>No rankings yet!</h3>
                    <p>Complete scenarios to appear on the leaderboard.</p>
                </div>
            )}
        </div>
    );
}
