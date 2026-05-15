// === page-dashboard.jsx ===

// Thematic SVG illustrations for each KPI card — line-art style matching the
// rest of the iconography, sized to fill the bottom-right corner.
const KpiArtOccupancy = () => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="18" y="40" width="84" height="58" rx="4" />
    <path d="M18 70h84" />
    <rect x="28" y="54" width="30" height="16" rx="3" fill="currentColor" fillOpacity=".15" />
    <rect x="62" y="54" width="30" height="16" rx="3" fill="currentColor" fillOpacity=".15" />
    <path d="M18 98v6M102 98v6" />
    <path d="M30 40v-8a4 4 0 0 1 4-4h52a4 4 0 0 1 4 4v8" />
    <path d="M44 28v-4M76 28v-4" />
  </svg>
);

const KpiArtRevenue = () => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="22" y="46" width="72" height="44" rx="4" />
    <circle cx="58" cy="68" r="10" />
    <path d="M58 62v12M54 66h8M54 70h8" />
    <circle cx="32" cy="56" r="1.5" fill="currentColor" />
    <circle cx="84" cy="80" r="1.5" fill="currentColor" />
    <path d="M30 40h60M34 34h52" opacity=".6" />
    <circle cx="96" cy="34" r="6" fill="currentColor" fillOpacity=".15" />
    <path d="M94 34h4M96 32v4" />
  </svg>
);

const KpiArtArrivals = () => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M40 100V36a4 4 0 0 1 4-4h36a4 4 0 0 1 4 4v64" />
    <path d="M32 100h60" />
    <circle cx="74" cy="66" r="1.8" fill="currentColor" />
    <path d="M50 50h24M50 80h24" opacity=".5" />
    <path d="M8 70h22M22 62l8 8-8 8" />
    <path d="M16 36c0-3 2-5 5-5s5 2 5 5" opacity=".5" />
  </svg>
);

const KpiArtDepartures = () => (
  <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="30" y="46" width="56" height="50" rx="4" />
    <path d="M30 64h56" opacity=".6" />
    <path d="M48 46v-8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8" />
    <path d="M58 76v8" />
    <path d="M38 96v6M78 96v6" />
    <path d="M92 70h22M104 62l10 8-10 8" />
  </svg>
);

