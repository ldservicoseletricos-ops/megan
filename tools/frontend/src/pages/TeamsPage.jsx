export default function TeamsPage() {
  const teams = [
    ["CTO Brain", 92],
    ["Backend Brain", 88],
    ["Frontend Brain", 84],
    ["Growth Brain", 61],
    ["Finance Brain", 58],
    ["Research Brain", 72],
  ];
  return (
    <div className="page-grid">
      <section className="card">
        <h2>Equipes e cérebros</h2>
        <div className="stack-list">
          {teams.map(([name, score]) => (
            <article key={name} className="list-card">
              <strong>{name}</strong>
              <p>Prontidão atual {score}%</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
