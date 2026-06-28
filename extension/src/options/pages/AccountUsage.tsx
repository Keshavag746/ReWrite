import React, { useState, useEffect, useRef } from 'react';
import weeklyLogo from '../../../icons/weekly_logo.png';
import monthlyLogo from '../../../icons/monthly_logo.png';
import yearlyLogo from '../../../icons/yearly_logo.png';
import { apiGet } from '../../shared/utils/api';
import { User, UsageInfo } from '../../shared/types/index';

interface AccountUsageProps {
  user: User | null;
  usage: UsageInfo | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const AccountUsage: React.FC<AccountUsageProps> = ({ user, usage, onLogin, onLogout }) => {
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [paymentLinks, setPaymentLinks] = useState<{
    INR?: { weekly: string; monthly: string; yearly: string };
    USD?: { weekly: string; monthly: string; yearly: string };
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showLoginToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast('Please sign in to the extension first to subscribe.');
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await chrome.storage.local.get('ai_rewrite_jwt');
        if (!result['ai_rewrite_jwt']) return;

        // Fetch billing links
        const links = await apiGet<{ 
          INR: { weekly: string; monthly: string; yearly: string };
          USD: { weekly: string; monthly: string; yearly: string };
        }>('/api/billing/payment-links');
        setPaymentLinks(links);
      } catch (err) {
        console.error('[AccountUsage] Failed to load data:', err);
      }
    };
    loadData();

