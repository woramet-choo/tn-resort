// === app.jsx ===
// Main app: login, sidebar, top bar, page routing.

const ROLES = [
{ id: "manager", key: "role_manager", desc: "role_manager_desc", icon: "sparkle",
  pages: ["dashboard", "rooms", "bookings", "guests", "staff", "finance", "maintenance"] },
{ id: "reception", key: "role_reception", desc: "role_reception_desc", icon: "user",
  pages: ["dashboard", "rooms", "bookings", "guests", "maintenance"] },
{ id: "house", key: "role_house", desc: "role_house_desc", icon: "home",
  pages: ["rooms", "maintenance"] }];


const NAV_ITEMS = [
{ id: "dashboard", key: "nav_dashboard", icon: "dashboard", section: "ops" },
{ id: "rooms", key: "nav_rooms", icon: "bed", section: "ops" },
{ id: "bookings", key: "nav_bookings", icon: "calendar", section: "ops" },
{ id: "guests", key: "nav_guests", icon: "users", section: "ops" },
{ id: "maintenance", key: "nav_maintenance", icon: "wrench", section: "ops" },
{ id: "staff", key: "nav_staff", icon: "user", section: "admin" },
{ id: "finance", key: "nav_finance", icon: "money", section: "admin" }];


// Manager password helpers (stored in localStorage)
const DEFAULT_MANAGER_PWD = "1234";
function getManagerPassword() {
  return localStorage.getItem("tn_mgr_pwd") || DEFAULT_MANAGER_PWD;
}
function setManagerPassword(pwd) {
  localStorage.setItem("tn_mgr_pwd", pwd);
}

function LoginScreen({ onLogin }) {
  const { t, lang, setLang } = useI18n();
  const [stage, setStage] = React.useState("pick"); // pick | password
  const [pwd, setPwd] = React.useState("");
  const [err, setErr] = React.useState("");
  const [showChange, setShowChange] = React.useState(false);

  const handleRoleClick = (rid) => {
    if (rid === "manager") {
      setStage("password");
      setPwd("");
      setErr("");
    } else {
      onLogin(rid);
    }
  };

  const submitPwd = () => {
    if (pwd === getManagerPassword()) {
      setErr("");
      onLogin("manager");
    } else {
      setErr(t("password_wrong"));
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <img src="assets/logo.jpg" alt="TN Resort" />
        <h1>{t("appName")} Hotel</h1>
        <div className="sub">{t("appSub")}</div>

        {stage === "pick" ? (
          <>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 18 }}>
              {t("please_select_role")}
            </div>
            <div className="role-pick">
              {ROLES.map((r) =>
                <button key={r.id} onClick={() => handleRoleClick(r.id)}>
                  <div className="ic"><Icon name={r.icon} size={20} /></div>
                  <div style={{ flex: 1 }}>
                    <div className="name">{t(r.key)}</div>
                    <div className="desc">{t(r.desc)}</div>
                  </div>
                  <Icon name="chevronRight" size={16} />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 14 }}>
              {t("enter_password")}
            </div>
            <div className="field" style={{ textAlign: "left" }}>
              <label className="field-label">{t("password")}</label>
              <input
                type="password"
                className="input"
                value={pwd}
                onChange={(e) => { setPwd(e.target.value); setErr(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") submitPwd(); }}
                autoFocus
                placeholder="••••••" />
              {err ? <div style={{ color: "var(--st-occupied)", fontSize: 12, marginTop: 4 }}>{err}</div> : null}
            </div>
            <div className="row mt-2" style={{ gap: 8 }}>
              <button className="btn" style={{ flex: 1 }} onClick={() => { setStage("pick"); setPwd(""); setErr(""); }}>
                <Icon name="arrowLeft" size={14} /> {t("back")}
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitPwd}>
                <Icon name="check" size={14} /> {t("confirm")}
              </button>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 12, fontSize: 12 }}
              onClick={() => setShowChange(true)}>
              <Icon name="settings" size={12} /> {t("change_password")}
            </button>
          </>
        )}

        <div style={{ marginTop: 22, display: "flex", justifyContent: "center", gap: 6 }}>
          <button className={"btn btn-sm " + (lang === "th" ? "btn-primary" : "")} onClick={() => setLang("th")}>ภาษาไทย</button>
          <button className={"btn btn-sm " + (lang === "en" ? "btn-primary" : "")} onClick={() => setLang("en")}>English</button>
        </div>
      </div>

      <ChangePasswordModal open={showChange} onClose={() => setShowChange(false)} />
    </div>);

}

