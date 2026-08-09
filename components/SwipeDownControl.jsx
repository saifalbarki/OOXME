export default function SwipeDownControl({ label, className = '' }) {
  return (
    <span className={`swipe-down-control ${className}`.trim()}>
      <span className="swipe-down-label">{label}</span>
      <i className="swipe-down-line" aria-hidden="true" />
    </span>
  );
}
