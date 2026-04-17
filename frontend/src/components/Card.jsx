import './Card.css';

export default function Card({ title, children, className = '', action, icon }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card__header">
          <div className="card__title-group">
            {icon && <span className="card__icon">{icon}</span>}
            {title && <h3 className="card__title">{title}</h3>}
          </div>
          {action && <div className="card__action">{action}</div>}
        </div>
      )}
      <div className="card__body">
        {children}
      </div>
    </div>
  );
}
