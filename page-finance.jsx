// === page-finance.jsx ===

function FinancePage() {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [period, setPeriod] = React.useState("thismonth");
  const [customRange, setCustomRange] = React.useState({ from: addDays(today(), -29), to: today() });
  const [showExpense, setShowExpense] = React.useState(false);

  const { from, to } = getRangeFromPeriod(period, customRange);
  const rev = getRevenueInPeriod(state, from, to);
  const exp = getExpensesInPeriod(state, from, to);
  const wages = getWagesInPeriod(state, from, to);
  const totalExpenses = exp.total + wages.total;
  const profit = rev.total - totalExpenses;

  // Chart series: monthly if range > 1 month, else daily
  const fromD = new Date(from), toD = new Date(to);
  const monthSpan = (toD.getFullYear() - fromD.getFullYear()) * 12 + (toD.getMonth() - fromD.getMonth());
  const isMonthlyChart = monthSpan >= 1;

  let series;
  if (isMonthlyChart) {
    const monthMap = {};
    let cur = new Date(fromD.getFullYear(), fromD.getMonth(), 1);
    const endM = new Date(toD.getFullYear(), toD.getMonth(), 1);
    while (cur <= endM) {
      const mk = ymd(cur).slice(0, 7);
      monthMap[mk] = { date: mk, revenue: 0, expense: 0 };
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    for (const [day, val] of Object.entries(rev.byDay)) {
      const mk = day.slice(0, 7);
      if (monthMap[mk]) monthMap[mk].revenue += val;
    }
    for (const [day, val] of Object.entries(exp.byDay)) {
      const mk = day.slice(0, 7);
      if (monthMap[mk]) monthMap[mk].expense += val;
    }
    series = Object.values(monthMap);
  } else {
    const dayList = [];
    for (let d = new Date(from); d <= new Date(to); d.setDate(d.getDate() + 1)) {
      const key = ymd(d);
      dayList.push({ date: key, revenue: rev.byDay[key] || 0, expense: exp.byDay[key] || 0 });
    }
    series = dayList;
  }
  const maxValue = Math.max(1, ...series.map(s => Math.max(s.revenue, s.expense)));

  const breakdown = { nightly: 0, monthly: 0, temp: 0 };
  for (const s of rev.items) {
    const k = s.type === "nightly" ? "nightly" : s.type === "monthly" ? "monthly" : "temp";
    breakdown[k] += s.amount;
  }
  const expByCat = { ...exp.byCat };

  const periodLabel = labelOfPeriod(period, lang);

  return (
    <div className="finance-report">

      {/* ── Print-only header ────────────────────────── */}
      <div className="print-only" style={{ display: "none", marginBottom: 20, paddingBottom: 14, borderBottom: "2pt solid #333" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src="assets/logo.jpg" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} alt="" />
            <div>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22pt", fontWeight: 700, lineHeight: 1.1 }}>TN Resort Hotel</div>
              <div style={{ fontSize: "10pt", color: "#666", letterSpacing: ".14em", textTransform: "uppercase", marginTop: 3 }}>รายงานการเงิน · Finance Report</div>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "11pt", color: "#333" }}>
            <div style={{ fontWeight: 600 }}>{periodLabel}</div>
            <div>{fmtDate(from, lang)} – {fmtDate(to, lang)}</div>
            <div style={{ fontSize: "9pt", color: "#888", marginTop: 4 }}>พิมพ์เมื่อ {new Date().toLocaleString(lang === "th" ? "th-TH" : "en-GB")}</div>
          </div>
        </div>
      </div>

      {/* ── Screen header & period picker ───────────── */}
      <div className="screen-only">
        <div className="section-head">
          <div>
            <h2>{t("nav_finance")}</h2>
            <div className="sub">{fmtDate(from, lang)} – {fmtDate(to, lang)}</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn" onClick={() => window.print()}>
              <Icon name="print" size={14} /> {lang === "th" ? "พิมพ์รายงาน" : "Print report"}
            </button>
            <button className="btn btn-primary" onClick={() => setShowExpense(true)}>
              <Icon name="plus" size={14} /> {t("f_add_expense")}
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: "12px 14px", marginBottom: 14 }}>
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="muted text-sm">{t("s_period")}:</span>
              <div className="seg">
                {[
                  { id: "today",     label: t("f_period_today") },
                  { id: "week",      label: t("f_period_week") },
                  { id: "month",     label: t("f_period_month") },
                  { id: "thismonth", label: lang === "th" ? "เดือนนี้" : "This month" },
                  { id: "lastmonth", label: lang === "th" ? "เดือนที่แล้ว" : "Last month" },
                  { id: "custom",    label: t("f_period_custom") },
                ].map(p => (
                  <button key={p.id} className={period === p.id ? "active" : ""} onClick={() => setPeriod(p.id)}>{p.label}</button>
                ))}
              </div>
            </div>
            {period === "custom" ? (
              <div className="row" style={{ gap: 6 }}>
                <input type="date" className="input" style={{ width: 150 }} value={customRange.from} onChange={e => setCustomRange({ ...customRange, from: e.target.value })} />
                <span className="muted">→</span>
                <input type="date" className="input" style={{ width: 150 }} value={customRange.to} onChange={e => setCustomRange({ ...customRange, to: e.target.value })} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────── */}
      <div className="kpi-grid mb-3">
        <div className="kpi">
          <div className="kpi-art" style={{ color: "var(--brand)" }}>
            <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="22" y="46" width="72" height="44" rx="4" /><circle cx="58" cy="68" r="10" />
              <path d="M58 62v12M54 66h8M54 70h8" /><path d="M30 40h60M34 34h52" opacity=".5" />
            </svg>
          </div>
          <div className="kpi-label">{t("f_revenue")}</div>
          <div className="kpi-value" style={{ color: "var(--brand-dark)" }}>{fmtBaht(rev.total)}</div>
          <div className="kpi-delta muted">{rev.items.length} {lang === "th" ? "การเข้าพัก" : "stays"}</div>
        </div>
        <div className="kpi">
          <div className="kpi-art" style={{ color: "var(--accent)" }}>
            <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="60" cy="60" r="28" /><path d="M60 40v40M48 52h18a8 8 0 0 1 0 16H48v-16zM48 68h20" />
            </svg>
          </div>
          <div className="kpi-label">{t("f_wages")}</div>
          <div className="kpi-value">{fmtBaht(wages.total)}</div>
          <div className="kpi-delta muted">{state.staff.length} {lang === "th" ? "คน" : "staff"}</div>
        </div>
        <div className="kpi">
          <div className="kpi-art" style={{ color: "var(--st-dirty)" }}>
            <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="24" y="38" width="68" height="52" rx="4" /><path d="M24 56h68M40 56V90M58 56V90M76 56V90" opacity=".6" />
              <path d="M40 38V28h36v10" />
            </svg>
          </div>
          <div className="kpi-label">{t("f_expense")}</div>
          <div className="kpi-value">{fmtBaht(exp.total)}</div>
          <div className="kpi-delta muted">{exp.items.length} {lang === "th" ? "รายการ" : "items"}</div>
        </div>
        <div className="kpi" style={{ background: profit >= 0 ? "var(--brand-softer)" : "color-mix(in oklab, var(--st-occupied) 8%, white)" }}>
          <div className="kpi-art" style={{ color: profit >= 0 ? "var(--brand)" : "var(--st-occupied)" }}>
            <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              {profit >= 0
                ? <><path d="M30 90L50 60l20 16 20-36" /><path d="M80 40h12v12" /></>
                : <><path d="M30 40L50 70l20-16 20 36" /><path d="M80 80h12v-12" /></>
              }
            </svg>
          </div>
          <div className="kpi-label">{profit >= 0 ? t("f_profit") : t("f_loss")}</div>
          <div className="kpi-value" style={{ color: profit >= 0 ? "var(--brand-dark)" : "var(--st-occupied)" }}>
            {profit >= 0 ? fmtBaht(profit) : "-" + fmtBaht(Math.abs(profit))}
          </div>
          <div className="kpi-delta muted">
            {rev.total > 0 ? Math.round(profit / rev.total * 100) : 0}% {lang === "th" ? "อัตรากำไร" : "margin"}
          </div>
        </div>
      </div>

      {/* ── Chart (screen only) ──────────────────────── */}
      <div className="card mb-3 screen-only">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div className="card-title">{t("f_pl")}</div>
            <div className="card-sub muted">{lang === "th" ? "รายรับเทียบรายจ่าย" : "Revenue vs Expense"}</div>
          </div>
          <div className="row" style={{ gap: 14 }}>
            <div className="row" style={{ gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, background: "var(--brand)", borderRadius: 2 }}></span>{t("f_revenue")}</div>
            <div className="row" style={{ gap: 6, fontSize: 12 }}><span style={{ width: 12, height: 12, background: "var(--accent)", borderRadius: 2 }}></span>{t("f_expense")}</div>
          </div>
        </div>
        <div className="bars" style={{ height: 240 }}>
          {series.map((d) => {
            const barLabel = isMonthlyChart
              ? new Date(d.date + "-02").toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { month: "short" })
              : (new Date(d.date).getDate() + (series.length <= 7 ? "/" + (new Date(d.date).getMonth() + 1) : ""));
            const tipText = (isMonthlyChart
              ? new Date(d.date + "-02").toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { month: "long", year: "numeric" })
              : fmtDate(d.date, lang))
              + " · " + (lang === "th" ? "รายรับ " : "Rev ") + fmtBaht(d.revenue)
              + (d.expense > 0 ? " · " + (lang === "th" ? "ค่าใช้จ่าย " : "Exp ") + fmtBaht(d.expense) : "");
            return (
              <div className="bar-col" key={d.date} title={tipText}>
                <div style={{ height: 200, width: "100%", display: "flex", gap: 2, alignItems: "end" }}>
                  <div className="bar" style={{ height: Math.max(2, (d.revenue / maxValue) * 180) + "px" }}></div>
                  <div className="bar expense" style={{ height: Math.max(2, (d.expense / maxValue) * 180) + "px" }}></div>
                </div>
                <div className="bar-label" style={{ fontSize: isMonthlyChart ? 10 : 9.5, fontWeight: isMonthlyChart ? 500 : 400, transform: (!isMonthlyChart && series.length > 18) ? "rotate(-50deg) translate(-10px, 4px)" : "none", transformOrigin: "right top" }}>
                  {barLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Breakdown cards ──────────────────────────── */}
      <div className="finance-breakdown" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-title mb-2">{t("f_breakdown")}</div>
          {Object.keys(breakdown).every(k => !breakdown[k])
            ? <Empty>{lang === "th" ? "ยังไม่มีรายรับ" : "No revenue"}</Empty>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { k: "nightly", label: t("rate_nightly") },
                  { k: "monthly", label: t("rate_monthly") },
                  { k: "temp",    label: t("rate_temp") },
                ].map(({ k, label }) => {
                  const v = breakdown[k];
                  const pct = rev.total > 0 ? (v / rev.total) * 100 : 0;
                  return (
                    <div key={k}>
                      <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                        <span>{label}</span>
                        <span className="mono"><b>{fmtBaht(v)}</b> · {Math.round(pct)}%</span>
                      </div>
                      <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: pct + "%", height: "100%", background: "var(--brand)", transition: "width .3s" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </div>

        <div className="card">
          <div className="card-title mb-2">{lang === "th" ? "ค่าใช้จ่ายแยกหมวด" : "Expenses by category"}</div>
          {Object.keys(expByCat).length === 0 && wages.total === 0
            ? <Empty>{lang === "th" ? "ไม่มีค่าใช้จ่าย" : "No expenses"}</Empty>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <CategoryBar label={t("f_wages")} value={wages.total} total={totalExpenses} color="var(--accent)" />
                {Object.entries(expByCat).map(([cat, val]) => (
                  <CategoryBar key={cat} label={t("cat_" + cat)} value={val} total={totalExpenses} color="var(--st-dirty)" />
                ))}
              </div>
            )
          }
        </div>
      </div>

      {/* ── Expense table ────────────────────────────── */}
      <div className="section-head mt-3 screen-only">
        <div>
          <h2 style={{ fontSize: 19 }}>{lang === "th" ? "รายการค่าใช้จ่าย" : "Expense ledger"}</h2>
          <div className="sub">{exp.items.length} {lang === "th" ? "รายการ" : "items"} {lang === "th" ? "ในช่วงที่เลือก" : "in period"}</div>
        </div>
      </div>
      <div className="print-only" style={{ display: "none", fontFamily: "Cormorant Garamond, serif", fontSize: "14pt", fontWeight: 700, borderBottom: "1pt solid #ccc", paddingBottom: 6, marginBottom: 10, marginTop: 18 }}>
        {lang === "th" ? "รายการค่าใช้จ่าย" : "Expense Ledger"}
        <span style={{ fontFamily: "Sarabun, sans-serif", fontSize: "10pt", fontWeight: 400, color: "#666", marginLeft: 10 }}>
          ({exp.items.length} {lang === "th" ? "รายการ" : "items"})
        </span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t("f_date")}</th>
              <th>{t("f_category")}</th>
              <th>{t("note")}</th>
              <th style={{ textAlign: "right" }}>{t("amount")}</th>
              <th className="screen-only"></th>
            </tr>
          </thead>
          <tbody>
            {exp.items.length === 0
              ? <tr><td colSpan={5}><Empty>{lang === "th" ? "ไม่มีรายการ" : "No items"}</Empty></td></tr>
              : null
            }
            {exp.items.sort((a, b) => b.date.localeCompare(a.date)).map(e => (
              <tr key={e.id}>
                <td>{fmtDate(e.date, lang)}</td>
                <td><span className="chip">{t("cat_" + e.category)}</span></td>
                <td>{e.note}</td>
                <td style={{ textAlign: "right" }} className="mono">{fmtBaht(e.amount)}</td>
                <td className="screen-only">
                  <button className="btn btn-sm btn-ghost" onClick={() => {
                    if (confirm(lang === "th" ? "ลบรายการนี้?" : "Delete this item?")) {
                      actions.removeExpense(e.id); toast(lang === "th" ? "ลบแล้ว" : "Deleted");
                    }
                  }}>
                    <Icon name="trash" size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Print-only P&L summary ───────────────────── */}
      <div className="print-only" style={{ display: "none", marginTop: 24, padding: "14px 18px", border: "2pt solid #222", borderRadius: 6 }}>
        <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "15pt", fontWeight: 700, marginBottom: 10, borderBottom: "1pt solid #ccc", paddingBottom: 8 }}>
          {lang === "th" ? "สรุปกำไร-ขาดทุน" : "Profit & Loss Summary"}
        </div>
        {[
          { label: lang === "th" ? "รายรับรวม"          : "Total Revenue",    value: rev.total,    sign: "+", color: "#2d6b2d" },
          { label: lang === "th" ? "ค่าแรงพนักงาน"       : "Staff wages",      value: wages.total,  sign: "-", color: "#7a3500" },
          { label: lang === "th" ? "ค่าใช้จ่ายอื่นๆ"     : "Other expenses",   value: exp.total,    sign: "-", color: "#7a3500" },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5pt solid #e0e0e0", fontSize: "11pt" }}>
            <span>{r.label}</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600, color: r.color }}>{r.sign}{fmtBaht(r.value)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontFamily: "Cormorant Garamond, serif", fontSize: "18pt", fontWeight: 700 }}>
          <span>{profit >= 0 ? (lang === "th" ? "กำไรสุทธิ" : "Net Profit") : (lang === "th" ? "ขาดทุนสุทธิ" : "Net Loss")}</span>
          <span style={{ color: profit >= 0 ? "#2d6b2d" : "#9b3a2a" }}>
            {profit < 0 ? "-" : ""}{fmtBaht(Math.abs(profit))}
            <span style={{ fontSize: "11pt", fontFamily: "Sarabun, sans-serif", fontWeight: 400, color: "#666", marginLeft: 10 }}>
              ({rev.total > 0 ? Math.round(profit / rev.total * 100) : 0}%)
            </span>
          </span>
        </div>
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1pt solid #333", paddingTop: 5, fontSize: "10pt", color: "#555" }}>
              {lang === "th" ? "ลายเซ็นผู้จัดทำ" : "Prepared by"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1pt solid #333", paddingTop: 5, fontSize: "10pt", color: "#555" }}>
              {lang === "th" ? "ลายเซ็นผู้ตรวจสอบ" : "Approved by"}
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal open={showExpense} onClose={() => setShowExpense(false)} onAdd={(e) => {
        actions.addExpense(e); setShowExpense(false); toast(lang === "th" ? "บันทึกค่าใช้จ่ายแล้ว" : "Expense logged");
      }} />
    </div>
  );
}

function CategoryBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
        <span>{label}</span>
        <span className="mono"><b>{fmtBaht(value)}</b> · {Math.round(pct)}%</span>
      </div>
      <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: color, transition: "width .3s" }}></div>
      </div>
    </div>
  );
}

