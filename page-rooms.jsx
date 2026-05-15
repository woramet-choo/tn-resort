// === page-rooms.jsx ===

function RoomsPage({ role }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [filterBldg, setFilterBldg] = React.useState("all");
  const [filterStatus, setFilterStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [activeRoom, setActiveRoom] = React.useState(null);
  const [showCheckIn, setShowCheckIn] = React.useState(false);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [receiptStay, setReceiptStay] = React.useState(null);

  // Filtered rooms
  const filtered = state.rooms.filter(r => {
    if (filterBldg !== "all" && r.building !== filterBldg) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (search && !r.id.toLowerCase().includes(search.toLowerCase()) && !r.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Building counts
  const buildings = [
    { id: "all",   labelKey: "filter_all" },
    { id: "green", labelKey: "bldg_green" },
    { id: "twin",  labelKey: "bldg_twin" },
    { id: "loft",  labelKey: "bldg_loft" },
  ];
  const statuses = ["all","available","occupied","dirty","cleaning","broken"];

  const activeStay = activeRoom ? state.stays.find(s => s.roomId === activeRoom.id && s.status === "active") : null;

  return (
    <>
      <div className="building-tabs mb-2">
        {buildings.map(b => {
          const count = b.id === "all" ? state.rooms.length : state.rooms.filter(r => r.building === b.id).length;
          const occ = b.id === "all"
            ? state.rooms.filter(r => r.status === "occupied").length
            : state.rooms.filter(r => r.building === b.id && r.status === "occupied").length;
          return (
            <button key={b.id} className={"building-tab" + (filterBldg === b.id ? " active" : "")} onClick={() => setFilterBldg(b.id)}>
              <div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase" }}>
                  {b.id === "all" ? (lang==="th"?"ทั้งหมด":"All") : t(b.labelKey)}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                  <div className="count">{occ}/{count}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{lang==="th"?"มีคนพัก":"occupied"}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ padding: "12px 14px", marginBottom: 14 }}>
        <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
          <div className="row" style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Icon name="search" size={15} />
            <input
              className="input"
              style={{ border: 0, padding: "4px 0", background: "transparent" }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang==="th"?"ค้นหาห้อง...":"Search room..."}
            />
          </div>
          <div className="seg">
            {statuses.map(s => (
              <button key={s} className={filterStatus === s ? "active" : ""} onClick={() => setFilterStatus(s)}>
                {s === "all" ? t("filter_all") : t("st_" + s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rooms-grid">
        {filtered.map(r => <RoomCard key={r.id} room={r} stays={state.stays} onClick={() => setActiveRoom(r)} />)}
        {filtered.length === 0 ? <div className="empty" style={{ gridColumn: "1/-1" }}>{lang === "th" ? "ไม่พบห้องตามตัวกรอง" : "No rooms match filters"}</div> : null}
      </div>

      {/* Legend */}
      <div className="row mt-3" style={{ gap: 16, fontSize: 13, color: "var(--ink-2)", flexWrap: "wrap" }}>
        {["available","occupied","dirty","cleaning","broken"].map(s => (
          <div key={s} className="row" style={{ gap: 8 }}>
            <span className="dot" style={{ background: "var(--st-"+s+")", width: 12, height: 12, display: "inline-block", borderRadius: "50%", flexShrink: 0 }}></span>
            <span style={{ fontWeight: 500 }}>{t("st_" + s)}</span>
          </div>
        ))}
      </div>

      {/* Room detail modal */}
      <RoomDetailModal
        room={activeRoom}
        stay={activeStay}
        onClose={() => setActiveRoom(null)}
        onCheckIn={() => { setShowCheckIn(true); }}
        onCheckOut={(s) => { setReceiptStay(s); setShowReceipt(true); }}
      />

      <CheckInModal
        room={activeRoom}
        open={showCheckIn}
        onClose={() => setShowCheckIn(false)}
        onDone={() => { setShowCheckIn(false); setActiveRoom(null); toast(lang==="th"?"เช็คอินสำเร็จ":"Checked in"); }}
      />

      <ReceiptModal
        open={showReceipt}
        stay={receiptStay}
        onClose={() => { setShowReceipt(false); setReceiptStay(null); setActiveRoom(null); }}
      />
    </>
  );
}

function RoomCard({ room, stays, onClick }) {
  const { t } = useI18n();
  const active = stays.find(s => s.roomId === room.id && s.status === "active");
  const cheapest = room.configs.reduce((a,b) => a.price < b.price ? a : b);
  return (
    <div className={"room-card st-" + room.status} style={{ "--c": "var(--st-"+room.status+")" }} onClick={onClick}>
      {room.note ? <span className="note-dot" title={room.note}></span> : null}
      <div className="room-card-inner">
        <div className="building">{t(BUILDING_LABELS[room.building])}</div>
        <div className="num">{room.label}</div>
        <div className="meta">
          <span className="mono">฿{cheapest.price}</span>
          <span className="muted">{t("per_night")}</span>
        </div>
        <span className="status-label">{t("st_" + room.status)}</span>
        {active ? (
          <div className="guest" title={active.guestName}>
            <Icon name="user" size={10} /> {active.guestName}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RoomDetailModal({ room, stay, onClose, onCheckIn, onCheckOut }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [noteEdit, setNoteEdit] = React.useState(false);
  const [noteText, setNoteText] = React.useState("");
  const [maintModal, setMaintModal] = React.useState(false);
  const [maintIssue, setMaintIssue] = React.useState("");
  const [cancelModal, setCancelModal] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [extendModal, setExtendModal] = React.useState(false);
  const [extendQty, setExtendQty] = React.useState(1);

  React.useEffect(() => {
    if (room) setNoteText(room.note || "");
  }, [room]);

  if (!room) return null;

  const repairs = state.maintenance.filter(m => m.roomId === room.id);
  const pastStays = state.stays.filter(s => s.roomId === room.id && s.status === "completed").slice(-3);

  const setStatus = (st) => {
    actions.setRoomStatus(room.id, st);
    toast((lang==="th"?"อัปเดตสถานะเป็น ":"Status set to ") + t("st_"+st));
  };

  const statusActions = [
    { id: "available", label: t("st_available"), icon: "check" },
    { id: "dirty",     label: t("st_dirty"),     icon: "bell" },
    { id: "cleaning",  label: t("st_cleaning"),  icon: "sparkle" },
  ];

  return (
    <Modal
      open={!!room}
      onClose={onClose}
      size="lg"
      title={
        <div className="row" style={{ gap: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)" }}>
              {t(BUILDING_LABELS[room.building])} · {room.configs.length > 1 ? (lang==="th"?"หลายรูปแบบ":"Multi config") : t(TYPE_LABELS[room.configs[0].type])}
            </div>
            <div>{lang==="th"?"ห้อง ":"Room "}{room.label}</div>
          </div>
          <StatusChip status={room.status} />
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Left column */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
            {lang==="th"?"อัตราค่าห้อง":"Rates"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {room.configs.map(c => (
              <div key={c.type} className="row" style={{ justifyContent: "space-between", padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
                <span>{t(TYPE_LABELS[c.type])}</span>
                <span className="mono"><b>฿{c.price}</b>{t("per_night")}</span>
              </div>
            ))}
            <div className="row" style={{ justifyContent: "space-between", padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
              <span>{t("rate_monthly")}</span>
              <span className="mono"><b>฿{room.monthlyRate}</b>{t("per_month")}</span>
            </div>
            <div className="row" style={{ justifyContent: "space-between", padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
              <span>{t("rate_temp")}</span>
              <span className="mono"><b>฿{room.hourlyRate}</b>{t("per_3hr")}</span>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: ".08em", textTransform: "uppercase", margin: "18px 0 8px" }}>
            {t("r_room_note")}
          </div>
          {noteEdit ? (
            <>
              <textarea className="textarea" rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} />
              <div className="row mt-1" style={{ gap: 6 }}>
                <button className="btn btn-sm btn-primary" onClick={() => { actions.setRoomNote(room.id, noteText); setNoteEdit(false); toast(lang==="th"?"บันทึกหมายเหตุแล้ว":"Note saved"); }}>{t("save")}</button>
                <button className="btn btn-sm btn-ghost" onClick={() => { setNoteText(room.note || ""); setNoteEdit(false); }}>{t("cancel")}</button>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: 12, background: "var(--surface-2)", border: "1px dashed var(--line-strong)", cursor: "pointer", minHeight: 60 }} onClick={() => setNoteEdit(true)}>
              {room.note
                ? <div style={{ fontSize: 13, color: "var(--ink-2)", whiteSpace: "pre-wrap" }}>{room.note}</div>
                : <div className="muted" style={{ fontSize: 12.5 }}>{lang==="th"?"ยังไม่มีหมายเหตุ — คลิกเพื่อเพิ่ม":"No notes — click to add"}</div>
              }
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          {stay ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
                {lang==="th"?"แขกปัจจุบัน":"Current guest"}
              </div>
              <div className="card" style={{ padding: 14, marginBottom: 12 }}>
                <div className="row" style={{ gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: "var(--brand-soft)", display: "grid", placeItems: "center", color: "var(--brand-dark)" }}>
                    <Icon name="user" size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{stay.guestName}</div>
                    <div className="muted text-xs">{stay.phone}</div>
                  </div>
                </div>
                <div className="grid-2 text-sm" style={{ gap: 8 }}>
                  <div>
                    <div className="muted text-xs">{t("check_in_date")}</div>
                    <div>{fmtDate(stay.checkIn, lang)}</div>
                  </div>
                  <div>
                    <div className="muted text-xs">{t("check_out_date")}</div>
                    <div>{fmtDate(stay.checkOut, lang)}</div>
                  </div>
                  <div>
                    <div className="muted text-xs">{t("type")}</div>
                    <div>{t("rate_" + (stay.type === "nightly" ? "nightly" : stay.type === "monthly" ? "monthly" : "temp"))}</div>
                  </div>
                  <div>
                    <div className="muted text-xs">{t("amount")}</div>
                    <div className="mono"><b>{fmtBaht(stay.amount)}</b> · {lang==="th"?"จ่ายแล้ว ":"paid "}{fmtBaht(stay.paid)}</div>
                  </div>
                </div>
                <div className="row mt-2" style={{ gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => onCheckOut(stay)}>
                    <Icon name="check" size={14} /> {t("check_out")}
                  </button>
                  <button className="btn btn-sm" style={{ background: "var(--brand-softer)", borderColor: "var(--brand-soft)", color: "var(--brand-dark)" }} onClick={() => { setExtendQty(1); setExtendModal(true); }}>
                    <Icon name="plus" size={14} /> {t("extend_stay")}
                  </button>
                  {stay.paid < stay.amount ? (
                    <button className="btn btn-sm" onClick={() => {
                      const remain = stay.amount - stay.paid;
                      const amt = prompt(lang==="th"?"จำนวนเงินที่รับชำระ":"Payment amount", String(remain));
                      const n = Number(amt);
                      if (n > 0) { actions.addPayment(stay.id, n); toast(lang==="th"?"บันทึกการชำระแล้ว":"Payment recorded"); }
                    }}>
                      <Icon name="money" size={14} /> {lang==="th"?"รับชำระเพิ่ม":"Add payment"}
                    </button>
                  ) : null}
                  <button className="btn btn-sm" style={{ color: "var(--st-occupied)", borderColor: "color-mix(in oklab, var(--st-occupied) 30%, var(--line-strong))", marginLeft: "auto" }} onClick={() => { setCancelReason(""); setCancelModal(true); }}>
                    <Icon name="x" size={14} /> {t("cancel_stay")}
                  </button>
                </div>
              </div>
            </>
          ) : room.status === "available" ? (
            <div className="card" style={{ padding: 18, textAlign: "center", marginBottom: 12, background: "var(--brand-softer)", border: "1px solid var(--brand-soft)" }}>
              <Icon name="user" size={28} />
              <div style={{ fontWeight: 600, marginTop: 6, marginBottom: 4 }}>{lang==="th"?"ห้องนี้พร้อมรับแขก":"Ready to host"}</div>
              <div className="muted text-sm mb-2">{lang==="th"?"กดปุ่มด้านล่างเพื่อเช็คอินแขกใหม่":"Click below to check in a new guest"}</div>
              <button className="btn btn-primary btn-block" onClick={onCheckIn}>
                <Icon name="plus" size={14} /> {t("r_book_in")}
              </button>
            </div>
          ) : null}

          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
            {t("r_change_status")}
          </div>
          <div className="status-actions">
            {statusActions.map(s => (
              <button
                key={s.id}
                className={"status-action" + (room.status === s.id ? " active" : "")}
                onClick={() => setStatus(s.id)}>
                <Icon name={s.icon} size={13} />
                {s.label}
              </button>
            ))}
          </div>
          <button className="btn btn-sm mt-1" style={{ width: "100%", color: "var(--st-broken)", borderColor: "var(--line)" }}
            onClick={() => setMaintModal(true)}>
            <Icon name="wrench" size={13} /> {t("r_set_broken")}
          </button>

          {repairs.length > 0 ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: ".08em", textTransform: "uppercase", margin: "18px 0 8px" }}>
                {t("r_repair_log")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {repairs.map(m => (
                  <div key={m.id} className="row" style={{ padding: "6px 10px", background: "var(--surface-2)", borderRadius: 6, fontSize: 12 }}>
                    <span style={{ flex: 1 }}>{m.issue}</span>
                    <span className="muted text-xs">{fmtDate(m.date, lang)}</span>
                    <span className={"chip chip-status st-" + (m.status === "resolved" ? "available" : m.status === "inprogress" ? "cleaning" : "broken")} style={{ fontSize: 10, padding: "2px 7px" }}>
                      <span className="dot"></span>{t("m_" + m.status)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Cancel stay modal */}
      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title={t("cancel_stay") + (stay ? " · " + stay.guestName : "")}
        footer={
          <>
            <button className="btn" onClick={() => setCancelModal(false)}>{t("cancel")}</button>
            <button className="btn btn-danger" onClick={() => {
              if (!stay) return;
              actions.cancelStay(stay.id, cancelReason.trim());
              setCancelModal(false);
              setCancelReason("");
              onClose();
              toast(lang==="th"?"ยกเลิกการเข้าพักแล้ว":"Stay cancelled");
            }}>
              <Icon name="x" size={14} /> {t("confirm")}
            </button>
          </>
        }
      >
        <div className="text-sm muted mb-2">
          {lang==="th"
            ? "ห้องจะถูกตั้งกลับเป็นสถานะ 'ว่าง' และระบบจะบันทึกการยกเลิกพร้อมเหตุผลและวันเวลาในประวัติแขก"
            : "Room will be set back to 'Available' and this cancellation will be logged with reason and timestamp in the guest history."}
        </div>
        <div className="field">
          <label className="field-label">{t("cancel_reason")} *</label>
          <textarea className="textarea" rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)}
            placeholder={lang==="th"?"เช่น แขกเปลี่ยนใจ บันทึกผิด ห้องไม่พร้อม...":"e.g. Guest cancelled, wrong entry, room not ready..."}
            autoFocus />
        </div>
        <div className="field-hint mt-1">
          {t("cancel_at")}: {new Date().toLocaleString(lang==="th"?"th-TH":"en-GB")}
        </div>
      </Modal>

      {/* Extend stay modal */}
      {stay ? (() => {
        const unit = stay.type === "monthly" ? t("months") : stay.type === "temp" ? t("hours") : t("nights");
        let extraAmount, newCheckOut;
        if (stay.type === "monthly") {
          extraAmount = stay.rate * extendQty;
          newCheckOut = addDays(stay.checkOut, extendQty * 30);
        } else if (stay.type === "temp") {
          extraAmount = stay.rate * Math.ceil(extendQty / 3);
          newCheckOut = stay.checkOut;
        } else {
          extraAmount = stay.rate * extendQty;
          newCheckOut = addDays(stay.checkOut, extendQty);
        }
        const overlap = stay.type !== "temp" ? hasDateConflict(state, stay.roomId, stay.checkOut, newCheckOut, stay.id) : null;
        return (
          <Modal
            open={extendModal}
            onClose={() => setExtendModal(false)}
            title={t("extend_stay") + " · " + stay.guestName}
            footer={
              <>
                <button className="btn" onClick={() => setExtendModal(false)}>{t("cancel")}</button>
                <button className="btn btn-primary" disabled={!!overlap || extendQty < 1} style={{ opacity: overlap ? .5 : 1 }} onClick={() => {
                  actions.extendStay(stay.id, extendQty);
                  setExtendModal(false);
                  toast(lang==="th"?"เพิ่มวันพักแล้ว":"Stay extended");
                }}>
                  <Icon name="check" size={14} /> {t("confirm")} · +{fmtBaht(extraAmount)}
                </button>
              </>
            }>
            <div className="text-sm muted mb-2">
              {lang==="th"?"ห้อง ":"Room "}<b>{room.label}</b> · {t("rate_" + (stay.type === "nightly" ? "nightly" : stay.type === "monthly" ? "monthly" : "temp"))} · ฿{stay.rate}{stay.type === "monthly" ? t("per_month") : stay.type === "temp" ? t("per_3hr") : t("per_night")}
            </div>
            <div className="grid-2 mb-2">
              <div className="field">
                <label className="field-label">{t("extend_by")} ({unit})</label>
                <input type="number" min={1} className="input" value={extendQty} onChange={(e) => setExtendQty(Math.max(1, Number(e.target.value)||1))} autoFocus />
              </div>
              <div className="field">
                <label className="field-label">{t("new_checkout")}</label>
                <div className="input" style={{ background: "var(--surface-2)" }}>
                  {stay.type === "temp" ? (lang==="th"?"คงวันเดิม":"Same day") : fmtDate(newCheckOut, lang)}
                </div>
              </div>
            </div>
            {overlap ? (
              <div style={{ padding: "10px 14px", background: "color-mix(in oklab, var(--st-occupied) 10%, white)", border: "1.5px solid color-mix(in oklab, var(--st-occupied) 40%, white)", borderRadius: 8, fontSize: 12.5, color: "var(--st-occupied)", marginBottom: 10 }}>
                <b>{lang==="th"?"ไม่สามารถเพิ่มวันได้":"Cannot extend"}</b>
                <div style={{ marginTop: 3, color: "var(--ink-2)" }}>
                  {lang==="th"?"มีการจองทับซ้อนหลังวันที่ออกปัจจุบัน":"There's a conflicting booking after current checkout"}
                </div>
              </div>
            ) : null}
            <div className="card" style={{ padding: 14, background: "var(--brand-softer)", border: "1px solid var(--brand-soft)" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="muted text-xs" style={{ textTransform: "uppercase", letterSpacing: ".12em" }}>{t("extra_amount")}</div>
                  <div style={{ fontSize: 13.5, marginTop: 2 }}>
                    {extendQty} × ฿{stay.rate}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="num-big" style={{ color: "var(--brand-dark)" }}>+{fmtBaht(extraAmount)}</div>
                  <div className="muted text-xs">{lang==="th"?"ยอดใหม่ ":"New total "}{fmtBaht(stay.amount + extraAmount)}</div>
                </div>
              </div>
            </div>
          </Modal>
        );
      })() : null}

      {/* Maintenance report modal */}
      <Modal
        open={maintModal}
        onClose={() => setMaintModal(false)}
        title={t("m_new_report") + " · " + room.label}
        footer={
          <>
            <button className="btn" onClick={() => setMaintModal(false)}>{t("cancel")}</button>
            <button className="btn btn-danger" onClick={() => {
              if (!maintIssue.trim()) return;
              actions.addMaintenance({ roomId: room.id, issue: maintIssue, reportedBy: lang==="th"?"พนักงาน":"Staff", makeBroken: true });
              setMaintIssue(""); setMaintModal(false);
              toast(lang==="th"?"แจ้งซ่อมเรียบร้อย":"Repair reported");
            }}>
              <Icon name="wrench" size={14} /> {t("confirm")}
            </button>
          </>
        }
      >
        <div className="field">
          <label className="field-label">{t("m_issue")}</label>
          <textarea className="textarea" rows={3} value={maintIssue} onChange={e => setMaintIssue(e.target.value)}
            placeholder={lang==="th"?"เช่น แอร์ไม่เย็น ก๊อกน้ำหยด...":"e.g. AC not cold, leaking faucet..."}></textarea>
          <div className="field-hint">{lang==="th"?"ห้องจะถูกเปลี่ยนสถานะเป็น 'ชำรุด' อัตโนมัติ":"Room will be marked as broken automatically"}</div>
        </div>
      </Modal>
    </Modal>
  );
}

function CheckInModal({ room, open, onClose, onDone }) {
  const { t, lang } = useI18n();
  const { actions, state: appState } = useStore();
  const [form, setForm] = React.useState({
    guestName: "", phone: "", idCard: "",
    type: "nightly", bedType: "single",
    quantity: 1, pax: 1, paid: 0, note: "",
  });

  React.useEffect(() => {
    if (room && open) {
      setForm(prev => ({ ...prev, bedType: room.configs[0].type, quantity: 1 }));
    }
  }, [room, open]);

  if (!room || !open) return null;

  // Compute rate and amount
  const bedConfig = room.configs.find(c => c.type === form.bedType) || room.configs[0];
  let rate, amount, unit;
  if (form.type === "nightly") {
    rate = bedConfig.price;
    amount = rate * form.quantity;
    unit = t("nights");
  } else if (form.type === "monthly") {
    rate = room.monthlyRate;
    amount = rate * form.quantity;
    unit = t("months");
  } else {
    rate = room.hourlyRate;
    amount = rate * Math.ceil(form.quantity / 3);
    unit = t("hours");
  }

  const checkIn = today();
  let checkOut;
  if (form.type === "nightly") checkOut = addDays(checkIn, form.quantity);
  else if (form.type === "monthly") checkOut = addDays(checkIn, form.quantity * 30);
  else checkOut = checkIn;

  // Live conflict check
  const conflict = (form.type !== "temp") ? hasDateConflict(appState, room.id, checkIn, checkOut) : null;

  const submit = () => {
    if (!form.guestName.trim()) { alert(lang==="th"?"กรุณาใส่ชื่อแขก":"Enter guest name"); return; }
    if (conflict) { alert(lang==="th"?"ห้องนี้มีการจองทับซ้อนในช่วงวันที่ดังกล่าว กรุณาตรวจสอบก่อน":"Room has a conflicting booking in this period"); return; }
    actions.checkIn({
      roomId: room.id,
      guestName: form.guestName.trim(),
      phone: form.phone.trim() || "—",
      idCard: form.idCard.trim() || "—",
      type: form.type,
      bedType: form.bedType,
      rate, quantity: form.quantity, pax: form.pax,
      amount,
      paid: Number(form.paid) || 0,
      checkIn, checkOut,
      note: form.note,
    });
    setForm({ guestName: "", phone: "", idCard: "", type: "nightly", bedType: "single", quantity: 1, pax: 1, paid: 0, note: "" });
    onDone();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t("check_in") + " · " + (lang==="th"?"ห้อง ":"Room ") + room.label}
      footer={
        <>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" disabled={!!conflict} style={{ opacity: conflict ? .5 : 1 }} onClick={submit}>
            <Icon name="check" size={14} /> {t("confirm")} · {fmtBaht(amount)}
          </button>
        </>
      }
    >
      {/* Conflict warning */}
      {conflict ? (
        <div style={{ padding: "10px 14px", background: "color-mix(in oklab, var(--st-occupied) 10%, white)", border: "1.5px solid color-mix(in oklab, var(--st-occupied) 40%, white)", borderRadius: 8, fontSize: 12.5, color: "var(--st-occupied)", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 14 }}>
          <Icon name="bell" size={15} />
          <div>
            <b>{lang==="th" ? "ไม่สามารถเช็คอินได้ — มีการจองทับซ้อน" : "Conflict — room already booked"}</b>
            <div style={{ marginTop: 3, color: "var(--ink-2)" }}>
              {lang==="th" ? "ห้องนี้มี" : "Room has a "}<b>{conflict.kind === "stay" ? (lang==="th"?"แขกเช็คอินอยู่":"guest currently checked in") : (lang==="th"?"การจองที่ทับซ้อน":"conflicting booking")}</b>
              {lang==="th" ? " โดย " : " by "}<b>{conflict.item.guestName}</b>
              {" ("}{fmtDate(conflict.item.checkIn, lang)} → {fmtDate(conflict.item.checkOut, lang)}{")"}
            </div>
          </div>
        </div>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="field">
          <label className="field-label">{t("guest_name")} *</label>
          <input className="input" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})}
            placeholder={lang==="th"?"ชื่อ-นามสกุล":"Full name"} autoFocus />
        </div>
        <div className="field">
          <label className="field-label">{t("phone")}</label>
          <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
            placeholder="081-234-5678" />
        </div>
        <div className="field">
          <label className="field-label">{t("id_card")}</label>
          <input className="input" value={form.idCard} onChange={e => setForm({...form, idCard: e.target.value})}
            placeholder="1-2345-67890-12-3" />
        </div>
        <div className="field">
          <label className="field-label">{t("pax")}</label>
          <input type="number" min={1} max={bedConfig.type === "extra" ? 3 : (bedConfig.type === "double" ? 2 : 2)} className="input" value={form.pax} onChange={e => setForm({...form, pax: Number(e.target.value)||1})} />
        </div>
      </div>

      <div className="divider mb-2"></div>

      {room.configs.length > 1 ? (
        <div className="field mb-2">
          <label className="field-label">{t("r_select_bed_config")}</label>
          <div className="seg" style={{ width: "fit-content" }}>
            {room.configs.map(c => (
              <button key={c.type} className={form.bedType === c.type ? "active" : ""}
                onClick={() => setForm({...form, bedType: c.type})}>
                {t(TYPE_LABELS[c.type])} <span className="mono muted" style={{ marginLeft: 4 }}>฿{c.price}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="field mb-2">
        <label className="field-label">{t("r_select_rate")}</label>
        <div className="seg" style={{ width: "fit-content" }}>
          {[
            { id: "nightly",  label: t("rate_nightly") },
            { id: "monthly",  label: t("rate_monthly") },
            { id: "temp",     label: t("rate_temp") },
          ].map(r => (
            <button key={r.id} className={form.type === r.id ? "active" : ""} onClick={() => setForm({...form, type: r.id, quantity: 1})}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3 mb-2">
        <div className="field">
          <label className="field-label">{unit}</label>
          <input type="number" min={1} className="input" value={form.quantity} onChange={e => setForm({...form, quantity: Math.max(1, Number(e.target.value)||1)})} />
        </div>
        <div className="field">
          <label className="field-label">{t("rate")}</label>
          <div className="input" style={{ display: "flex", alignItems: "center", background: "var(--surface-2)" }}>
            <span className="mono">฿{rate}</span>
            <span className="muted text-xs" style={{ marginLeft: 6 }}>
              {form.type === "nightly" ? t("per_night") : form.type === "monthly" ? t("per_month") : t("per_3hr")}
            </span>
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t("paid")}</label>
          <input type="number" min={0} className="input" value={form.paid} onChange={e => setForm({...form, paid: e.target.value})} placeholder="0" />
        </div>
      </div>

      <div className="card" style={{ padding: 14, background: "var(--brand-softer)", border: "1px solid var(--brand-soft)" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="muted text-xs" style={{ textTransform: "uppercase", letterSpacing: ".12em" }}>{lang==="th"?"สรุปการเข้าพัก":"Stay summary"}</div>
            <div style={{ fontSize: 13.5, marginTop: 2 }}>
              {fmtDate(checkIn, lang)} → {fmtDate(checkOut, lang)}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="num-big" style={{ color: "var(--brand-dark)" }}>{fmtBaht(amount)}</div>
            <div className="muted text-xs">
              {form.quantity} × ฿{rate}
              {(Number(form.paid) > 0) ? ` · ${lang==="th"?"คงเหลือ":"balance"} ${fmtBaht(amount - Number(form.paid))}` : ""}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

window.RoomsPage = RoomsPage;
