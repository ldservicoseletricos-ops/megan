export default function LiveStatusBar({ items = [] }) {
  return (
    <div className="status-pills">
      {items.map((item) => (
        <div key={item.label} className="status-pill">
          <strong>{item.label}</strong> {item.value}
        </div>
      ))}
    </div>
  );
}
