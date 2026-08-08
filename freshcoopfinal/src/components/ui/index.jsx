import React from 'react';
import { ArrowRight } from 'lucide-react';

export function Button({ children, className = '', type = 'button', variant = 'primary', ...props }) {
  return <button className={`btn btn-${variant} ${className}`} type={type} {...props}>{children}</button>;
}

export function Field({ children, label, required }) {
  return <label className="field"><span>{label}{required ? ' *' : ''}</span>{children}</label>;
}

export function PanelTitle({ icon: Icon, title }) {
  return <div className="panel-title"><Icon size={19} /><strong>{title}</strong></div>;
}

export function PanelToolbar({ action, icon: Icon, title }) {
  return <div className="panel-toolbar"><PanelTitle icon={Icon} title={title} />{action}</div>;
}

export function PageFrame({ children }) {
  return <section className="page-frame">{children}</section>;
}

export function QuickAction({ body, icon: Icon, onClick, title }) {
  return <button className="quick-action" type="button" onClick={onClick}><Icon size={28} /><strong>{title}</strong><span>{body}</span><ArrowRight size={18} /></button>;
}

export function MoneyKpi({ detail, icon: Icon, label, value }) {
  return (
    <article className="money-kpi">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function IconCircle({ icon: Icon }) {
  return <i className="icon-circle"><Icon size={18} /></i>;
}

export function StatCard({ icon: Icon, label, tone = 'green', value }) {
  return <article className={`stat-card stat-${tone}`}><Icon size={22} /><span>{label}</span><strong>{value}</strong></article>;
}

export function NoticeCard({ body, icon: Icon, title }) {
  return <div className="notice-card"><Icon size={24} /><div><strong>{title}</strong><p>{body}</p></div></div>;
}

export function ImageMosaic({ items }) {
  return (
    <section className="image-mosaic" aria-label="Secteurs FresCoop">
      {items.map((item) => (
        <article key={item.title} style={{ backgroundImage: `linear-gradient(180deg, rgba(6,47,39,0.04), rgba(6,47,39,0.82)), url("${item.image}")` }}>
          <strong>{item.title}</strong>
          <span>{item.body}</span>
        </article>
      ))}
    </section>
  );
}

export function EmptyState({ body, icon: Icon, title }) {
  return <div className="empty-state"><Icon size={30} /><strong>{title}</strong><span>{body}</span></div>;
}
