// === page-guests.jsx ===

function GuestsPage() {
  const { t, lang } = useI18n();
  const { state } = useStore();
  const [search, setSearch] = React.useState("");
  const [openGuest, setOpenGuest] = React.useState(null);

  // Aggregate guest info
  const guestRows = state.guests.map(g => {
    const stays = state.stays.filter(s => s.guestId === g.id);
    const totalSpent = stays.filter(s => s.status !== "cancelled").reduce((sum, s) => sum + (s.paid || 0), 0);
    const lastVisit = stays.length > 0 ? stays.sort((a,b) => (b.checkIn||"").localeCompare(a.checkIn||""))[0] : null;
    const isActive = stays.some(s => s.status === "active");
    return { ...g, stays, totalSpent, lastVisit, visitCount: stays.length, isActive };
  });

  const filtered = guestRows.filter(g => {
    if (!search) return true;
    const q = search.toLowerCase();
    return g.name.toLowerCase().includes(q) || (g.phone || "").includes(q) || (g.idCard || "").includes(q);
  });

  // Sort: active first, then most recent visit
  filtered.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    const da = a.lastVisit?.checkIn || "";
    const db = b.lastVisit?.checkIn || "";
    return db.localeCompare(da);
  });

  return (
    <>
      <div className="section-head">
        <div>
          <h2>{t("nav_guests")}</h2>
          <div className="sub">{filtered.length} {lang==="th"?"แขก":"guests"} · {state.stays.length} {lang==="th"?"การเข้าพักทั้งหมด":"total stays"}</div>
        </div>
        <div style={{ position: "relative", width: 300 }}>
          <Icon name="search" size={14} />
          <input
            className="input"
            style={{ paddingLeft: 32 }}
            placeholder={lang==="th"?"ค้นหาชื่อ เบอร์ บัตรประชาชน...":"Search name, phone, ID..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div style={{ position: "absolute", left: 10, top: 9, color: "var(--muted)", pointerEvents: "none" }}><Icon name="search" size={15} /></div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t("guest_name")}</th>
              <th>{t("phone")}</th>
              <th>{t("id_card")}</th>
              <th>{lang==="th"?"จำนวนครั้ง":"Visits"}</th>
              <th>{lang==="th"?"พักครั้งล่าสุด":"Last visit"}</th>
              <th>{lang==="th"?"ยอดใช้จ่ายรวม":"Total spent"}</th>
              <th>{t("status")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={8}><Empty>{lang==="th"?"ไม่พบแขก":"No guests found"}</Empty></td></tr> : null}
            {filtered.map(g => (
              <tr key={g.id} style={{ cursor: "pointer" }} onClick={() => setOpenGuest(g)}>
                <td>
                  <div className="row" style={{ gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 999, background: "var(--brand-soft)", display: "grid", placeItems: "center", color: "var(--brand-dark)", fontWeight: 600 }}>
                      {g.name.charAt(0)}
                    </div>
                    <b>{g.name}</b>
                  </div>
                </td>
                <td className="muted text-sm">{g.phone}</td>
                <td className="muted text-sm mono">{g.idCard}</td>
                <td className="mono">{g.visitCount}</td>
                <td>{g.lastVisit ? fmtDate(g.lastVisit.checkIn, lang) : "—"}</td>
                <td className="mono"><b>{fmtBaht(g.totalSpent)}</b></td>
                <td>
                  {g.isActive ? (
                    <span className="chip chip-status chip-bold st-available"><span className="dot"></span>{lang==="th"?"กำลังพัก":"Currently here"}</span>
                  ) : (
                    <span className="chip chip-status chip-bold st-broken"><span className="dot"></span>{lang==="th"?"จากไปแล้ว":"Past"}</span>
                  )}
                </td>
                <td><Icon name="chevronRight" size={14} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openGuest ? <GuestDetailModal guest={openGuest} onClose={() => setOpenGuest(null)} /> : null}
    </>
  );
}

function GuestDetailModal({ guest, onClose }) {
  const { t, lang } = useI18n();
  const { state } = useStore();
  const [receiptStay, setReceiptStay] = React.useState(null);

  const stays = state.stays.filter(s => s.guestId === guest.id).sort((a,b) => (b.checkIn||"").localeCompare(a.checkIn||""));

  return (
    <>
      <Modal open={true} onClose={onClose} size="lg" title={guest.name}>
        <div className="row mb-3" style={{ gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: "var(--brand-soft)", display: "grid", placeItems: "center", color: "var(--brand-dark)", fontSize: 24, fontWeight: 600 }}>
            {guest.name.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600 }}>{guest.name}</div>
            <div className="muted text-sm mt-1">
              {guest.phone} · <span className="mono">{guest.idCard}</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="num-big" style={{ color: "var(--brand-dark)" }}>{fmtBaht(stays.reduce((s, x) => s + (x.paid || 0), 0))}</div>
            <div className="muted text-xs">{lang==="th"?"ยอดใช้จ่ายรวม":"Lifetime spent"}</div>
          </div>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink-2)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 8 }}>
          {lang==="th"?"ประวัติการเข้าพัก":"Stay history"} · {stays.length}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {stays.map(s => (
            <div key={s.id} className="row" style={{ padding: "12px 0", borderTop: "1px solid var(--line)", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>
                  {lang==="th"?"ห้อง ":"Room "}{s.roomId}
                  <span className="muted" style={{ marginLeft: 8, fontWeight: 400, fontSize: 12 }}>
                    · {t("rate_" + (s.type === "nightly" ? "nightly" : s.type === "monthly" ? "monthly" : "temp"))}
                  </span>
                </div>
                <div className="muted text-xs mt-1">
                  {fmtDate(s.checkIn, lang)} → {fmtDate(s.actualCheckOut || s.checkOut, lang)} · {s.quantity} {s.type === "nightly" ? t("nights") : s.type === "monthly" ? t("months") : t("hours")}
                </div>
                {s.status === "cancelled" ? (
                  <div className="mt-1" style={{ padding: "6px 10px", background: "color-mix(in oklab, var(--st-occupied) 8%, white)", border: "1px dashed color-mix(in oklab, var(--st-occupied) 30%, var(--line))", borderRadius: 6, fontSize: 12 }}>
                    <div style={{ color: "var(--st-occupied)", fontWeight: 600, fontSize: 11.5, letterSpacing: ".05em", textTransform: "uppercase" }}>
                      {t("cancel_reason")}
                    </div>
                    <div style={{ color: "var(--ink)", marginTop: 2 }}>
                      {s.cancelReason || <span className="muted">{lang==="th"?"(ไม่ระบุเหตุผล)":"(No reason given)"}</span>}
                    </div>
                    {s.cancelledAt ? (
                      <div className="muted text-xs mt-1">
                        {t("cancel_at")}: {new Date(s.cancelledAt).toLocaleString(lang==="th"?"th-TH":"en-GB")}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div className="mono" style={{ fontWeight: 600, textDecoration: s.status === "cancelled" ? "line-through" : "none", color: s.status === "cancelled" ? "var(--muted)" : null }}>
                  {fmtBaht(s.amount)}
                </div>
                <div className="row mt-1" style={{ gap: 6, justifyContent: "flex-end" }}>
                  {s.status === "cancelled" ? (
                    <span className="chip chip-status st-broken"><span className="dot"></span>{t("st_cancelled")}</span>
                  ) : (
                    <StatusChip status={s.status === "active" ? "occupied" : "available"} size="sm" />
                  )}
                  {s.status !== "cancelled" ? (
                    <button className="btn btn-sm btn-ghost" onClick={() => setReceiptStay(s)}>
                      <Icon name="receipt" size={12} /> {lang==="th"?"ใบเสร็จ":"Receipt"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <ReceiptModal open={!!receiptStay} stay={receiptStay} onClose={() => setReceiptStay(null)} />
    </>
  );
}

window.GuestsPage = GuestsPage;
