export default function TitanCard({ title, value, suffix = '', tone = 'neutral', description = '' }) {
  return (
    <article className={`titan-card tone-${tone}`}>
      <p className="titan-label">{title}</p>
      <div className="titan-value-row">
        <strong className="titan-value">{value}</strong>
        {suffix ? <span className="titan-suffix">{suffix}</span> : null}
      </div>
      <p className="titan-description">{description}</p>
    </article>
  );
}
