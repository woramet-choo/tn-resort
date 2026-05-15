// === page-bookings.jsx ===

function BookingsPage() {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [view, setView] = React.useState("calendar"); // calendar | list
  const [bldgFilter, setBldgFilter] = React.useState("green");
  const [startDate, setStartDate] = React.useState(today());
  const [days, setDays] = React.useState(14);
  const [showAdd, setShowAdd] = React.useState(false);
  const [editingBooking, setEditingBooking] = React.useState(null);

  const filteredRooms = state.rooms.filter(r => bldgFilter === "all" || r.building === bldgFilter);

  const dateCols = [];
  for (let i = 0; i < days; i++) dateCols.push(addDays(startDate, i));
  const lastDate = dateCols[dateCols.length - 1];
  const todayStr = today();

  // Build bars per room — assign lanes to handle overlapping bookings.
  const BAR_H = 22, BAR_GAP = 3, ROW_PAD = 4;
  const barsByRoom = {};
  const lanesByRoom = {};
  for (const room of filteredRooms) {
    const items = [
      ...state.stays.filter(x => x.roomId === room.id && x.status === "active").map(x => ({ ...x, kind: "occupied" })),
      ...state.bookings.filter(x => x.roomId === room.id && x.status !== "cancelled").map(x => ({ ...x, kind: "reserved" })),
    ];
    const bars = [];
    items.forEach((it) => {
      // Check overlap with current window
      if (it.checkOut <= dateCols[0] || it.checkIn > lastDate) return;
      const startIdx = Math.max(0, dateCols.findIndex(d => d >= it.checkIn));
      let endIdx;
      const findEnd = dateCols.findIndex(d => d >= it.checkOut);
      endIdx = findEnd === -1 ? dateCols.length : findEnd;
      if (startIdx === -1 || endIdx <= startIdx) return;
      bars.push({ ...it, startIdx, endIdx, span: endIdx - startIdx });
    });
    // Greedy lane assignment: sort by start, assign to first lane that's free
    bars.sort((a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx);
    const laneEnds = []; // laneEnds[i] = endIdx of last bar in lane i (exclusive)
    bars.forEach(bar => {
      let lane = laneEnds.findIndex(e => e <= bar.startIdx);
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(bar.endIdx); }
      else { laneEnds[lane] = bar.endIdx; }
      bar.lane = lane;
    });
    barsByRoom[room.id] = bars;
    lanesByRoom[room.id] = Math.max(1, laneEnds.length);
  }

  return (
    <>
      <div className="section-head">
        <div>
          <h2>{t("nav_bookings")}</h2>
          <div className="sub">{lang==="th" ? `${state.bookings.filter(b => b.status==="confirmed").length} การจองยืนยันแล้ว · ${state.bookings.filter(b => b.status==="pending").length} รอยืนยัน` : `${state.bookings.filter(b => b.status==="confirmed").length} confirmed · ${state.bookings.filter(b => b.status==="pending").length} pending`}</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <div className="seg">
            <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}>
              <Icon name="calendar" size={13} /> {lang==="th"?"ปฏิทิน":"Calendar"}
            </button>
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
              {lang==="th"?"รายการ":"List"}
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={14} /> {t("b_new")}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "10px 14px", marginBottom: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div className="seg">
            {[
              { id: "all",   labelKey: "filter_all" },
              { id: "green", labelKey: "bldg_green" },
              { id: "twin",  labelKey: "bldg_twin" },
              { id: "loft",  labelKey: "bldg_loft" },
            ].map(b => (
              <button key={b.id} className={bldgFilter === b.id ? "active" : ""} onClick={() => setBldgFilter(b.id)}>
                {t(b.labelKey)}
              </button>
            ))}
          </div>
          {view === "calendar" ? (
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setStartDate(addDays(startDate, -7))}>
                <Icon name="arrowLeft" size={13} />
              </button>
              <input type="date" className="input" style={{ width: 150 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
              <button className="btn btn-sm btn-ghost" onClick={() => setStartDate(addDays(startDate, 7))}>
                <Icon name="arrowRight" size={13} />
              </button>
              <button className="btn btn-sm" onClick={() => setStartDate(today())}>{lang==="th"?"วันนี้":"Today"}</button>
              <div className="seg">
                {[7, 14, 30].map(n => (
                  <button key={n} className={days === n ? "active" : ""} onClick={() => setDays(n)}>{n}d</button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {view === "calendar" ? (
        <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", background: "var(--surface)" }}>
          <div className="bk-cal" style={{
            "--days": days,
            display: "grid",
            gridTemplateColumns: `220px repeat(${days}, minmax(${days > 14 ? 44 : 64}px, 1fr))`,
            minWidth: days === 30 ? 1400 : 760,
            position: "relative",
          }}>
            {/* Header */}
            <div className="cal-head" style={{ background: "var(--surface)", fontWeight: 600 }}>
              <span style={{ fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--muted)" }}>{t("room")}</span>
            </div>
            {dateCols.map(d => {
              const dt = new Date(d);
              const isToday = d === todayStr;
              const isWeekend = [0, 6].includes(dt.getDay());
              return (
                <div key={d} className={"cal-head" + (isToday ? " today" : isWeekend ? " weekend" : "")}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 600, lineHeight: 1 }}>{dt.getDate()}</div>
                  <div style={{ fontSize: 10, marginTop: 2, opacity: .75 }}>
                    {dt.toLocaleDateString(lang==="th"?"th-TH":"en-GB", { weekday: "short" })}
                  </div>
                </div>
              );
            })}
            {/* Room rows */}
            {filteredRooms.map((room, rowIdx) => {
              const lanes = lanesByRoom[room.id] || 1;
              const rowHeight = ROW_PAD * 2 + lanes * BAR_H + (lanes - 1) * BAR_GAP;
              return (
              <React.Fragment key={room.id}>
                <div className="cal-room" style={{ gridColumn: 1, gridRow: rowIdx + 2, minHeight: rowHeight }}>
                  <span className="dot" style={{ background: "var(--st-"+room.status+")" }}></span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{room.label}</div>
                    <div className="muted" style={{ fontSize: 10.5 }}>{t(BUILDING_LABELS[room.building])}</div>
                  </div>
                </div>
                {dateCols.map((d, di) => (
                  <div key={d} className={"cal-cell" + (d === todayStr ? " today" : "")}
                    style={{ gridColumn: di + 2, gridRow: rowIdx + 2, minHeight: rowHeight }}></div>
                ))}
                {/* Bars */}
                {barsByRoom[room.id]?.map((bar, i) => (
                  <div
                    key={room.id + "-bar-" + i}
                    className={"cal-bar " + (bar.kind === "reserved" ? "reserved" : "occupied") + (bar.status === "pending" ? " pending" : "")}
                    style={{
                      gridColumn: `${bar.startIdx + 2} / span ${bar.span}`,
                      gridRow: rowIdx + 2,
                      height: BAR_H,
                      marginTop: ROW_PAD + bar.lane * (BAR_H + BAR_GAP),
                      marginLeft: 2, marginRight: 2,
                      zIndex: 3,
                      opacity: bar.status === "pending" ? 0.75 : 1,
                      border: bar.status === "pending" ? "1.5px dashed white" : "none",
                    }}
                    onClick={() => {
                      if (bar.kind === "reserved") setEditingBooking(bar);
                    }}
                  >
                    <Icon name={bar.kind === "reserved" ? "calendar" : "user"} size={11} />
                    <span style={{ marginLeft: 4 }}>{bar.guestName}</span>
                  </div>
                ))}
              </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <BookingsList state={state} actions={actions} bldgFilter={bldgFilter} onEdit={setEditingBooking} />
      )}

      <div className="row mt-3" style={{ gap: 14, fontSize: 12, color: "var(--ink-2)", flexWrap: "wrap" }}>
        <div className="row" style={{ gap: 6 }}>
          <div style={{ width: 18, height: 11, background: "var(--brand)", borderRadius: 3 }}></div>
          <span>{t("st_occupied")}</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <div style={{ width: 18, height: 11, background: "var(--st-reserved)", borderRadius: 3 }}></div>
          <span>{t("b_confirmed")}</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <div style={{ width: 18, height: 11, background: "var(--st-reserved)", borderRadius: 3, opacity: 0.7, border: "1.5px dashed white", boxShadow: "0 0 0 1px var(--st-reserved)" }}></div>
          <span>{t("b_pending")}</span>
        </div>
      </div>

      <AddBookingModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(b) => { actions.addBooking(b); setShowAdd(false); toast(lang==="th"?"บันทึกการจองแล้ว":"Booking saved"); }}
        rooms={state.rooms}
      />

      {/* Booking detail mini-modal */}
      {editingBooking ? (
        <Modal
          open={true}
          onClose={() => setEditingBooking(null)}
          title={editingBooking.guestName}
          footer={
            <>
              {editingBooking.status === "pending" ? (
                <button className="btn" onClick={() => { actions.confirmBooking(editingBooking.id); setEditingBooking(null); toast(lang==="th"?"ยืนยันการจองแล้ว":"Booking confirmed"); }}>
                  <Icon name="check" size={14} /> {t("confirm")}
                </button>
              ) : null}
              <button className="btn btn-primary" onClick={() => { actions.bookingToCheckIn(editingBooking.id); setEditingBooking(null); toast(lang==="th"?"เช็คอินแขกแล้ว":"Checked in"); }}>
                <Icon name="check" size={14} /> {t("check_in")}
              </button>
              <button className="btn btn-danger" onClick={() => { actions.cancelBooking(editingBooking.id); setEditingBooking(null); toast(lang==="th"?"ยกเลิกการจอง":"Cancelled"); }}>
                <Icon name="x" size={14} /> {lang==="th"?"ยกเลิก":"Cancel booking"}
              </button>
            </>
          }
        >
          <div className="grid-2">
            <div>
              <div className="muted text-xs">{t("room")}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{editingBooking.roomId}</div>
            </div>
            <div>
              <div className="muted text-xs">{t("phone")}</div>
              <div>{editingBooking.phone}</div>
            </div>
            <div>
              <div className="muted text-xs">{t("check_in_date")}</div>
              <div>{fmtDate(editingBooking.checkIn, lang)}</div>
            </div>
            <div>
              <div className="muted text-xs">{t("check_out_date")}</div>
              <div>{fmtDate(editingBooking.checkOut, lang)}</div>
            </div>
            <div>
              <div className="muted text-xs">{t("status")}</div>
              <div><span className={"chip chip-status st-" + (editingBooking.status === "confirmed" ? "available" : "dirty")}><span className="dot"></span>{t("b_" + editingBooking.status)}</span></div>
            </div>
            <div>
              <div className="muted text-xs">{t("rate")}</div>
              <div className="mono">฿{editingBooking.rate}</div>
            </div>
          </div>
          {editingBooking.note ? (
            <div className="mt-2">
              <div className="muted text-xs">{t("note")}</div>
              <div>{editingBooking.note}</div>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
}

function BookingsList({ state, actions, bldgFilter, onEdit }) {
  const { t, lang } = useI18n();
  const { toast } = useStore();
  const list = state.bookings.filter(b => bldgFilter === "all" || state.rooms.find(r => r.id === b.roomId)?.building === bldgFilter);
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>{t("guest_name")}</th>
            <th>{t("room")}</th>
            <th>{t("check_in_date")}</th>
            <th>{t("check_out_date")}</th>
            <th>{t("type")}</th>
            <th>{t("phone")}</th>
            <th>{t("status")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? <tr><td colSpan={8}><Empty>{lang==="th"?"ยังไม่มีการจอง":"No bookings yet"}</Empty></td></tr> : null}
          {list.map(b => (
            <tr key={b.id}>
              <td><b>{b.guestName}</b></td>
              <td>{b.roomId}</td>
              <td>{fmtDate(b.checkIn, lang)}</td>
              <td>{fmtDate(b.checkOut, lang)}</td>
              <td>{t("rate_" + (b.type === "nightly" ? "nightly" : b.type === "monthly" ? "monthly" : "temp"))}</td>
              <td className="muted text-sm">{b.phone}</td>
              <td>
                <span className={"chip chip-status st-" + (b.status === "confirmed" ? "available" : b.status === "pending" ? "dirty" : "broken")}>
                  <span className="dot"></span>{t("b_" + b.status)}
                </span>
              </td>
              <td>
                <div className="row" style={{ gap: 4 }}>
                  {b.status === "pending" ? <button className="btn btn-sm" onClick={() => { actions.confirmBooking(b.id); toast(lang==="th"?"ยืนยันแล้ว":"Confirmed"); }}>{t("confirm")}</button> : null}
                  {b.status !== "cancelled" && b.checkIn <= today() ? (
                    <button className="btn btn-sm btn-primary" onClick={() => { actions.bookingToCheckIn(b.id); toast(lang==="th"?"เช็คอินแล้ว":"Checked in"); }}>
                      <Icon name="check" size={12} /> {t("check_in")}
                    </button>
                  ) : null}
                  {b.status !== "cancelled" ? (
                    <button className="btn btn-sm btn-ghost" onClick={() => { if (confirm(lang==="th"?"ยกเลิกการจองนี้?":"Cancel this booking?")) { actions.cancelBooking(b.id); toast(lang==="th"?"ยกเลิกแล้ว":"Cancelled"); }}}>
                      <Icon name="x" size={12} />
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddBookingModal({ open, onClose, onAdd, rooms }) {
  const { t, lang } = useI18n();
  const { state } = useStore();
  const [form, setForm] = React.useState({
    guestName: "", phone: "",
    roomId: rooms[0]?.id || "",
    type: "nightly", bedType: "single",
    checkIn: addDays(today(), 1),
    checkOut: addDays(today(), 3),
    pax: 1, note: "", status: "confirmed",
  });

  React.useEffect(() => {
    if (open) setForm(f => ({ ...f, roomId: rooms[0]?.id || "" }));
  }, [open]);

  if (!open) return null;
  const room = rooms.find(r => r.id === form.roomId);
  const rate = room?.configs.find(c => c.type === form.bedType)?.price || room?.configs[0].price || 0;

  // Live conflict check
  const conflict = hasDateConflict(state, form.roomId, form.checkIn, form.checkOut);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("b_new")}
      footer={
        <>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" disabled={!!conflict || !form.guestName.trim()} style={{ opacity: conflict ? .5 : 1 }} onClick={() => {
            if (!form.guestName.trim() || !form.roomId || conflict) return;
            onAdd({ ...form, rate });
          }}>
            <Icon name="check" size={14} /> {t("save")}
          </button>
        </>
      }
    >
      <div className="grid-2 mb-2">
        <div className="field">
          <label className="field-label">{t("guest_name")} *</label>
          <input className="input" value={form.guestName} onChange={e => setForm({...form, guestName: e.target.value})} autoFocus />
        </div>
        <div className="field">
          <label className="field-label">{t("phone")}</label>
          <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div className="field">
          <label className="field-label">{t("room")} *</label>
          <select className="select" value={form.roomId} onChange={e => setForm({...form, roomId: e.target.value, bedType: rooms.find(r => r.id === e.target.value)?.configs[0].type || "single"})}>
            {rooms.map(r => (
              <option key={r.id} value={r.id}>{r.label} · {t(BUILDING_LABELS[r.building])}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">{t("status")}</label>
          <select className="select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="confirmed">{t("b_confirmed")}</option>
            <option value="pending">{t("b_pending")}</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">{t("check_in_date")}</label>
          <input type="date" className="input" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
        </div>
        <div className="field">
          <label className="field-label">{t("check_out_date")}</label>
          <input type="date" className="input" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
        </div>
      </div>
      {/* Conflict warning */}
      {conflict ? (
        <div style={{ padding: "10px 14px", background: "color-mix(in oklab, var(--st-occupied) 10%, white)", border: "1.5px solid color-mix(in oklab, var(--st-occupied) 40%, white)", borderRadius: 8, fontSize: 12.5, color: "var(--st-occupied)", display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
          <Icon name="bell" size={15} />
          <div>
            <b>{lang==="th" ? "ไม่สามารถจองได้ — มีการจองทับซ้อน" : "Conflict — room already booked"}</b>
            <div style={{ marginTop: 3, color: "var(--ink-2)" }}>
              {lang==="th" ? "ห้องนี้ถูก" : "This room is "} <b>{conflict.kind === "stay" ? (lang==="th"?"เช็คอินไปแล้ว":"already checked in") : (lang==="th"?"จองไว้แล้ว":"already booked")}</b>
              {lang==="th" ? " โดย " : " by "}<b>{conflict.item.guestName}</b>
              {lang==="th" ? " (" : " ("}{fmtDate(conflict.item.checkIn, lang)} → {fmtDate(conflict.item.checkOut, lang)}{")"}
            </div>
          </div>
        </div>
      ) : null}
      <div className="field">
        <label className="field-label">{t("note")}</label>
        <textarea className="textarea" rows={2} value={form.note} onChange={e => setForm({...form, note: e.target.value})}></textarea>
      </div>
    </Modal>
  );
}

window.BookingsPage = BookingsPage;