function DashboardPage({ setPage }) {
  const { t, lang } = useI18n();
  const { state, actions } = useStore();
  const todayStr = today();

  // Compute KPIs
  const rooms = state.rooms;
  const totalRooms = rooms.length;
  const statusCount = rooms.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});
  const occupied = statusCount.occupied || 0;
  const occRate = Math.round(occupied / totalRooms * 100);

  // Revenue this month (sum of completed/active stays whose end-date falls in current month)
  const now = new Date();
  const monthStart = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const monthRevenue = state.stays
    .filter((s) => s.status !== "cancelled")
    .filter((s) => {
      const end = s.actualCheckOut || s.checkOut;
      return end >= monthStart && end <= monthEnd;
    })
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const todayArrivals = state.bookings.filter((b) => b.checkIn === todayStr && b.status === "confirmed").length +
  state.stays.filter((s) => s.checkIn === todayStr && s.status === "active").length;
  const todayDepartures = state.stays.filter((s) => s.checkOut === todayStr && s.status === "active").length +
  state.stays.filter((s) => s.actualCheckOut === todayStr).length;

  // 7-day revenue series
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(todayStr, -i);
    const rev = state.stays.
    filter((s) => (s.actualCheckOut || s.checkOut) === d).
    reduce((sum, s) => sum + (s.amount || 0), 0);
    days.push({ date: d, rev });
  }
  const maxRev = Math.max(1, ...days.map((d) => d.rev));

  const openMaint = state.maintenance.filter((m) => m.status !== "resolved");
  const recentStays = [...state.stays].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 6);

  const statusList = [
  { key: "available", icon: "check" },
  { key: "occupied", icon: "user" },
  { key: "dirty", icon: "bell" },
  { key: "cleaning", icon: "sparkle" },
  { key: "broken", icon: "wrench" }];


  return (
    <>
      {/* KPI row */}
      <div className="kpi-grid mb-3">
        <div className="kpi">
          <div className="kpi-art" data-comment-anchor="c62ef8b080-div-51-11" style={{ color: "var(--brand)" }}><KpiArtOccupancy /></div>
          <div className="kpi-label">{t("d_occupancy")}</div>
          <div className="kpi-value">{occRate}%</div>
          <div className="kpi-delta">
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>{occupied}</span>
            <span className="muted">/ {totalRooms} {t("nav_rooms")}</span>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-art" data-comment-anchor="2dd767e1db-div-60-11" style={{ color: "var(--accent)" }}><KpiArtRevenue /></div>
          <div className="kpi-label">{t("d_revenue_month")}</div>
          <div className="kpi-value">{fmtBaht(monthRevenue)}</div>
          <div className="kpi-delta">
            <span className="mono muted">
              {now.toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-art" data-comment-anchor="873fe5fba0-div-68-11" style={{ color: "var(--st-cleaning)" }}><KpiArtArrivals /></div>
          <div className="kpi-label">{t("d_arrivals")}</div>
          <div className="kpi-value">{todayArrivals}</div>
          <div className="kpi-delta">
            <a className="btn btn-sm btn-ghost" onClick={() => setPage("bookings")} style={{ padding: "2px 0" }}>
              {t("b_upcoming")} →
            </a>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-art" data-comment-anchor="57a9fc0f0c-div-78-11" style={{ color: "var(--st-reserved)" }}><KpiArtDepartures /></div>
          <div className="kpi-label">{t("d_departures")}</div>
          <div className="kpi-value">{todayDepartures}</div>
          <div className="kpi-delta muted">
            {lang === "th" ? `ห้องชำระแล้ว ${state.stays.filter((s) => s.checkOut === todayStr && s.status === "active" && s.paid >= s.amount).length}` : "Pre-paid"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Revenue chart */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div className="card-title">{t("d_weekly_revenue")}</div>
              <div className="card-sub muted">{lang === "th" ? "รวม 7 วันล่าสุด" : "Last 7 days"}</div>
            </div>
            <div className="num-big" style={{ color: "var(--brand-dark)" }}>
              {fmtBaht(days.reduce((s, d) => s + d.rev, 0))}
            </div>
          </div>
          <div className="bars">
            {days.map((d) =>
            <div className="bar-col" key={d.date}>
                <div style={{ height: 200 - 24, width: "100%", display: "flex", alignItems: "end" }}>
                  <div className="bar" style={{ height: Math.max(2, d.rev / maxRev * 168) + "px" }}>
                    {d.rev > 0 ?
                  <div className="mono" style={{ position: "absolute", top: -16, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "var(--ink-2)" }}>
                        {Math.round(d.rev / 1000) + "k"}
                      </div> :
                  null}
                  </div>
                </div>
                <div className="bar-label">
                  {new Date(d.date).toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { weekday: "short" })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Room status pie */}
        <div className="card">
          <div className="card-title mb-1">{t("d_room_status")}</div>
          <div className="card-sub muted mb-2">{totalRooms} {lang === "th" ? "ห้องทั้งหมด" : "rooms total"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {statusList.map((s) => {
              const count = statusCount[s.key] || 0;
              const pct = count / totalRooms * 100;
              return (
                <div key={s.key}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <span className={"dot st-" + s.key} style={{ background: "var(--st-" + s.key + ")" }}></span>
                      <span style={{ fontSize: 13 }}>{t("st_" + s.key)}</span>
                    </div>
                    <span className="mono" style={{ color: "var(--ink-2)", fontSize: 12 }}>{count}</span>
                  </div>
                  <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: pct + "%", height: "100%", background: "var(--st-" + s.key + ")", transition: "width .3s" }}></div>
                  </div>
                </div>);

            })}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Recent stays */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div className="card-title">{t("d_recent_stays")}</div>
            <button className="btn btn-sm btn-ghost" onClick={() => setPage("guests")}>{t("details")} →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentStays.map((s) =>
            <div key={s.id} className="row" style={{ padding: "10px 0", borderTop: "1px solid var(--line)", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13.5 }}>{s.guestName}</div>
                  <div className="muted text-xs" style={{ marginTop: 2 }}>
                    {t("room")} {s.roomId} · {fmtDate(s.checkIn, lang)} → {fmtDate(s.checkOut, lang)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{fmtBaht(s.amount)}</div>
                  <StatusChip status={s.status === "active" ? "occupied" : "available"} size="sm" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Open maintenance */}
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
            <div className="card-title">{t("d_repair_alert")}</div>
            <button className="btn btn-sm btn-ghost" onClick={() => setPage("maintenance")}>{t("details")} →</button>
          </div>
          {openMaint.length === 0 ?
          <Empty>{lang === "th" ? "ไม่มีรายการแจ้งซ่อมค้าง" : "All repairs closed"}</Empty> :

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {openMaint.map((m) =>
            <div key={m.id} className="row" style={{ padding: "10px 0", borderTop: "1px solid var(--line)", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                      {t("room")} {m.roomId} · <span className="muted">{m.issue}</span>
                    </div>
                    <div className="muted text-xs" style={{ marginTop: 2 }}>
                      {m.reportedBy} · {fmtDate(m.date, lang)}
                    </div>
                  </div>
                  <span className={"chip chip-status st-" + (m.status === "open" ? "broken" : "cleaning")}>
                    <span className="dot"></span>
                    {t("m_" + m.status)}
                  </span>
                </div>
            )}
            </div>
          }
        </div>
      </div>
    </>);

}

window.DashboardPage = DashboardPage;