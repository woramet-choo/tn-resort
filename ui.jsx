// === ui.jsx ===
// Shared UI components and icons.

// SVG Icons — single source of truth, minimal stroke style.
const Icon = ({ name, size = 18 }) => {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round", strokeLinejoin: "round",
  };
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
    bed: <><path d="M2 17v-4a3 3 0 0 1 3-3h9v7" /><path d="M2 17h20v3" /><path d="M22 17v-4a3 3 0 0 0-3-3" /><path d="M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" /><circle cx="17" cy="9" r="2.5" /><path d="M22 21v-.5a3.5 3.5 0 0 0-3.5-3.5H17" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    money: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /><path d="M6 9v.01M18 15v.01" /></>,
    wrench: <><path d="M14.7 6.3a4 4 0 0 0-5.4 5.3l-7 7 2.1 2.1 7-7a4 4 0 0 0 5.3-5.4l-2.7 2.7-2.1-2.1z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    edit: <><path d="M16 3l5 5-11 11H5v-5z" /></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
    check: <><path d="M5 12l5 5L20 7" /></>,
    x: <><path d="M6 6l12 12M6 18L18 6" /></>,
    arrowLeft: <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
    arrowRight: <><path d="M5 12h14M12 5l7 7-7 7" /></>,
    chevronDown: <><path d="M6 9l6 6 6-6" /></>,
    chevronRight: <><path d="M9 18l6-6-6-6" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    print: <><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></>,
    receipt: <><path d="M4 3h16v18l-3-2-3 2-3-2-3 2-3-2-1 2zM8 8h8M8 12h8M8 16h5" /></>,
    home: <><path d="M3 11l9-8 9 8M5 10v10h14V10" /></>,
    moon: <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>,
    sparkle: <><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" /></>,
    door: <><path d="M5 22V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v18M3 22h18M14 12h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    notes: <><path d="M4 4h12l4 4v12H4zM16 4v4h4" /></>,
    eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></>,
  };
  return <svg {...props}>{paths[name] || null}</svg>;
};

// Reusable modal
function Modal({ open, onClose, title, children, footer, size = "md" }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={"modal " + (size === "lg" ? "modal-lg" : "")} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ flex: 1 }}>{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

// Status chip
function StatusChip({ status, size }) {
  const { t } = useI18n();
  return (
    <span className={"chip chip-status st-" + status} style={size === "sm" ? { fontSize: 12, padding: "3px 9px" } : null}>
      <span className="dot"></span>{t("st_" + status)}
    </span>
  );
}

// Toast container
function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={"toast " + (t.kind || "")}>{t.msg}</div>
      ))}
    </div>
  );
}

// Empty state
function Empty({ children }) {
  return <div className="empty">{children}</div>;
}

// Building/type helpers
const BUILDING_LABELS = {
  green: "bldg_green",
  twin: "bldg_twin",
  loft: "bldg_loft",
};
const TYPE_LABELS = {
  single: "type_single",
  double: "type_double",
  extra: "type_extra",
};

Object.assign(window, { Icon, Modal, StatusChip, Toasts, Empty, BUILDING_LABELS, TYPE_LABELS });
