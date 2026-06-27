import React, { useState, useEffect } from 'react';
import weeklyLogo from '../../../icons/weekly_logo.png';
import monthlyLogo from '../../../icons/monthly_logo.png';
import yearlyLogo from '../../../icons/yearly_logo.png';
import { apiGet } from '../../shared/utils/api';

export const AccountUsage: React.FC = () => {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [paymentLinks, setPaymentLinks] = useState<{
    INR?: { weekly: string; monthly: string; yearly: string };
  } | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const links = await apiGet<{ INR: { weekly: string; monthly: string; yearly: string } }>('/api/billing/payment-links');
        setPaymentLinks(links);
      } catch (err) {
        console.error('[AccountUsage] Failed to fetch billing links:', err);
      }
    };
    fetchLinks();
  }, []);

  const handleCheckout = (planKey: 'weekly' | 'monthly' | 'yearly') => {
    if (currency === 'INR') {
      const link = paymentLinks?.INR?.[planKey] || {
        weekly: 'https://rzp.io/rzp/si5BDcU',
        monthly: 'https://rzp.io/rzp/C52K7XQ',
        yearly: 'https://rzp.io/rzp/r2MqQg4I',
      }[planKey];
      
      window.open(link, '_blank');
    } else {
      alert('US Dollar payments are currently under maintenance. Please switch to the Indian Market (₹) plan or contact us at keshoraai@gmail.com for assistance.');
    }
  };

  const prices = {
    USD: {
      weekly: { price: '$3.99', sub: '(Just 57¢ / day)', name: 'Weekly' },
      monthly: { price: '$9.99', sub: '(Just 33¢ / day)', name: 'Monthly ⭐' },
      yearly: { price: '$79.99', sub: '(Just 21¢ / day)', name: 'Yearly 💎' }
    },
    INR: {
      weekly: { price: '₹149', sub: '(Just ₹21 / day)', name: 'Weekly' },
      monthly: { price: '₹399', sub: '(Just ₹13 / day)', name: 'Monthly ⭐' },
      yearly: { price: '₹2,999', sub: '(Just ₹8 / day)', name: 'Yearly 💎' }
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Account & Usage</h1>
        <a href="mailto:keshoraai@gmail.com" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: '8px 16px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px'
        }}>
          <span style={{ color: '#f87171' }}>❓</span>
          <div>
            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>For help or to report a bug</div>
            <div style={{ fontSize: '11px' }}>Email keshoraai@gmail.com</div>
          </div>
        </a>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-main)' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Daily Free Limit</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>0 / 5</span>
        </div>
        <div style={{ background: 'var(--icon-bg)', height: '8px', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary)', width: '0%', height: '100%' }} />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Free tier: 5 rewrites/day. Resets daily at midnight.
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text-main)' }}>Rewrite text anywhere without limits.</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>Batch rewrite all your content. Sync to the cloud. No restrictions.</p>
        
        <div style={{ marginTop: '16px' }}>
          <span style={{
            background: 'var(--primary-bg)', color: 'var(--primary)',
            padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(124, 110, 248, 0.3)'
          }}>
            🎁 Early Adopter Offer: Next price increase at 500 Premium users. Lock in this rate for life!
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex', background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '4px', gap: '4px'
        }}>
          <button 
            onClick={() => setCurrency('USD')}
            style={{
              background: currency === 'USD' ? 'var(--primary)' : 'transparent',
              color: currency === 'USD' ? 'white' : 'var(--text-muted)',
              border: 'none', borderRadius: '16px', padding: '8px 20px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease', outline: 'none'
            }}
          >
            🇺🇸 US Market ($)
          </button>
          <button 
            onClick={() => setCurrency('INR')}
            style={{
              background: currency === 'INR' ? 'var(--primary)' : 'transparent',
              color: currency === 'INR' ? 'white' : 'var(--text-muted)',
              border: 'none', borderRadius: '16px', padding: '8px 20px',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s ease', outline: 'none'
            }}
          >
            🇮🇳 Indian Market (₹)
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '48px' }}>
        <PricingCard 
          title={prices[currency].weekly.name}
          price={prices[currency].weekly.price}
          period={currency === 'USD' ? '/ week' : '/ week'}
          subtitle={prices[currency].weekly.sub}
          label="Good for occasional use"
          iconUrl={weeklyLogo}
          features={[
            '140 Rewrites per week',
            'Unlock Bulk Rewrite',
            'Premium Settings Access',
            'GDrive, Dropbox Sync',
            'Premium Themes',
            'Smart Folder Organization',
            'Ad-free Experience'
          ]}
          btnText={prices[currency].weekly.name}
          btnColor="#9b8afb"
          onSelect={() => handleCheckout('weekly')}
        />
        
        <PricingCard 
          title={prices[currency].monthly.name}
          price={prices[currency].monthly.price}
          period={currency === 'USD' ? '/ month' : '/ month'}
          subtitle={prices[currency].monthly.sub}
          label="Most users choose this plan"
          iconUrl={monthlyLogo}
          badge="MOST POPULAR"
          isHighlighted={true}
          features={[
            '600 Rewrites per month',
            'Unlock Bulk Rewrite',
            'Premium Settings Access',
            'GDrive, Dropbox Sync',
            'Premium Themes',
            'Smart Folder Organization',
            'Ad-free Experience'
          ]}
          btnText={prices[currency].monthly.name}
          btnColor="#0ea5e9"
          onSelect={() => handleCheckout('monthly')}
        />

        <PricingCard 
          title={prices[currency].yearly.name}
          price={prices[currency].yearly.price}
          period={currency === 'USD' ? '/ year' : '/ year'}
          subtitle={prices[currency].yearly.sub}
          label="Best value for power users"
          iconUrl={yearlyLogo}
          badge="BEST VALUE - 2 MONTHS FREE"
          badgeColor="#ef4444"
          features={[
            '9,000 Rewrites per year',
            'Unlock Bulk Rewrite',
            '50% off other extensions',
            'Premium Settings Access',
            'Priority Email Support',
            'GDrive, Dropbox Sync',
            'Premium Themes',
            'Smart Folder Organization'
          ]}
          btnText={prices[currency].yearly.name}
          btnColor="#f97316"
          onSelect={() => handleCheckout('yearly')}
        />
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
          <span style={{ color: '#eab308' }}>⭐</span> 5.0 Rating • 🔒 Secure Payments • ✔️ Cancel anytime
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '32px' }}>
          Are you a student or researcher who can't afford a subscription? Please email keshoraai@gmail.com
        </div>

        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>Already have a license key?</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Enter license key..." 
              style={{
                flex: 1, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '10px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none'
              }}
            />
            <button style={{
              background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px',
              padding: '10px 24px', fontWeight: 600, cursor: 'pointer'
            }}>
              Activate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  subtitle: string;
  label: string;
  features: string[];
  btnText: string;
  btnColor: string;
  iconUrl: string;
  badge?: string;
  badgeColor?: string;
  isHighlighted?: boolean;
  onSelect?: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, price, period, subtitle, label, features, btnText, btnColor, iconUrl, badge, badgeColor, isHighlighted, onSelect
}) => {
  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-card)',
      borderRadius: '16px',
      padding: '24px',
      position: 'relative',
      border: isHighlighted ? '2px solid #0ea5e9' : '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: '-12px', right: isHighlighted ? '50%' : '-10px',
          transform: isHighlighted ? 'translateX(50%)' : 'none',
          background: badgeColor || '#0ea5e9', color: 'white',
          padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
          textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          {badge}
        </div>
      )}
      
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '12px',
          borderRadius: '16px',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '16px',
          border: '1px solid var(--border)',
          width: '72px',
          height: '72px',
          boxSizing: 'border-box',
          backdropFilter: 'blur(8px)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
        }}>
          <img src={iconUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h3 style={{ fontSize: '18px', margin: '0 0 12px 0', color: 'var(--text-main)' }}>{title}</h3>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: btnColor }}>{price}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{period}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{subtitle}</div>
        <div style={{ color: isHighlighted ? '#0ea5e9' : '#9b8afb', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>{label}</div>
      </div>

      <div style={{ flex: 1 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', fontSize: '13px' }}>
            <span style={{ color: btnColor }}>✓</span>
            <span style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>

      <button 
        onClick={onSelect}
        style={{
          marginTop: '24px', width: '100%', padding: '12px', borderRadius: '8px',
          border: 'none', background: btnColor, color: 'white', fontWeight: 600, cursor: 'pointer'
        }}
      >
        {btnText}
      </button>
    </div>
  );
};
