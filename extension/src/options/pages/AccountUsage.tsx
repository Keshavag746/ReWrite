import React from 'react';

export const AccountUsage: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Account & Usage</h1>
        <a href="mailto:support@example.com" style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px',
          padding: '8px 16px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px'
        }}>
          <span style={{ color: '#f87171' }}>❓</span>
          <div>
            <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>For help or to report a bug</div>
            <div style={{ fontSize: '11px' }}>Email support@example.com</div>
          </div>
        </a>
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '24px', marginBottom: '40px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-main)' }}>
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Daily Rewrites</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>0 / 10</span>
        </div>
        <div style={{ background: 'var(--icon-bg)', height: '8px', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary)', width: '5%', height: '100%' }} />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Free tier: 10 rewrites/day. Resets daily at midnight.
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

      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '48px' }}>
        <PricingCard 
          title="Weekly Flexible"
          price="$2.99"
          period="/ week"
          subtitle="(Just 42¢ / day)"
          label="Good for occasional use"
          features={[
            '300 Rewrites per day',
            'Unlock Bulk Rewrite',
            'Premium Settings Access',
            'GDrive, Dropbox Sync',
            'Premium Themes',
            'Smart Folder Organization',
            'Ad-free Experience'
          ]}
          btnText="Weekly Flexible"
          btnColor="#9b8afb"
        />
        
        <PricingCard 
          title="Monthly Pro"
          price="$5.99"
          period="/ month"
          subtitle="(Just 20¢ / day)"
          label="Most users choose this plan"
          badge="MOST POPULAR"
          isHighlighted={true}
          features={[
            '500 Rewrites per day',
            'Unlock Bulk Rewrite',
            'Premium Settings Access',
            'GDrive, Dropbox Sync',
            'Premium Themes',
            'Smart Folder Organization',
            'Ad-free Experience'
          ]}
          btnText="Monthly Pro"
          btnColor="#0ea5e9"
        />

        <PricingCard 
          title="Yearly Ultimate"
          price="$49.99"
          period="/ year"
          subtitle="(Just 13¢ / day)"
          label="Best value for power users"
          badge="BEST VALUE - 2 MONTHS FREE"
          badgeColor="#ef4444"
          features={[
            'Unlimited Daily Rewrites',
            'Unlock Bulk Rewrite',
            '50% off other extensions',
            'Premium Settings Access',
            'Priority Email Support',
            'GDrive, Dropbox Sync',
            'Premium Themes',
            'Smart Folder Organization'
          ]}
          btnText="Yearly Ultimate"
          btnColor="#f97316"
        />
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>
          <span style={{ color: '#eab308' }}>⭐</span> 5.0 Rating • 🔒 Secure Payments • ✔️ Cancel anytime
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '32px' }}>
          Are you a student or researcher who can't afford a subscription? Please email support@example.com
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
  badge?: string;
  badgeColor?: string;
  isHighlighted?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, price, period, subtitle, label, features, btnText, btnColor, badge, badgeColor, isHighlighted 
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
        <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '32px' }}>💬</div>
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

      <button style={{
        marginTop: '24px', width: '100%', padding: '12px', borderRadius: '8px',
        border: 'none', background: btnColor, color: 'white', fontWeight: 600, cursor: 'pointer'
      }}>
        {btnText}
      </button>
    </div>
  );
};
