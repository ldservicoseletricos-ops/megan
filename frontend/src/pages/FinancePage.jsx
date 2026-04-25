export default function FinancePage() {
  return (
    <div className="page-grid">
      <section className="card">
        <h2>Financeiro</h2>
        <div className="stats-grid one-col">
          <section className="list-card"><strong>MRR potencial</strong><p>R$ 9.800</p></section>
          <section className="list-card"><strong>Trials ativos</strong><p>12</p></section>
          <section className="list-card"><strong>Checkout readiness</strong><p>Stripe ready</p></section>
        </div>
      </section>
    </div>
  );
}