    // Auto-detect location
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipinfo.io/json');
        if (res.ok) {
          const data = await res.json();
          if (data && data.country === 'IN') {
            setCurrency('INR');
            return;
          } else if (data && data.country) {
            setCurrency('USD');
            return;
          }
        }
      } catch (e) {
        console.warn('[AccountUsage] Geolocation API lookup failed, falling back to timezone check:', e);
      }

      // Timezone fallback
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
        setCurrency('INR');
      } else {
        setCurrency('USD');
      }
    };
    detectLocation();
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
      const link = paymentLinks?.USD?.[planKey] || {
        weekly: 'https://www.paypal.com/ncp/payment/Y4JSUNV5C6QDE',
        monthly: 'https://www.paypal.com/ncp/payment/ZT6QQYLJBGS5Q',
        yearly: 'https://www.paypal.com/ncp/payment/FPW6FAWR46VA6',
      }[planKey];

      window.open(link, '_blank');
    }
  };

  const prices = {
    USD: {
      weekly: { price: '$3.99', sub: chrome.i18n.getMessage('usdWeeklySub'), name: chrome.i18n.getMessage('weeklyPlanName') },
      monthly: { price: '$9.99', sub: chrome.i18n.getMessage('usdMonthlySub'), name: chrome.i18n.getMessage('monthlyPlanName') },
      yearly: { price: '$79.99', sub: chrome.i18n.getMessage('usdYearlySub'), name: chrome.i18n.getMessage('yearlyPlanName') }
    },
    INR: {
      weekly: { price: '₹149', sub: chrome.i18n.getMessage('inrWeeklySub'), name: chrome.i18n.getMessage('weeklyPlanName') },
      monthly: { price: '₹399', sub: chrome.i18n.getMessage('inrMonthlySub'), name: chrome.i18n.getMessage('monthlyPlanName') },
      yearly: { price: '₹2,999', sub: chrome.i18n.getMessage('inrYearlySub'), name: chrome.i18n.getMessage('yearlyPlanName') }
    }
  };

  const getUsageLabel = (): string => {
    if (!user) return chrome.i18n.getMessage('dailyFreeLimit') || 'Daily Free Limit';
    const plan = user.plan || 'free';
    if (plan === 'free') return chrome.i18n.getMessage('dailyFreeLimit') || 'Daily Free Limit';
    if (plan === 'weekly') return 'Weekly Usage';
    if (plan === 'monthly') return 'Monthly Usage';
    if (plan === 'yearly') return 'Yearly Usage';
    return chrome.i18n.getMessage('dailyUsage') || 'Daily Usage';
  };

  const getLimitFallback = (): string => {
    if (!user) return '0 / 5';
    const plan = user.plan || 'free';
    if (plan === 'free') return '0 / 5';
    if (plan === 'weekly') return '0 / 140';
    if (plan === 'monthly') return '0 / 600';
    if (plan === 'yearly') return '0 / 9000';
    return `0 ${chrome.i18n.getMessage('unlimited')}`;
  };

  const showProgressBar = usage ? usage.limit > 0 : (!user || user.plan !== 'pro');

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{chrome.i18n.getMessage('sidebarAccountUsage')}</h1>
        <a href="mailto:keshoraai@gmail.com" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: '8px 16px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px'
        }}>
          <span style={{ color: '#f87171' }}>❓</span>
          <div>
            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{chrome.i18n.getMessage('billingHelp')}</div>
            <div style={{ fontSize: '11px' }}>{chrome.i18n.getMessage('billingEmail')}</div>
          </div>
        </a>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-main)' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>
            {getUsageLabel()}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {usage 
              ? (usage.limit > 0 ? `${usage.count} / ${usage.limit}` : `${usage.count} ${chrome.i18n.getMessage('unlimited')}`)
              : getLimitFallback()
            }
          </span>
        </div>
        {showProgressBar && (
          <div style={{ background: 'var(--icon-bg)', height: '8px', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ 
              background: 'var(--primary)', 
              width: usage && usage.limit > 0 ? `${Math.min(100, (usage.count / usage.limit) * 100)}%` : '0%', 
              height: '100%' 
            }} />
          </div>
        )}
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {usage && usage.limit > 0 && user && user.plan !== 'free'
            ? `${chrome.i18n.getMessage('sidepanelResets')}${new Date(usage.resetAt).toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}`
            : (user && user.plan !== 'free' ? '' : chrome.i18n.getMessage('freeTierDesc'))
          }
        </div>
      </div>

      {user ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '24px', background: 'rgba(124, 110, 248, 0.05)', borderRadius: '12px',
          border: '1px dashed rgba(124, 110, 248, 0.3)', marginTop: '-24px', marginBottom: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: 500 }}>
            Signed in as <strong style={{ color: 'var(--primary)' }}>{user.name}</strong> ({user.email}).
          </div>
          <button 
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)',
              backgroundColor: '#ffffff', color: '#1f2937', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            {/* Google Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '24px', background: 'rgba(124, 110, 248, 0.05)', borderRadius: '12px',
          border: '1px dashed rgba(124, 110, 248, 0.3)', marginTop: '-24px', marginBottom: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '12px', fontWeight: 500 }}>
            Sign in to sync your usage, unlock history, and access pro plans.
          </div>
          <button 
            onClick={onLogin}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border)',
              backgroundColor: '#ffffff', color: '#1f2937', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            {/* Google Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: 'var(--text-main)' }}>{chrome.i18n.getMessage('noLimitsTitle')}</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '15px' }}>{chrome.i18n.getMessage('noLimitsDesc')}</p>
        
        <div style={{ marginTop: '16px' }}>
          <span style={{
            background: 'var(--primary-bg)', color: 'var(--primary)',
            padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(124, 110, 248, 0.3)'
          }}>
            {chrome.i18n.getMessage('earlyAdopterOffer')}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '48px' }}>
        <PricingCard 
          title={prices[currency].weekly.name}
          price={prices[currency].weekly.price}
          period={chrome.i18n.getMessage('pricingPeriodWeek')}
          subtitle={prices[currency].weekly.sub}
          label={chrome.i18n.getMessage('goodForOccasional')}
          iconUrl={weeklyLogo}
          features={[
            chrome.i18n.getMessage('feature_rewrites_weekly'),
            chrome.i18n.getMessage('feature_bulk_rewrite'),
            chrome.i18n.getMessage('feature_settings_access'),
            chrome.i18n.getMessage('feature_cloud_sync'),
            chrome.i18n.getMessage('feature_themes'),
            chrome.i18n.getMessage('feature_folders'),
            chrome.i18n.getMessage('feature_ad_free')
          ]}
          btnText={user ? prices[currency].weekly.name : 'Sign in to Subscribe'}
          btnColor="#9b8afb"
          onSelect={user ? () => handleCheckout('weekly') : showLoginToast}
        />
        
        <PricingCard 
          title={prices[currency].monthly.name}
          price={prices[currency].monthly.price}
          period={chrome.i18n.getMessage('pricingPeriodMonth')}
          subtitle={prices[currency].monthly.sub}
          label={chrome.i18n.getMessage('mostUsersChoose')}
          iconUrl={monthlyLogo}
          badge={chrome.i18n.getMessage('mostPopularBadge')}
          isHighlighted={true}
          features={[
            chrome.i18n.getMessage('feature_rewrites_monthly'),
            chrome.i18n.getMessage('feature_bulk_rewrite'),
            chrome.i18n.getMessage('feature_settings_access'),
            chrome.i18n.getMessage('feature_cloud_sync'),
            chrome.i18n.getMessage('feature_themes'),
            chrome.i18n.getMessage('feature_folders'),
            chrome.i18n.getMessage('feature_ad_free')
          ]}
          btnText={user ? prices[currency].monthly.name : 'Sign in to Subscribe'}
          btnColor="#0ea5e9"
          onSelect={user ? () => handleCheckout('monthly') : showLoginToast}
        />

        <PricingCard 
          title={prices[currency].yearly.name}
          price={prices[currency].yearly.price}
          period={chrome.i18n.getMessage('pricingPeriodYear')}
          subtitle={prices[currency].yearly.sub}
          label={chrome.i18n.getMessage('bestValuePower')}
          iconUrl={yearlyLogo}
          badge={chrome.i18n.getMessage('bestValueBadge')}
          badgeColor="#ef4444"
          features={[
            chrome.i18n.getMessage('feature_rewrites_yearly'),
            chrome.i18n.getMessage('feature_bulk_rewrite'),
            chrome.i18n.getMessage('feature_discount'),
            chrome.i18n.getMessage('feature_settings_access'),
            chrome.i18n.getMessage('feature_priority_support'),
            chrome.i18n.getMessage('feature_cloud_sync'),
            chrome.i18n.getMessage('feature_themes'),
            chrome.i18n.getMessage('feature_folders')
          ]}
          btnText={user ? prices[currency].yearly.name : 'Sign in to Subscribe'}
          btnColor="#f97316"
          onSelect={user ? () => handleCheckout('yearly') : showLoginToast}
        />
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
          {chrome.i18n.getMessage('pricingRating')}
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '32px' }}>
          {chrome.i18n.getMessage('pricingStudent')}
        </div>

        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>{chrome.i18n.getMessage('alreadyLicenseKey')}</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder={chrome.i18n.getMessage('licensePlaceholder')}
              style={{
                flex: 1, background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '10px 16px', color: 'var(--text-main)', fontSize: '14px', outline: 'none'
              }}
            />
            <button style={{
              background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px',
              padding: '10px 24px', fontWeight: 600, cursor: 'pointer'
            }}>
              {chrome.i18n.getMessage('btnActivate')}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2147483647,
          background: '#1A1A1E',
          color: '#F0F0F2',
          border: '1px solid #7C6EF8',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '360px',
          animation: 'aiToastSlideIn 200ms ease forwards',
        }}>
          <style>{`
            @keyframes aiToastSlideIn {
              from { opacity: 0; transform: translateY(12px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <span style={{ fontSize: '18px' }}>🔐</span>
          <div style={{ flexGrow: 1, lineHeight: 1.4 }}>{toast}</div>
          <button 
            onClick={() => setToast(null)}
            style={{
              background: 'none', border: 'none', color: '#8B8B9A',
              cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', padding: 0
            }}
          >×</button>
        </div>
      )}
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
