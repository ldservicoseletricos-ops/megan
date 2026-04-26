export default function SectionCard({
  title,
  subtitle = '',
  children,
  fullWidth = false,
  actions = null,
}) {
  return (
    <section className={`section-card ${fullWidth ? 'full-width' : ''}`}>
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="section-actions">{actions}</div> : null}
      </div>
      <div>{children}</div>
    </section>
  );
}
