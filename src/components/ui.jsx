import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function Field({ label, error, hint, children, id, className = '' }) {
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}


export function TextField({ label, error, hint, className, id: givenId, ...props }) {
  const autoId = useId();
  const id = givenId || autoId;
  return (
    <Field label={label} error={error} hint={hint} id={id} className={className}>
      <input
        id={id}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
    </Field>
  );
}

export function PasswordField({ label = 'Password', error, hint, className, ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error} hint={hint} id={id} className={className}>
      <div className="password-wrap">
        <input
          id={id}
          className="input"
          type={show ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <button type="button" className="password-toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </Field>
  );
}

export function SelectField({ label, error, hint, options, placeholder, className, ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id} className={className}>
      <select id={id} className="select" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function TextAreaField({ label, error, hint, className, ...props }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} id={id} className={className}>
      <textarea id={id} className="textarea" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} {...props} />
    </Field>
  );
}

const ALERT_ICON = { error: '!', success: '✓', warning: '!', info: 'i' };

export function Alert({ kind = 'info', children, className = '' }) {
  return (
    <div className={`alert alert-${kind} ${className}`} role={kind === 'error' ? 'alert' : 'status'}>
      <span className="alert-icon" aria-hidden="true">
        {ALERT_ICON[kind]}
      </span>
      <div>{children}</div>
    </div>
  );
}

const STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  active: 'Active',
  suspended: 'Suspended',
  available: 'Available',
  unavailable: 'Out of stock',
  removed: 'Removed',
  sale: 'For Sale',
  donation: 'For Donation',
  verified: 'Verified Student',
  unverified: 'Not verified',
};

export function Badge({ status, children }) {
  return <span className={`badge badge-${status}`}>{children || STATUS_LABEL[status] || status}</span>;
}

export function EmptyState({ icon = '∅', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'Unable to load. Please try again.', onRetry }) {
  return (
    <div className="empty-state" role="alert">
      <div className="empty-icon" aria-hidden="true" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>
        !
      </div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function Modal({ title, children, onClose, wide = false, labelledBy }) {
  const ref = useRef(null);
  const titleId = useId();
  // Keep the latest onClose in a ref so the focus/keyboard effect runs only once
  // (otherwise every re-render, e.g. typing in a field, would move the focus).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.activeElement;
    const el = ref.current;
    const focusable = el?.querySelector('input, textarea, select, button:not([data-close])');
    (focusable || el)?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
      if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll('button, [href], input, select, textarea')].filter((n) => !n.disabled);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (previous && document.contains(previous)) previous.focus?.();
    };
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy || titleId} ref={ref} tabIndex={-1}>
        {title && <h2 id={titleId}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel, children }) {
  return (
    <Modal title={title} onClose={onCancel}>
      {message && <p className="muted">{message}</p>}
      {children}
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} data-close>
          {cancelLabel}
        </button>
        <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="back-link">
      <span aria-hidden="true">←</span> {children}
    </Link>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function InfoList({ rows }) {
  return (
    <dl className="info-list">
      {rows
        .filter((r) => r && r[1] !== undefined && r[1] !== null && r[1] !== '')
        .map(([label, value]) => (
          <div className="info-row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
    </dl>
  );
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}
