// === page-maintenance.jsx ===

function MaintenancePage() {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [statusFilter, setStatusFilter] = React.useState("open"); // open | inprogress | resolved | all
  const [showAdd, setShowAdd] = React.useState(false);

  const list = state.maintenance.filter(m => statusFilter === "all" || m.status === statusFilter);
  list.sort((a, b) => b.date.localeCompare(a.date));

  const counts = {
    all: state.maintenance.length,
    open: state.maintenance.filter(m => m.status === "open").length,
    inprogress: state.maintenance.filter(m => m.status === "inprogress").length,
    resolved: state.maintenance.filter(m => m.status === "resolved").length,
  };

  return (
    <>
      <div className="section-head">
        <div>
          <h2>{t("nav_maintenance")}</h2>
          <div className="sub">
            {counts.open} {t("m_open")} · {counts.inprogress} {t("m_inprogress")} · {counts.resolved} {t("m_resolved")}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={14} /> {t("m_new_report")}
        </button>
      </div>

      <div className="card" style={{ padding: "10px 14px", marginBottom: 14 }}>
        <div className="seg">
          {[
            { id: "all",        labelKey: "filter_all" },
            { id: "open",       labelKey: "m_open" },
            { id: "inprogress", labelKey: "m_inprogress" },
            { id: "resolved",   labelKey: "m_resolved" },
          ].map(f => (
            <button key={f.id} className={statusFilter === f.id ? "active" : ""} onClick={() => setStatusFilter(f.id)}>
              {t(f.labelKey)} <span className="muted mono" style={{ marginLeft: 4 }}>{counts[f.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="card"><Empty>{lang==="th"?"ไม่มีรายการในหมวดนี้":"No items in this category"}</Empty></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {list.map(m => (
            <MaintenanceCard key={m.id} item={m} />
          ))}
        </div>
      )}

      <AddMaintenanceModal open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}

function MaintenanceCard({ item }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const room = state.rooms.find(r => r.id === item.roomId);
  const statusColor = item.status === "resolved" ? "available" : item.status === "inprogress" ? "cleaning" : "broken";

  return (
    <div className="card" style={{ borderLeft: "4px solid var(--st-" + statusColor + ")", paddingLeft: 14 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>
            {room ? t(BUILDING_LABELS[room.building]) : ""}
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 600, marginTop: 2 }}>
            {lang==="th"?"ห้อง ":"Room "}{item.roomId}
          </div>
        </div>
        <span className={"chip chip-status st-" + statusColor}>
          <span className="dot"></span>{t("m_" + item.status)}
        </span>
      </div>

      <div style={{ fontSize: 14, marginBottom: 10, padding: "10px 12px", background: "var(--surface-2)", borderRadius: 8 }}>
        {item.issue}
      </div>

      <div className="grid-2 text-sm" style={{ gap: 6, marginBottom: 12 }}>
        <div>
          <span className="muted">{t("m_reported_by")}: </span><b>{item.reportedBy}</b>
        </div>
        <div>
          <span className="muted">{t("f_date")}: </span>{fmtDate(item.date, lang)}
        </div>
        {item.resolvedDate ? (
          <div>
            <span className="muted">{lang==="th"?"แก้เสร็จ":"Resolved"}: </span>{fmtDate(item.resolvedDate, lang)}
          </div>
        ) : null}
        {item.cost > 0 ? (
          <div>
            <span className="muted">{t("m_cost")}: </span><b className="mono">{fmtBaht(item.cost)}</b>
          </div>
        ) : null}
      </div>
      {item.note ? (
        <div className="text-sm muted" style={{ borderTop: "1px dashed var(--line)", paddingTop: 8, marginBottom: 10 }}>
          {item.note}
        </div>
      ) : null}

      {item.status !== "resolved" ? (
        <div className="row" style={{ gap: 6 }}>
          {item.status === "open" ? (
            <button className="btn btn-sm" onClick={() => { actions.updateMaintenance(item.id, { status: "inprogress" }); toast(lang==="th"?"เริ่มดำเนินการ":"Started"); }}>
              <Icon name="wrench" size={12} /> {lang==="th"?"เริ่มซ่อม":"Start work"}
            </button>
          ) : null}
          <button className="btn btn-sm btn-primary" onClick={() => {
            const cost = prompt(lang==="th"?"ค่าใช้จ่าย (฿)":"Cost (฿)", String(item.cost || 0));
            if (cost === null) return;
            actions.resolveMaintenance(item.id, Number(cost) || 0);
            toast(lang==="th"?"ปิดงานซ่อมแล้ว":"Resolved");
          }}>
            <Icon name="check" size={12} /> {lang==="th"?"เสร็จแล้ว":"Mark resolved"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AddMaintenanceModal({ open, onClose }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [form, setForm] = React.useState({
    roomId: state.rooms[0]?.id || "",
    issue: "",
    reportedBy: "",
    note: "",
    makeBroken: false,
  });

  if (!open) return null;

  return (
    <Modal open={true} onClose={onClose} title={t("m_new_report")}
      footer={
        <>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.issue.trim()) return;
            actions.addMaintenance({
              ...form,
              reportedBy: form.reportedBy || (lang==="th"?"พนักงาน":"Staff"),
            });
            toast(lang==="th"?"แจ้งซ่อมแล้ว":"Report submitted");
            onClose();
            setForm({ roomId: state.rooms[0]?.id || "", issue: "", reportedBy: "", note: "", makeBroken: false });
          }}><Icon name="check" size={14} /> {t("save")}</button>
        </>
      }>
      <div className="grid-2 mb-2">
        <div className="field">
          <label className="field-label">{t("room")} *</label>
          <select className="select" value={form.roomId} onChange={e => setForm({...form, roomId: e.target.value})}>
            {state.rooms.map(r => (
              <option key={r.id} value={r.id}>{r.label} · {t(BUILDING_LABELS[r.building])}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">{t("m_reported_by")}</label>
          <select className="select" value={form.reportedBy} onChange={e => setForm({...form, reportedBy: e.target.value})}>
            <option value="">{lang==="th"?"เลือก...":"Select..."}</option>
            {state.staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
      </div>
      <div className="field mb-2">
        <label className="field-label">{t("m_issue")} *</label>
        <textarea className="textarea" rows={3} value={form.issue} onChange={e => setForm({...form, issue: e.target.value})}
          placeholder={lang==="th"?"อธิบายปัญหา...":"Describe the problem..."} autoFocus></textarea>
      </div>
      <div className="field mb-2">
        <label className="field-label">{t("note")}</label>
        <input className="input" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
      </div>
      <label className="row" style={{ gap: 8, cursor: "pointer", padding: "8px 0" }}>
        <input type="checkbox" checked={form.makeBroken} onChange={e => setForm({...form, makeBroken: e.target.checked})} />
        <span>{lang==="th"?"ทำเครื่องหมายห้องเป็น 'ชำรุด' ทันที (ไม่รับเข้าพักจนกว่าจะซ่อมเสร็จ)":"Mark room as 'broken' immediately (block check-ins until resolved)"}</span>
      </label>
    </Modal>
  );
}

window.MaintenancePage = MaintenancePage;
