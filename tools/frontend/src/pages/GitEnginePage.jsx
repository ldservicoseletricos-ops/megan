import React from 'react';

export default function GitEnginePage({ dashboard, githubAutonomy }) {
  const git = githubAutonomy?.dashboard || {};
  return (
    <div className="page-grid">
      <section className="split-grid wide-left">
        <section className="module-card">
          <div className="module-header"><h3>Git Evolution Engine</h3><span className="badge">Score {dashboard.gitScore}%</span></div>
          <div className="detail-grid detail-grid-tight">
            <div><span>Repo GitHub</span><strong className="mono wrap"><a href={dashboard.repoLink} target="_blank" rel="noreferrer">{dashboard.repoName}</a></strong></div>
            <div><span>Branch padrão</span><strong>{dashboard.branch}</strong></div>
            <div><span>Git local</span><strong>{dashboard.gitLocalStatus}</strong></div>
            <div><span>Token GitHub</span><strong>{dashboard.tokenStatus}</strong></div>
          </div>
          <div className="action-grid">
            <button className="action-button">Gerar branch supervisionada</button>
            <button className="action-button">Gerar commit supervisionado</button>
            <button className="action-button secondary">Gerar PR supervisionado</button>
          </div>
          <p className="module-text muted">Complete a conexão Git/GitHub antes da execução total.</p>
        </section>
        <section className="module-card">
          <h3>Planos supervisionados</h3>
          <div className="stack-list">
            <div className="stack-item"><strong>Branch</strong><span>{git.branchPlan?.summary || 'Git ainda não está pronto para criar branch automática.'}</span></div>
            <div className="stack-item"><strong>Commit</strong><span>{git.commitPlan?.summary || 'Ainda não gerado.'}</span></div>
            <div className="stack-item"><strong>PR</strong><span>{git.prPlan?.summary || 'Ainda não gerado.'}</span></div>
          </div>
        </section>
      </section>
      <section className="split-grid">
        <section className="module-card"><h3>Fila executiva</h3><p className="module-text">Ações priorizadas para a próxima rodada de evolução.</p></section>
        <section className="module-card"><h3>Aprendizado e ações recentes</h3><div className="split-mini"><div className="stack-item"><strong>Learning log</strong><span>Ação de autonomia executada com score {dashboard.gitScore}.</span></div><div className="stack-item"><strong>Action history</strong><span>Scan concluído com score {dashboard.gitScore}.</span></div></div></section>
      </section>
    </div>
  );
}
