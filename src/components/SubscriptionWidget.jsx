import { Crown, Check, Sparkles } from 'lucide-react';
import './SubscriptionWidget.css';

export default function SubscriptionWidget({ userPlan, onUpgrade }) {
    const plans = {
        free: {
            name: 'Gratuito',
            icon: <Sparkles size={20} />,
            color: 'gray',
            features: ['Acesso a conteúdos gratuitos', 'Chat com IA (limitado)']
        },
        intermediate: {
            name: 'Intermediário',
            icon: <Check size={20} />,
            color: 'green',
            features: ['Conteúdos intermediários', 'Chat ilimitado', '2 consultorias/mês']
        },
        full: {
            name: 'Completo',
            icon: <Crown size={20} />,
            color: 'blue',
            features: ['Todos os conteúdos', 'Consultorias ilimitadas', 'Suporte prioritário']
        }
    };

    const currentPlan = plans[userPlan] || plans.free;
    const canUpgrade = userPlan !== 'full';

    return (
        <div className={`subscription-widget plan-${currentPlan.color}`}>
            <div className="widget-header">
                <div className="plan-icon">
                    {currentPlan.icon}
                </div>
                <div className="plan-info">
                    <span className="plan-label">Seu Plano</span>
                    <h3 className="plan-name">{currentPlan.name}</h3>
                </div>
            </div>

            <div className="plan-features">
                {currentPlan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                        <Check size={16} className="feature-check" />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>

            {canUpgrade && (
                <button onClick={onUpgrade} className="btn-upgrade">
                    <Crown size={18} />
                    <span>Fazer Upgrade</span>
                </button>
            )}
        </div>
    );
}