function AddExpenseModal({ open, onClose, onAdd }) {
  const { t, lang } = useI18n();
  const [form, setForm] = React.useState({ date: today(), category: "utility", amount: "", note: "" });
  if (!open) return null;
  return (
    <Modal open={true} onClose={onClose} title={t("f_add_expense")}
      footer={
        <>
          <button className="btn" onClick={onClose}>{t("cancel")}</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.amount || Number(form.amount) <= 0) return;
            onAdd({ ...form, amount: Number(form.amount) });
            setForm({ date: today(), category: "utility", amount: "", note: "" });
          }}><Icon name="check" size={14} /> {t("save")}</button>
        </>
      }>
      <div className="grid-2 mb-2">
        <div className="field">
          <label className="field-label">{t("f_date")}</label>
          <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="field">
          <label className="field-label">{t("f_category")}</label>
          <select className="select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="utility">{t("cat_utility")}</option>
            <option value="supply">{t("cat_supply")}</option>
            <option value="repair">{t("cat_repair")}</option>
            <option value="other">{t("cat_other")}</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label className="field-label">{t("amount")} (฿)</label>
          <input type="number" className="input" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" autoFocus />
        </div>
        <div className="field" style={{ gridColumn: "1/-1" }}>
          <label className="field-label">{t("note")}</label>
          <input className="input" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder={lang === "th" ? "รายละเอียด" : "Description"} />
        </div>
      </div>
    </Modal>
  );
}

window.FinancePage = FinancePage;
