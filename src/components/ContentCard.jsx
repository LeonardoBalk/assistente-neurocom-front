import { Lock, Play, FileText, Video } from 'lucide-react';
import './ContentCard.css';

export default function ContentCard({ content, userRole, onUpgrade, onClick }) {
    const roleHierarchy = { free: 0, intermediate: 1, full: 2 };
    const isLocked = roleHierarchy[content.role_min] > roleHierarchy[userRole];

    const getIcon = () => {
        switch (content.format) {
            case 'video':
                return <Video size={24} />;
            case 'article':
                return <FileText size={24} />;
            default:
                return <Play size={24} />;
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            free: { label: 'Gratuito', className: 'badge-free' },
            intermediate: { label: 'Intermediário', className: 'badge-intermediate' },
            full: { label: 'Completo', className: 'badge-full' }
        };
        return badges[role] || badges.free;
    };

    const badge = getRoleBadge(content.role_min);

    return (
        <div className={`content-card ${isLocked ? 'locked' : ''} hover-lift`}>
            {/* Thumbnail */}
            <div className="card-thumbnail">
                {content.metadata?.thumbnail ? (
                    <img src={content.metadata.thumbnail} alt={content.title} />
                ) : (
                    <div className="thumbnail-placeholder">
                        {getIcon()}
                    </div>
                )}

                {isLocked && (
                    <div className="lock-overlay">
                        <Lock size={32} />
                    </div>
                )}

                <div className={`role-badge ${badge.className}`}>
                    {badge.label}
                </div>
            </div>

            {/* Content */}
            <div className="card-content">
                <h3 className="card-title">{content.title}</h3>

                {content.summary && (
                    <p className="card-summary">{content.summary}</p>
                )}

                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                    <div className="card-tags">
                        {content.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="card-footer">
                    {content.topic && (
                        <span className="card-topic">{content.topic}</span>
                    )}

                    {isLocked ? (
                        <button onClick={onUpgrade} className="btn-unlock">
                            <Lock size={16} />
                            <span>Desbloquear</span>
                        </button>
                    ) : (
                        <button onClick={() => onClick(content)} className="btn-access">
                            <span>Acessar</span>
                            <Play size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
