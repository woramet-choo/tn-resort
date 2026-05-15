// === page-receipts.jsx ===
// ReceiptModal — used by Rooms and Guests pages

function ReceiptModal({ open, stay, onClose }) {
  const { t, lang } = useI18n();
  const { state, actions, toast } = useStore();
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    if (open) setConfirmed(false);
  }, [open, stay]);

  if (!open || !stay) return null;

  const room = state.rooms.find(r => r.id === stay.roomId);
  const isActive = stay.status === "active";
  const receiptNo = "TN-" + (stay.id.replace(/\D/g,"").slice(-6).padStart(6,"0"));
  const days = stay.type === "nightly" ? stay.quantity : (stay.type === "monthly" ? stay.quantity + " " + t("months") : stay.quantity + " " + t("hours"));

  const handleCheckOut = () => {
    actions.checkOut(stay.id);
    setConfirmed(true);
    toast(lang==="th"?"เช็คเอาท์เรียบร้อย":"Checked out");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t("rc_title")}
      footer={
        <>
          {isActive && !confirmed ? (
            <button className="btn btn-primary no-print" onClick={handleCheckOut}>
              <Icon name="check" size={14} /> {t("check_out")}
            </button>
          ) : null}
          <button className="btn no-print" onClick={handlePrint}>
            <Icon name="print" size={14} /> {t("print")}
          </button>
          <button className="btn no-print" onClick={onClose}>{t("close")}</button>
        </>
      }
    >
      <div className="receipt-page">
        <div className="receipt-head">
          <div className="row" style={{ gap: 16 }}>
            <img src="assets/logo.jpg" alt="" />
            <div>
              <div className="title">TN Resort Hotel</div>
              <div className="sub">{t("appSub")}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>www.tnresort.example · 02-123-4567</div>
            </div>
          </div>
          <div className="receipt-meta">
            <div style={{ fontSize: 11, color: "#666", letterSpacing: ".1em", textTransform: "uppercase" }}>{t("rc_title")}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{receiptNo}</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>{t("rc_date")}: {fmtDate(today(), lang)}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "#666", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>
              {lang==="th"?"แขกผู้พัก":"Guest"}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{stay.guestName}</div>
            <div style={{ fontSize: 12, color: "#444" }}>{stay.phone}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#666", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 4 }}>
              {t("room")}
            </div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{room ? t(BUILDING_LABELS[room.building]) + " · " + room.label : stay.roomId}</div>
            <div style={{ fontSize: 12, color: "#444" }}>
              {fmtDate(stay.checkIn, lang)} → {fmtDate(stay.actualCheckOut || stay.checkOut, lang)}
            </div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "10px 8px", borderBottom: "2px solid #1a1d19", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#444" }}>
                {lang==="th"?"รายการ":"Description"}
              </th>
              <th style={{ textAlign: "center", padding: "10px 8px", borderBottom: "2px solid #1a1d19", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#444", width: 80 }}>
                {lang==="th"?"จำนวน":"Qty"}
              </th>
              <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "2px solid #1a1d19", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#444", width: 110 }}>
                {t("rate")}
              </th>
              <th style={{ textAlign: "right", padding: "10px 8px", borderBottom: "2px solid #1a1d19", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#444", width: 130 }}>
                {t("amount")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "12px 8px", borderBottom: "1px dashed #ccc" }}>
                {room ? t(BUILDING_LABELS[room.building]) : ""} · {lang==="th"?"ห้อง ":"Room "}{stay.roomId}
                <div style={{ fontSize: 11.5, color: "#666", marginTop: 2 }}>
                  {t(TYPE_LABELS[stay.bedType])} · {t("rate_" + (stay.type === "nightly" ? "nightly" : stay.type === "monthly" ? "monthly" : "temp"))}
                </div>
              </td>
              <td style={{ padding: "12px 8px", borderBottom: "1px dashed #ccc", textAlign: "center", fontFamily: "var(--font-mono)" }}>
                {days}
              </td>
              <td style={{ padding: "12px 8px", borderBottom: "1px dashed #ccc", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                ฿{stay.rate.toLocaleString()}
              </td>
              <td style={{ padding: "12px 8px", borderBottom: "1px dashed #ccc", textAlign: "right", fontFamily: "var(--font-mono)" }}>
                ฿{stay.amount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 14, marginLeft: "auto", width: 280 }}>
          <div className="receipt-line">
            <span>{lang==="th"?"ยอดรวม":"Subtotal"}</span>
            <span className="mono">฿{stay.amount.toLocaleString()}</span>
          </div>
          <div className="receipt-line">
            <span>{t("paid")}</span>
            <span className="mono">฿{(stay.paid || 0).toLocaleString()}</span>
          </div>
          <div className="receipt-total">
            <span>{t("balance")}</span>
            <span className="mono">฿{Math.max(0, stay.amount - (stay.paid || 0)).toLocaleString()}</span>
          </div>
        </div>

        <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #1a1d19", paddingTop: 6, fontSize: 11, color: "#444" }}>
              {lang==="th"?"ลายเซ็นแขกผู้พัก":"Guest signature"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #1a1d19", paddingTop: 6, fontSize: 11, color: "#444" }}>
              {t("rc_signed")}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 30, fontSize: 12, fontStyle: "italic", color: "#666" }}>
          {t("rc_thanks")}
        </div>
      </div>
    </Modal>
  );
}

window.ReceiptModal = ReceiptModal;
