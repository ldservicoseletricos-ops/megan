export default function SidebarNav({ title, eyebrow, items, active, onChange, footer }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2>{title}</h2>
          </div>
        </div>

        <div className="sidebar-scroll">
          <nav className="sidebar-nav">
            {items.map((item) => (
              <button
                key={item.key}
                className={`nav-btn ${active === item.key ? "active" : ""}`}
                onClick={() => onChange(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-footer-label">{footer?.label}</div>
            <div className="sidebar-footer-value">{footer?.value}</div>
            <div className="sidebar-footer-note">{footer?.note}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