function ChangePasswordModal({ open, onClose }) {
  const { t } = useI18n();
  const { toast } = useStore() || { toast: (m) => alert(m) };
  const [oldP, setOldP] = React.useState("");
  const [newP, setNewP] = React.useState("");
  const [confirmP, setConfirmP] = React.useState("");
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (open) { setOldP(""); setNewP(""); setConfirmP(""); setErr(""); }
  }, [open]);

  const submit = () => {
    if (oldP !== getManagerPassword()) { setErr(t("password_wrong")); return; }
    if (!newP || newP.length < 4) { setErr(t("password") + " ≥ 4"); return; }
    if (newP !== confirmP) { setErr(t("password_mismatch")); return; }
    setManagerPassword(newP);
    if (toast) toast(t("password_changed"));
    else alert(t("password_changed"));
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t("change_password")} footer={
      <>
        <button className="btn" onClick={onClose}>{t("cancel")}</button>
        <button className="btn btn-primary" onClick={submit}>
          <Icon name="check" size={14} /> {t("save")}
        </button>
      </>
    }>
      <div className="field mb-2">
        <label className="field-label">{t("old_password")}</label>
        <input type="password" className="input" value={oldP} onChange={(e) => { setOldP(e.target.value); setErr(""); }} autoFocus />
      </div>
      <div className="field mb-2">
        <label className="field-label">{t("new_password")}</label>
        <input type="password" className="input" value={newP} onChange={(e) => { setNewP(e.target.value); setErr(""); }} />
      </div>
      <div className="field">
        <label className="field-label">{t("confirm_password")}</label>
        <input type="password" className="input" value={confirmP} onChange={(e) => { setConfirmP(e.target.value); setErr(""); }} />
      </div>
      {err ? <div style={{ color: "var(--st-occupied)", fontSize: 12.5, marginTop: 8 }}>{err}</div> : null}
    </Modal>
  );
}

