import { Link } from 'react-router-dom';
import { BookOpen, Calendar, MessageSquare, CreditCard, TrendingUp, Clock } from 'lucide-react';
import SubscriptionWidget from '../../components/SubscriptionWidget';
import './dashboard.css';

export default function Dashboard() {
    // Mock data - substituir por dados reais do backend
    const user = {
        name: 'Usuário',
        plan: 'free', // free, intermediate, full
        email: 'usuario@email.com'
    };

    const stats = {
        contentsViewed: 12,
        consultationsBooked: 0,
        messagesCount: 0,
        hoursLearned: 8
    };

    const recentActivities = [
        { id: 1, type: 'content', title: 'Introdução à Comunicação Relacional', date: '2 dias atrás' },
        { id: 2, type: 'content', title: 'Fundamentos de PNL', date: '5 dias atrás' }
    ];

    const handleUpgrade = () => {
        window.location.href = '/planos';
    };

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-container">
                    <div>
                        <h1>Olá, {user.name}</h1>
                        <p>Bem-vindo de volta à Neurocom</p>
                    </div>

                    <Link to="/home" className="btn-outline">
                        Voltar ao Início
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="dashboard-container">
                <div className="dashboard-grid">
                    {/* Left Column - Main Actions */}
                    <div className="main-column">
                        {/* Quick Actions */}
                        <section className="section-card">
                            <h2 className="section-title">Acesso Rápido</h2>

                            <div className="actions-grid">
                                <Link to="/conteudos" className="action-card">
                                    <div className="action-icon bg-brand-primary">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h3>Biblioteca</h3>
                                        <p>Explore conteúdos exclusivos</p>
                                    </div>
                                </Link>

                                <Link to="/consultas" className="action-card">
                                    <div className="action-icon bg-brand-secondary">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h3>Consultorias</h3>
                                        <p>Agende com Dr. Sérgio</p>
                                    </div>
                                </Link>

                                <Link to="/mensagens" className="action-card">
                                    <div className="action-icon bg-brand-primary">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h3>Mensagens</h3>
                                        <p>Envie suas dúvidas</p>
                                    </div>
                                </Link>

                                <Link to="/planos" className="action-card">
                                    <div className="action-icon bg-brand-secondary">
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="action-content">
                                        <h3>Planos</h3>
                                        <p>Faça upgrade</p>
                                    </div>
                                </Link>
                            </div>
                        </section>

                        {/* Stats */}
                        <section className="section-card">
                            <h2 className="section-title">Seu Progresso</h2>

                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.contentsViewed}</span>
                                        <span className="stat-label">Conteúdos Vistos</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <Calendar size={20} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.consultationsBooked}</span>
                                        <span className="stat-label">Consultorias</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <MessageSquare size={20} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.messagesCount}</span>
                                        <span className="stat-label">Mensagens</span>
                                    </div>
                                </div>

                                <div className="stat-item">
                                    <div className="stat-icon">
                                        <Clock size={20} />
                                    </div>
                                    <div className="stat-content">
                                        <span className="stat-value">{stats.hoursLearned}h</span>
                                        <span className="stat-label">Horas de Estudo</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Recent Activity */}
                        <section className="section-card">
                            <h2 className="section-title">Atividade Recente</h2>

                            {recentActivities.length > 0 ? (
                                <div className="activity-list">
                                    {recentActivities.map(activity => (
                                        <div key={activity.id} className="activity-item">
                                            <div className="activity-icon">
                                                <BookOpen size={16} />
                                            </div>
                                            <div className="activity-content">
                                                <p className="activity-title">{activity.title}</p>
                                                <span className="activity-date">{activity.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <TrendingUp size={48} />
                                    <p>Nenhuma atividade recente</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="sidebar-column">
                        {/* Subscription Widget */}
                        <SubscriptionWidget
                            userPlan={user.plan}
                            onUpgrade={handleUpgrade}
                        />

                        {/* Quick Links */}
                        <section className="section-card">
                            <h3 className="section-title-sm">Links Úteis</h3>

                            <div className="quick-links">
                                <a href="/sobre" className="quick-link">
                                    Sobre a Neurocom
                                </a>
                                <a href="/chat" className="quick-link">
                                    Chat com IA
                                </a>
                                <a href="https://neurocom.com.br" target="_blank" rel="noopener noreferrer" className="quick-link">
                                    Site Oficial
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
