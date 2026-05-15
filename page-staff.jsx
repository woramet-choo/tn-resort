// === page-staff.jsx ===

function StaffPage({ role }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [editing, setEditing] = React.useState(null); // staff id
  const [showAdd, setShowAdd] = React.useState(false);
  const [advanceFor, setAdvanceFor] = React.useState(null); // staff id
  const [calendarFor, setCalendarFor] = React.useState(null); // staff id for per-person view
  const [period, setPeriod] = React.useState("week"); // week | month | custom
  const [customRange, setCustomRange] = React.useState({ from: addDays(today(), -6), to: today() });
  const isManager = role === "manager";

  const { from, to } = getRangeFromPeriod(period, customRange);
  const wagesInfo = getWagesInPeriod(state, from, to);

  // Today attendance per staff
  const todayStr = today();

  const totalPayable = wagesInfo.total;

  return (
    <>
      <div className="section-head">
        <div>
          <h2>{t("nav_staff")}</h2>
          <div className="sub">{state.staff.length} {lang==="th"?"คน":"people"} · {lang==="th"?"กะกลางวัน":"Day"} {state.staff.filter(s => s.shift==="day").length} · {lang==="th"?"กะกลางคืน":"Night"} {state.staff.filter(s => s.shift==="night").length}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Icon name="plus" size={14} /> {lang==="th"?"เพิ่มพนักงาน":"Add staff"}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid-3 mb-3">
        <div className="card" style={{ background: "var(--brand-softer)", border: "1px solid var(--brand-soft)" }}>
          <div className="kpi-label" style={{ color: "var(--brand-dark)" }}>{lang==="th"?"ค่าแรงรอจ่าย":"Payable"} · {labelOfPeriod(period, lang)}</div>
          <div className="num-big" style={{ color: "var(--brand-dark)" }}>{fmtBaht(totalPayable)}</div>
          <div className="muted text-xs">{fmtDate(from, lang)} – {fmtDate(to, lang)}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{lang==="th"?"พนักงานวันนี้":"On duty today"}</div>
          <div className="num-big">
            {state.staff.filter(s => {
              const a = state.attendance[s.id + "_" + todayStr];
              return a && a.status !== "absent" && (a.clockIn || a.clockOut);
            }).length}
          </div>
          <div className="muted text-xs">{lang==="th"?"คนมาทำงาน":"checked in"}</div>
        </div>
        <div className="card">
          <div className="kpi-label">{lang==="th"?"ค่าแรงเฉลี่ย/วัน":"Avg wage/day"}</div>
          <div className="num-big">
            {fmtBaht(Math.round(totalPayable / Math.max(1, diffDays(from, to)+1)))}
          </div>
          <div className="muted text-xs">{lang==="th"?"ในช่วงที่เลือก":"in selected range"}</div>
        </div>
      </div>

      {/* Period picker */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div className="row" style={{ gap: 12 }}>
            <span className="muted text-sm">{t("s_period")}:</span>
            <div className="seg">
              {[
                { id: "week",      label: t("f_period_week") },
                { id: "month",     label: t("f_period_month") },
                { id: "thismonth", label: lang==="th"?"เดือนนี้":"This month" },
                { id: "lastmonth", label: lang==="th"?"เดือนที่แล้ว":"Last month" },
                { id: "custom",    label: t("f_period_custom") },
              ].map(p => (
                <button key={p.id} className={period === p.id ? "active" : ""} onClick={() => setPeriod(p.id)}>{p.label}</button>
              ))}
            </div>
          </div>
          {period === "custom" ? (
            <div className="row" style={{ gap: 6 }}>
              <input type="date" className="input" style={{ width: 150 }} value={customRange.from} onChange={e => setCustomRange({...customRange, from: e.target.value})} />
              <span className="muted">→</span>
              <input type="date" className="input" style={{ width: 150 }} value={customRange.to} onChange={e => setCustomRange({...customRange, to: e.target.value})} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Staff table */}
      <div className="table-wrap mb-3">
        <table className="table">
          <thead>
            <tr>
              <th>{lang==="th"?"พนักงาน":"Staff"}</th>
              <th>{lang==="th"?"กะ":"Shift"}</th>
              <th>{t("s_daily_wage")}</th>
              <th>{t("s_today")}</th>
              <th>{lang==="th"?"เต็มวัน":"Full"}</th>
              <th>{lang==="th"?"ครึ่งวัน":"Half"}</th>
              <th>{lang==="th"?"ไม่มา":"Absent"}</th>
              <th>{t("s_payable")}</th>
              <th>{t("s_balance")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.staff.map(s => {
              const breakdown = wagesInfo.breakdown.find(b => b.id === s.id) || { days: 0, halfDays: 0, absent: 0, payable: 0 };
              const todayAtt = state.attendance[s.id + "_" + todayStr];
              const bal = getStaffBalance(state, s.id);
              return (
                <tr key={s.id}>
                  <td>
                    <div className="row" style={{ gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 999, background: s.shift === "night" ? "#2d3447" : "var(--brand-soft)", color: s.shift === "night" ? "white" : "var(--brand-dark)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13 }}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <b>{s.name}</b>
                        {s.note ? <div className="muted text-xs">{s.note}</div> : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="chip">
                      <Icon name={s.shift === "day" ? "sun" : "moon"} size={11} />
                      {t("s_" + s.shift)}
                    </span>
                  </td>
                  <td className="mono">฿{s.dailyWage}</td>
                  <td><TodayAttendanceCell staffId={s.id} att={todayAtt} /></td>
                  <td className="mono">{breakdown.days}</td>
                  <td className="mono">{breakdown.halfDays}</td>
                  <td className="mono">{breakdown.absent}</td>
                  <td className="mono" style={{ fontWeight: 600 }}>{fmtBaht(breakdown.payable)}</td>
                  <td>
                    <div style={{ minWidth: 90 }}>
                      <div className="mono" style={{ fontWeight: 600, color: bal.balance >= 0 ? "var(--brand-dark)" : "var(--st-occupied)" }}>{fmtBaht(bal.balance)}</div>
                      {bal.advanced > 0 ? (
                        <div className="muted text-xs">{lang==="th"?"เบิกแล้ว ":"Adv. "}{fmtBaht(bal.advanced)}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
                      <button className="btn btn-sm" onClick={() => setAdvanceFor(s.id)} title={t("s_advance")}>
                        <Icon name="money" size={13} /> {t("s_advance_short")}
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => setCalendarFor(s.id)} title={t("s_view_calendar")}>
                        <Icon name="calendar" size={13} />
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => setEditing(s.id)} title={t("edit")}>
                        <Icon name="edit" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Attendance grid */}
      <div className="section-head">
        <div>
          <h2 style={{ fontSize: 19 }}>{t("s_attendance")}</h2>
          <div className="sub">{lang==="th"?"14 วันล่าสุด · คลิกเซลล์เพื่อสลับสถานะ · เปิดปฏิทินรายคนเพื่อแก้ไขละเอียด":"Last 14 days · click to cycle · open per-staff calendar to edit"}</div>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <label className="muted text-sm" style={{ marginRight: 4 }}>{t("s_select_staff")}:</label>
          <select className="select" style={{ width: "auto", minWidth: 180 }} value="" onChange={(e) => { if (e.target.value) setCalendarFor(e.target.value); }}>
            <option value="">{lang==="th"?"— เลือก —":"— Select —"}</option>
            {state.staff.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({t("s_" + s.shift)})</option>
            ))}
          </select>
        </div>
      </div>
      <AttendanceGrid state={state} actions={actions} onOpenStaff={setCalendarFor} />

      <AddStaffModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={(s) => { actions.addStaff(s); setShowAdd(false); toast(lang==="th"?"เพิ่มพนักงานแล้ว":"Staff added"); }} />
      {editing ? <EditStaffModal staff={state.staff.find(s => s.id === editing)} onClose={() => setEditing(null)} /> : null}
      {advanceFor ? <AdvanceModal staffId={advanceFor} onClose={() => setAdvanceFor(null)} /> : null}
      {calendarFor ? <StaffCalendarModal staffId={calendarFor} onClose={() => setCalendarFor(null)} isManager={isManager} /> : null}
    </>
  );
}

// === Salary advance modal ===
function AdvanceModal({ staffId, onClose }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const staff = state.staff.find(s => s.id === staffId);
  const bal = getStaffBalance(state, staffId);
  const [amount, setAmount] = React.useState("");
  const [note, setNote] = React.useState("");
  const [err, setErr] = React.useState("");

  const submit = () => {
    const n = Number(amount);
    if (!n || n <= 0) { setErr(lang==="th"?"กรอกจำนวนเงิน":"Enter amount"); return; }
    if (n > bal.balance) { setErr(t("s_advance_too_much")); return; }
    actions.addAdvance(staffId, n, note.trim());
    toast(lang==="th"?"บันทึกการเบิกแล้ว":"Advance recorded");
    onClose();
  };

  if (!staff) return null;
  return (
    <Modal open={true} onClose={onClose} title={t("s_advance") + " · " + staff.name}
      footer={
        <>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" onClick={submit}>
            <Icon name="check" size={14} /> {t("save")}
          </button>
        </>
      }>
      <div className="grid-3 mb-2">
        <div className="card" style={{ padding: 12, background: "var(--surface-2)" }}>
          <div className="muted text-xs" style={{ textTransform: "uppercase", letterSpacing: ".1em" }}>{t("s_accrued")}</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{fmtBaht(bal.accrued)}</div>
        </div>
        <div className="card" style={{ padding: 12, background: "var(--surface-2)" }}>
          <div className="muted text-xs" style={{ textTransform: "uppercase", letterSpacing: ".1em" }}>{lang==="th"?"เบิกแล้ว":"Advanced"}</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>{fmtBaht(bal.advanced)}</div>
        </div>
        <div className="card" style={{ padding: 12, background: "var(--brand-softer)", border: "1px solid var(--brand-soft)" }}>
          <div className="muted text-xs" style={{ textTransform: "uppercase", letterSpacing: ".1em" }}>{t("s_balance")}</div>
          <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--brand-dark)" }}>{fmtBaht(bal.balance)}</div>
        </div>
      </div>
      <div className="grid-2 mb-2">
        <div className="field">
          <label className="field-label">{t("s_advance_amount")} *</label>
          <input type="number" min={0} className="input" value={amount} onChange={(e) => { setAmount(e.target.value); setErr(""); }} autoFocus placeholder="0" />
        </div>
        <div className="field">
          <label className="field-label">{t("note")}</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder={lang==="th"?"เช่น เบิกฉุกเฉิน":"e.g. emergency"} />
        </div>
      </div>
      {err ? <div style={{ color: "var(--st-occupied)", fontSize: 12.5, marginBottom: 10 }}>{err}</div> : null}

      {bal.advances.length > 0 ? (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", letterSpacing: ".08em", textTransform: "uppercase", marginTop: 10, marginBottom: 6 }}>
            {t("s_advance_history")} ({lang==="th"?"เดือนนี้":"this month"})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {bal.advances.sort((a,b) => (b.date||"").localeCompare(a.date||"")).map(a => (
              <div key={a.id} className="row" style={{ padding: "8px 10px", background: "var(--surface-2)", borderRadius: 6, justifyContent: "space-between" }}>
                <div>
                  <div className="text-sm">{fmtDate(a.date, lang)}</div>
                  {a.note ? <div className="muted text-xs">{a.note}</div> : null}
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <span className="mono" style={{ fontWeight: 600 }}>{fmtBaht(a.amount)}</span>
                  <button className="btn btn-sm btn-ghost" onClick={() => {
                    if (confirm(lang==="th"?"ลบรายการเบิกนี้?":"Delete this advance?")) {
                      actions.removeAdvance(a.id);
                      toast(lang==="th"?"ลบแล้ว":"Deleted");
                    }
                  }} title={t("delete")}>
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </Modal>
  );
}

// === Per-staff attendance calendar modal ===
function StaffCalendarModal({ staffId, onClose, isManager }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const staff = state.staff.find(s => s.id === staffId);
  const [viewMonth, setViewMonth] = React.useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [editing, setEditing] = React.useState(null); // { date, current }

  if (!staff) return null;

  // Build calendar grid for viewMonth
  const first = new Date(viewMonth.y, viewMonth.m, 1);
  const last = new Date(viewMonth.y, viewMonth.m + 1, 0);
  const startDow = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = first.toLocaleDateString(lang==="th"?"th-TH":"en-GB", { month: "long", year: "numeric" });

  const todayStr = today();

  const changeMonth = (delta) => {
    let { y, m } = viewMonth;
    m += delta;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth({ y, m });
  };

  return (
    <>
      <Modal open={true} onClose={onClose} size="lg" title={t("s_calendar_for") + " " + staff.name}>
        {/* Header */}
        <div className="row mb-2" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-sm" onClick={() => changeMonth(-1)}><Icon name="arrowLeft" size={14} /></button>
            <div style={{ minWidth: 160, textAlign: "center", fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 600 }}>{monthLabel}</div>
            <button className="btn btn-sm" onClick={() => changeMonth(1)}><Icon name="arrowRight" size={14} /></button>
          </div>
          {!isManager ? (
            <div className="chip">{t("s_manager_only")} · {lang==="th"?"อ่านอย่างเดียว":"read-only"}</div>
          ) : null}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 14 }}>
          {[0,1,2,3,4,5,6].map(i => {
            const wd = new Date(2024, 0, i).toLocaleDateString(lang==="th"?"th-TH":"en-GB", { weekday: "short" });
            return (
              <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: ".08em", textTransform: "uppercase", padding: "4px 0" }}>
                {wd.slice(0,3)}
              </div>
            );
          })}
          {cells.map((d, i) => {
            if (!d) return <div key={"e"+i}></div>;
            const date = ymd(new Date(viewMonth.y, viewMonth.m, d));
            const att = state.attendance[staffId + "_" + date];
            const isToday = date === todayStr;
            const isFuture = date > todayStr;
            let color, mark, bg;
            if (!att) { color = "var(--muted)"; mark = "—"; bg = "transparent"; }
            else if (att.status === "full") { color = "var(--st-available)"; mark = "●"; bg = "color-mix(in oklab, var(--st-available) 8%, white)"; }
            else if (att.status === "half") { color = "var(--st-dirty)"; mark = "◐"; bg = "color-mix(in oklab, var(--st-dirty) 8%, white)"; }
            else { color = "var(--st-broken)"; mark = "✕"; bg = "color-mix(in oklab, var(--st-broken) 8%, white)"; }
            return (
              <div
                key={date}
                onClick={() => { if (isManager && !isFuture) setEditing({ date, current: att }); }}
                style={{
                  padding: "6px 4px",
                  border: "1px solid " + (isToday ? "var(--brand)" : "var(--line)"),
                  borderRadius: 8,
                  background: bg,
                  cursor: (isManager && !isFuture) ? "pointer" : "default",
                  opacity: isFuture ? .35 : 1,
                  minHeight: 64,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
                  position: "relative",
                }}
                title={att ? (t("s_"+att.status) + (att.clockIn ? ` · ${att.clockIn}-${att.clockOut||"…"}` : "") + (att.editNote ? ` · ${att.editNote}` : "")) : ""}
              >
                <div style={{ fontWeight: isToday ? 700 : 500, fontSize: 12, color: isToday ? "var(--brand-dark)" : "var(--ink)" }}>{d}</div>
                <div style={{ fontSize: 24, color, fontWeight: 700, lineHeight: 1 }}>{mark}</div>
                {att && att.clockIn ? (
                  <div className="mono" style={{ fontSize: 9, color: "var(--ink-2)" }}>{att.clockIn}{att.clockOut ? "-"+att.clockOut : ""}</div>
                ) : <div style={{ height: 11 }}></div>}
                {att && att.editNote ? (
                  <div style={{ position: "absolute", top: 3, right: 3, width: 6, height: 6, borderRadius: 999, background: "var(--accent)" }} title={att.editNote}></div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="row" style={{ gap: 16, fontSize: 13, color: "var(--ink-2)", flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid var(--line)" }}>
          <div className="row" style={{ gap: 7, alignItems: "center" }}><span style={{ color: "var(--st-available)", fontSize: 20, lineHeight: 1 }}>●</span> <span style={{ fontWeight: 500 }}>{t("s_full_day")}</span></div>
          <div className="row" style={{ gap: 7, alignItems: "center" }}><span style={{ color: "var(--st-dirty)", fontSize: 20, lineHeight: 1 }}>◐</span> <span style={{ fontWeight: 500 }}>{t("s_half_day")}</span></div>
          <div className="row" style={{ gap: 7, alignItems: "center" }}><span style={{ color: "var(--st-broken)", fontSize: 20, lineHeight: 1 }}>✕</span> <span style={{ fontWeight: 500 }}>{t("s_absent")}</span></div>
          <div className="row" style={{ gap: 7, alignItems: "center" }}><span style={{ color: "var(--accent)", fontSize: 20, lineHeight: 1 }}>●</span> <span style={{ fontWeight: 500 }}>{lang==="th"?"มีการแก้ไข":"Edited"}</span></div>
          {isManager ? <span className="muted">· {lang==="th"?"คลิกวันที่เพื่อแก้ไข":"Click date to edit"}</span> : null}
        </div>
      </Modal>

      {editing ? (
        <EditAttendanceModal
          staffId={staffId}
          date={editing.date}
          current={editing.current}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}

function EditAttendanceModal({ staffId, date, current, onClose }) {
  const { t, lang } = useI18n();
  const { actions, toast } = useStore();
  const [status, setStatus] = React.useState(current?.status || "full");
  const [clockIn, setClockIn] = React.useState(current?.clockIn || "08:00");
  const [clockOut, setClockOut] = React.useState(current?.clockOut || (status === "half" ? "12:30" : "17:00"));
  const [note, setNote] = React.useState("");
  const [err, setErr] = React.useState("");

  const submit = () => {
    if (!note.trim()) { setErr(t("s_edit_required")); return; }
    const patch = {
      status,
      clockIn: status === "absent" ? null : clockIn,
      clockOut: status === "absent" ? null : clockOut,
      editNote: note.trim(),
      editedAt: new Date().toISOString(),
      editedBy: t("s_edited_by_manager"),
    };
    actions.setAttendance(staffId, date, patch);
    toast(lang==="th"?"บันทึกการแก้ไขแล้ว":"Edit saved");
    onClose();
  };

  return (
    <Modal open={true} onClose={onClose} title={t("edit") + " · " + fmtDate(date, lang)}
      footer={
        <>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" onClick={submit}>
            <Icon name="check" size={14} /> {t("save")}
          </button>
        </>
      }>
      <div className="field mb-2">
        <label className="field-label">{t("status")}</label>
        <div className="seg" style={{ width: "fit-content" }}>
          {[
            { id: "full", label: t("s_full_day") },
            { id: "half", label: t("s_half_day") },
            { id: "absent", label: t("s_absent") },
          ].map(o => (
            <button key={o.id} className={status === o.id ? "active" : ""} onClick={() => setStatus(o.id)}>{o.label}</button>
          ))}
        </div>
      </div>
      {status !== "absent" ? (
        <div className="grid-2 mb-2">
          <div className="field">
            <label className="field-label">{t("s_clock_in")}</label>
            <input type="time" className="input" value={clockIn || ""} onChange={(e) => setClockIn(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{t("s_clock_out")}</label>
            <input type="time" className="input" value={clockOut || ""} onChange={(e) => setClockOut(e.target.value)} />
          </div>
        </div>
      ) : null}
      <div className="field">
        <label className="field-label">{t("s_edit_note")} *</label>
        <textarea className="textarea" rows={2} value={note} onChange={(e) => { setNote(e.target.value); setErr(""); }}
          placeholder={lang==="th"?"เช่น ลืมลงเวลา, แก้ไขตามใบลา ฯลฯ":"e.g. forgot to clock in, leave form, etc."} autoFocus />
        <div className="field-hint">{lang==="th"?"บังคับใส่หมายเหตุเพื่อบันทึกการแก้ไข":"Note is required to record the edit"}</div>
      </div>
      {err ? <div style={{ color: "var(--st-occupied)", fontSize: 12.5, marginTop: 8 }}>{err}</div> : null}
    </Modal>
  );
}

function TodayAttendanceCell({ staffId, att }) {
  const { actions, toast } = useStore();
  const { t, lang } = useI18n();

  const now = () => {
    const d = new Date();
    return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
  };

  if (!att || (!att.clockIn && !att.clockOut)) {
    return (
      <button className="btn btn-sm btn-primary" onClick={() => {
        actions.setAttendance(staffId, today(), { status: "full", clockIn: now(), clockOut: null });
        toast(lang==="th"?"ลงเวลาเข้างานแล้ว":"Clocked in");
      }}>
        <Icon name="clock" size={12} /> {t("s_clock_in")}
      </button>
    );
  }
  if (att.clockIn && !att.clockOut) {
    return (
      <div className="row" style={{ gap: 6 }}>
        <span className="chip chip-status st-available"><span className="dot"></span><span className="mono">{att.clockIn}</span></span>
        <button className="btn btn-sm" onClick={() => {
          // ask half or full
          const half = confirm(lang==="th"?"OK = เต็มวัน, Cancel = ครึ่งวัน":"OK = full day, Cancel = half day");
          actions.setAttendance(staffId, today(), { status: half ? "full" : "half", clockOut: now() });
          toast(lang==="th"?"ลงเวลาออกงานแล้ว":"Clocked out");
        }}>
          <Icon name="clock" size={12} /> {t("s_clock_out")}
        </button>
      </div>
    );
  }
  return (
    <div className="row" style={{ gap: 6 }}>
      <span className="chip chip-status st-available"><span className="dot"></span><span className="mono">{att.clockIn} → {att.clockOut}</span></span>
      <span className="chip" style={{ fontSize: 10.5 }}>{att.status === "half" ? t("s_half_day") : t("s_full_day")}</span>
    </div>
  );
}

function AttendanceGrid({ state, actions, onOpenStaff }) {
  const { t, lang } = useI18n();
  const days = 14;
  const dates = [];
  for (let i = days - 1; i >= 0; i--) dates.push(addDays(today(), -i));

  // 3-way cycle: no-record / absent → full → half → absent → full → …
  const cycle = (current) => {
    if (!current || current.status === "absent")
      return { status: "full", clockIn: "08:00", clockOut: "17:00" };
    if (current.status === "full")
      return { status: "half", clockIn: "08:00", clockOut: "12:30" };
    // half → absent
    return { status: "absent", clockIn: null, clockOut: null };
  };

  return (
    <div className="table-wrap">
      <div style={{ overflowX: "auto" }}>
        <table className="table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 140, position: "sticky", left: 0, background: "var(--surface-2)", zIndex: 2 }}>{lang==="th"?"พนักงาน":"Staff"}</th>
              {dates.map(d => {
                const dt = new Date(d);
                const isToday = d === today();
                return (
                  <th key={d} style={{ textAlign: "center", minWidth: 50 }}>
                    <div className={isToday ? "" : "muted"} style={{ color: isToday ? "var(--brand-dark)" : null, fontWeight: 600 }}>{dt.getDate()}</div>
                    <div className="muted text-xs" style={{ marginTop: 2, fontWeight: 400 }}>
                      {dt.toLocaleDateString(lang==="th"?"th-TH":"en-GB", { weekday: "short" }).slice(0,2)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {state.staff.map(s => (
              <tr key={s.id}>
                <td style={{ position: "sticky", left: 0, background: "var(--surface)", zIndex: 1 }}>
                  <div className="row" style={{ justifyContent: "space-between", gap: 6 }}>
                    <div>
                      <b style={{ fontSize: 13 }}>{s.name}</b>
                      <div className="muted text-xs">{t("s_" + s.shift)}</div>
                    </div>
                    {onOpenStaff ? (
                      <button className="btn btn-sm btn-ghost" onClick={() => onOpenStaff(s.id)} title={t("s_view_calendar")}>
                        <Icon name="calendar" size={13} />
                      </button>
                    ) : null}
                  </div>
                </td>
                {dates.map(d => {
                  const att = state.attendance[s.id + "_" + d];
                  let color, mark;
                  if (!att) { color = "var(--line-strong)"; mark = "·"; }
                  else if (att.status === "full") { color = "var(--st-available)"; mark = "●"; }
                  else if (att.status === "half") { color = "var(--st-dirty)"; mark = "◐"; }
                  else { color = "var(--st-broken)"; mark = "✕"; }
                  return (
                    <td key={d} style={{ textAlign: "center", padding: "6px 4px", cursor: "pointer" }}
                      title={att ? (t("s_"+att.status) + (att.clockIn ? ` · ${att.clockIn}-${att.clockOut||"…"}` : "")) : (lang==="th"?"ไม่มีข้อมูล":"No data")}
                      onClick={() => {
                        actions.setAttendance(s.id, d, cycle(att));
                      }}>
                      <span style={{ fontSize: 20, color, fontWeight: 700, lineHeight: 1 }}>{mark}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="row" style={{ gap: 16, padding: "10px 14px", borderTop: "1px solid var(--line)", background: "var(--surface-2)", fontSize: 13, color: "var(--ink-2)" }}>
        <div className="row" style={{ gap: 7, alignItems: "center" }}><span style={{ color: "var(--st-available)", fontSize: 20, lineHeight: 1 }}>●</span> <span style={{ fontWeight: 500 }}>{t("s_full_day")}</span></div>
        <div className="row" style={{ gap: 7, alignItems: "center" }}><span style={{ color: "var(--st-dirty)", fontSize: 20, lineHeight: 1 }}>◐</span> <span style={{ fontWeight: 500 }}>{t("s_half_day")}</span></div>
        <div className="row" style={{ gap: 7, alignItems: "center" }}><span style={{ color: "var(--st-broken)", fontSize: 20, lineHeight: 1 }}>✕</span> <span style={{ fontWeight: 500 }}>{t("s_absent")}</span></div>
        <span className="muted">· {lang==="th"?"คลิกเพื่อสลับสถานะ":"Click to cycle"}</span>
      </div>
    </div>
  );
}

function EditStaffModal({ staff, onClose }) {
  const { t, lang } = useI18n();
  const { actions, toast } = useStore();
  const [form, setForm] = React.useState(staff);

  return (
    <Modal open={true} onClose={onClose} title={t("edit") + " · " + staff.name}
      footer={
        <>
          <button className="btn btn-danger" style={{ marginRight: "auto" }} onClick={() => {
            if (confirm(lang==="th"?"ลบพนักงานคนนี้?":"Delete this staff?")) {
              actions.removeStaff(staff.id); onClose();
              toast(lang==="th"?"ลบแล้ว":"Removed");
            }
          }}><Icon name="trash" size={14} /> {t("delete")}</button>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" onClick={() => { actions.setStaff(staff.id, form); onClose(); toast(lang==="th"?"บันทึกแล้ว":"Saved"); }}><Icon name="check" size={14} /> {t("save")}</button>
        </>
      }>
      <div className="grid-2">
        <div className="field">
          <label className="field-label">{lang==="th"?"ชื่อ":"Name"}</label>
          <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="field">
          <label className="field-label">{lang==="th"?"กะ":"Shift"}</label>
          <select className="select" value={form.shift} onChange={e => setForm({...form, shift: e.target.value})}>
            <option value="day">{t("s_day")}</option>
            <option value="night">{t("s_night")}</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">{t("s_daily_wage")}</label>
          <input type="number" className="input" value={form.dailyWage} onChange={e => setForm({...form, dailyWage: Number(e.target.value)||0})} />
        </div>
        <div className="field">
          <label className="field-label">{t("note")}</label>
          <input className="input" value={form.note || ""} onChange={e => setForm({...form, note: e.target.value})} />
        </div>
      </div>
    </Modal>
  );
}

function AddStaffModal({ open, onClose, onAdd }) {
  const { t, lang } = useI18n();
  const [form, setForm] = React.useState({ name: "", shift: "day", dailyWage: 400, note: "" });
  if (!open) return null;
  return (
    <Modal open={true} onClose={onClose} title={lang==="th"?"เพิ่มพนักงาน":"Add staff"}
      footer={
        <>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.name.trim()) return;
            onAdd(form);
            setForm({ name: "", shift: "day", dailyWage: 400, note: "" });
          }}><Icon name="plus" size={14} /> {t("add")}</button>
        </>
      }>
      <div className="grid-2">
        <div className="field">
          <label className="field-label">{lang==="th"?"ชื่อ":"Name"} *</label>
          <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} autoFocus />
        </div>
        <div className="field">
          <label className="field-label">{lang==="th"?"กะ":"Shift"}</label>
          <select className="select" value={form.shift} onChange={e => setForm({...form, shift: e.target.value})}>
            <option value="day">{t("s_day")}</option>
            <option value="night">{t("s_night")}</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">{t("s_daily_wage")}</label>
          <input type="number" className="input" value={form.dailyWage} onChange={e => setForm({...form, dailyWage: Number(e.target.value)||0})} />
        </div>
        <div className="field">
          <label className="field-label">{t("note")}</label>
          <input className="input" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
        </div>
      </div>
    </Modal>
  );
}

// Helpers
function getRangeFromPeriod(period, custom) {
  if (period === "today")    return { from: today(), to: today() };
  if (period === "week")     return { from: addDays(today(), -6), to: today() };
  if (period === "month")    return { from: addDays(today(), -29), to: today() };
  if (period === "thismonth") {
    const n = new Date();
    const first = ymd(new Date(n.getFullYear(), n.getMonth(), 1));
    const last  = ymd(new Date(n.getFullYear(), n.getMonth() + 1, 0));
    return { from: first, to: last };
  }
  if (period === "lastmonth") {
    const n = new Date();
    const first = ymd(new Date(n.getFullYear(), n.getMonth() - 1, 1));
    const last  = ymd(new Date(n.getFullYear(), n.getMonth(), 0));
    return { from: first, to: last };
  }
  return { from: custom.from, to: custom.to };
}
function labelOfPeriod(period, lang) {
  if (period === "today")     return lang==="th"?"วันนี้":"Today";
  if (period === "week")      return lang==="th"?"7 วัน":"7 days";
  if (period === "month")     return lang==="th"?"30 วัน":"30 days";
  if (period === "thismonth") {
    return new Date().toLocaleDateString(lang==="th"?"th-TH":"en-GB", { month: "long", year: "numeric" });
  }
  if (period === "lastmonth") {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toLocaleDateString(lang==="th"?"th-TH":"en-GB", { month: "long", year: "numeric" });
  }
  return lang==="th"?"กำหนดเอง":"Custom";
}

Object.assign(window, { StaffPage, getRangeFromPeriod, labelOfPeriod });