function Sidebar({ active, onNav, role, onLogout, open, onClose }) {
  const { t } = useI18n();
  const { state } = useStore();
  const rolePages = ROLES.find((r) => r.id === role)?.pages || [];

  // Notification counts
  const dirtyCount = state.rooms.filter((r) => r.status === "dirty").length;
  const openMaint = state.maintenance.filter((m) => m.status !== "resolved").length;
  const todayArrivals = state.bookings.filter((b) => b.checkIn === today() && b.status === "confirmed").length;

  const counters = {
    rooms: dirtyCount || null,
    maintenance: openMaint || null,
    bookings: todayArrivals || null
  };

  const renderSection = (sec, label) => {
    const items = NAV_ITEMS.filter((it) => it.section === sec && rolePages.includes(it.id));
    if (!items.length) return null;
    return (
      <React.Fragment key={sec}>
        <div className="sidebar-section-label">{label}</div>
        {items.map((it) =>
        <button key={it.id}
        className={"sidebar-link" + (active === it.id ? " active" : "")}
        onClick={() => onNav(it.id)}>
            <span className="icon"><Icon name={it.icon} size={17} /></span>
            <span>{t(it.key)}</span>
            {counters[it.id] ? <span className="badge">{counters[it.id]}</span> : null}
          </button>
        )}
      </React.Fragment>);

  };

  const handleNav = (id) => {
    onNav(id);
    if (onClose) onClose();
  };

  return (
    <>
      <div className={"sidebar-backdrop" + (open ? " show" : "")} onClick={onClose}></div>
      <aside className={"sidebar" + (open ? " open" : "")}>
        <div className="sidebar-brand">
          <img src="assets/logo.jpg" alt="" />
          <div>
            <div className="name">TN RESORT</div>
            <div className="sub">{t("appSub")}</div>
          </div>
        </div>
        <div className="sidebar-nav">
          {/* override to use handleNav */}
          {[ "ops", "admin" ].map((sec) => {
            const items = NAV_ITEMS.filter((it) => it.section === sec && rolePages.includes(it.id));
            if (!items.length) return null;
            const label = sec === "ops" ? t("nav_section_ops") : t("nav_section_admin");
            return (
              <React.Fragment key={sec}>
                <div className="sidebar-section-label">{label}</div>
                {items.map((it) =>
                  <button key={it.id}
                    className={"sidebar-link" + (active === it.id ? " active" : "")}
                    onClick={() => handleNav(it.id)}>
                    <span className="icon"><Icon name={it.icon} size={17} /></span>
                    <span>{t(it.key)}</span>
                    {counters[it.id] ? <span className="badge">{counters[it.id]}</span> : null}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="sidebar-footer">
          <div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.6)", letterSpacing: ".1em", textTransform: "uppercase" }}>signed in</div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: "#fff", marginTop: 2 }}>
              {t("role_" + role)}
            </div>
          </div>
          {role === "manager" ? <ClearDataButton /> : null}
          <button className="sidebar-link" style={{ padding: "7px 10px", marginTop: 4 }} onClick={onLogout}>
            <span className="icon"><Icon name="logout" size={15} /></span>
            <span>{t("logout")}</span>
          </button>
        </div>
      </aside>
    </>);

}

// Clear data button — manager only, with double confirmation
function ClearDataButton() {
  const { lang } = useI18n();
  const { clearAllData } = useStore();
  return (
    <button
      className="sidebar-link"
      style={{
        padding: "7px 10px",
        marginTop: 4,
        color: "#ffcfc0",
        opacity: .85
      }}
      onClick={clearAllData}
      title={lang === "th" ? "ล้างข้อมูลทั้งหมด (เก็บห้อง+พนักงาน)" : "Clear all data (keep rooms + staff)"}
    >
      <span className="icon"><Icon name="trash" size={15} /></span>
      <span>{lang === "th" ? "ล้างข้อมูล" : "Clear data"}</span>
    </button>
  );
}

function Topbar({ pageId, onMenuClick }) {
  const { t, lang, setLang } = useI18n();
  const page = NAV_ITEMS.find((p) => p.id === pageId);
  const title = page ? t(page.key) : "";
  return (
    <div className="topbar no-print">
      <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="crumbs">TN Resort · {lang === "th" ? "ระบบจัดการ" : "Management"}</div>
        <h1 style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="seg">
          <button className={lang === "th" ? "active" : ""} onClick={() => setLang("th")}>TH</button>
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <Icon name="clock" size={15} />
          <span style={{ fontSize: 12.5, color: "var(--ink-2)" }}>
            {new Date().toLocaleString(lang === "th" ? "th-TH" : "en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>);

}

function AppShell() {
  const [role, setRole] = React.useState(() => localStorage.getItem("tn_role") || null);
  const [page, setPage] = React.useState(() => localStorage.getItem("tn_page") || "dashboard");
  const [tweaksOpen, setTweaksOpen] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { state } = useStore();

  React.useEffect(() => {if (role) localStorage.setItem("tn_role", role);}, [role]);
  React.useEffect(() => {localStorage.setItem("tn_page", page);}, [page]);

  // Tweak edit-mode integration
  const [tweaks, setTweaks] = useTweaks(window.__TN_TWEAKS_DEFAULTS);
  React.useEffect(() => {
    document.documentElement.style.setProperty("--brand", tweaks.brand);
  }, [tweaks.brand]);
  React.useEffect(() => {
    document.body.classList.toggle("density-compact", tweaks.density === "compact");
  }, [tweaks.density]);

  if (!role) return <LoginScreen onLogin={(r) => {setRole(r);setPage(ROLES.find((x) => x.id === r).pages[0]);}} />;

  const rolePages = ROLES.find((r) => r.id === role)?.pages || [];
  const effectivePage = rolePages.includes(page) ? page : rolePages[0];

  const PageComponent = {
    dashboard: DashboardPage,
    rooms: RoomsPage,
    bookings: BookingsPage,
    guests: GuestsPage,
    staff: StaffPage,
    finance: FinancePage,
    maintenance: MaintenancePage
  }[effectivePage] || DashboardPage;

  return (
    <div className="app">
      <Sidebar
        active={effectivePage}
        onNav={setPage}
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {setRole(null);localStorage.removeItem("tn_role");}} />

      <main>
        <Topbar pageId={effectivePage} onMenuClick={() => setSidebarOpen(true)} />
        <div className="page" data-screen-label={"P" + effectivePage} data-comment-anchor="36cb9ba895-div-188-9">
          <PageComponent role={role} setPage={setPage} />
        </div>
      </main>
      <Toasts />
      <TweaksPanelMount tweaks={tweaks} setTweaks={setTweaks} />
    </div>);

}

function TweaksPanelMount({ tweaks, setTweaks }) {
  const { t } = useI18n();
  return (
    <TweaksPanel title={t("tw_title")}>
      <TweakSection label={t("tw_brand")}>
        <TweakColor
          label={t("tw_brand")}
          value={tweaks.brand}
          onChange={(v) => setTweaks("brand", v)}
          options={["#7a9276", "#5a7d8c", "#9b6c52", "#3f5a3e", "#b88a5a", "#7e6d8b"]} />
        
      </TweakSection>
      <TweakSection label={t("tw_density")}>
        <TweakRadio
          label={t("tw_density")}
          value={tweaks.density}
          onChange={(v) => setTweaks("density", v)}
          options={[
          { value: "comfortable", label: t("tw_density_comfortable") },
          { value: "compact", label: t("tw_density_compact") }]
          } />
        
      </TweakSection>
    </TweaksPanel>);

}

function App() {
  return (
    <I18nProvider>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </I18nProvider>);

}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);