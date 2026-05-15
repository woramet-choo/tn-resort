// === i18n.jsx ===
// Translation dictionary for Thai + English
const TRANSLATIONS = {
  // Brand
  appName: { th: "TN Resort", en: "TN Resort" },
  appSub: { th: "ระบบจัดการโรงแรม", en: "Hotel Management" },

  // Nav
  nav_dashboard:   { th: "หน้าหลัก", en: "Dashboard" },
  nav_rooms:       { th: "ห้องพัก", en: "Rooms" },
  nav_bookings:    { th: "ปฏิทินจอง", en: "Bookings" },
  nav_guests:      { th: "ประวัติแขก", en: "Guests" },
  nav_staff:       { th: "พนักงาน", en: "Staff" },
  nav_finance:     { th: "การเงิน", en: "Finance" },
  nav_maintenance: { th: "แจ้งซ่อม", en: "Maintenance" },
  nav_section_ops:    { th: "ปฏิบัติการ", en: "Operations" },
  nav_section_admin:  { th: "บริหารจัดการ", en: "Management" },

  // Roles
  role_manager:  { th: "ผู้จัดการ", en: "Manager" },
  role_reception:{ th: "พนักงานต้อนรับ", en: "Receptionist" },
  role_house:    { th: "แม่บ้าน", en: "Housekeeper" },
  role_manager_desc:   { th: "เข้าถึงข้อมูลทั้งหมด รายงาน การเงิน พนักงาน", en: "Full access · finance · reports · staff" },
  role_reception_desc: { th: "เช็คอิน เช็คเอาท์ จัดการห้องและจอง", en: "Check in/out · bookings · guests" },
  role_house_desc:     { th: "ดูสถานะห้อง อัพเดทความสะอาด แจ้งซ่อม", en: "Room status · cleaning · repair reports" },

  // Login
  welcome:        { th: "ยินดีต้อนรับ", en: "Welcome" },
  please_select_role: { th: "เลือกบทบาทเพื่อเข้าสู่ระบบ", en: "Choose a role to continue" },
  enter_password:     { th: "กรอกรหัสผ่านผู้จัดการ", en: "Enter manager password" },
  password:           { th: "รหัสผ่าน", en: "Password" },
  password_wrong:     { th: "รหัสผ่านไม่ถูกต้อง", en: "Incorrect password" },
  change_password:    { th: "เปลี่ยนรหัสผ่าน", en: "Change password" },
  old_password:       { th: "รหัสผ่านปัจจุบัน", en: "Current password" },
  new_password:       { th: "รหัสผ่านใหม่", en: "New password" },
  confirm_password:   { th: "ยืนยันรหัสผ่านใหม่", en: "Confirm new password" },
  password_changed:   { th: "เปลี่ยนรหัสผ่านแล้ว", en: "Password changed" },
  password_mismatch:  { th: "รหัสผ่านใหม่ไม่ตรงกัน", en: "Passwords don't match" },
  back:               { th: "ย้อนกลับ", en: "Back" },

  // Buildings & types
  bldg_green: { th: "ตึกเขียว", en: "Green Building" },
  bldg_twin:  { th: "บ้านแฝด", en: "Twin House" },
  bldg_loft:  { th: "ตึกลอฟ", en: "Loft Building" },
  type_single:   { th: "เตียงเดี่ยว", en: "Single bed" },
  type_double:   { th: "เตียงคู่", en: "Double bed" },
  type_extra:    { th: "เตียงเสริม (3 คน)", en: "Extra bed (3 pax)" },

  // Rates
  rate_nightly:  { th: "รายวัน", en: "Daily" },
  rate_monthly:  { th: "รายเดือน", en: "Monthly" },
  rate_temp:     { th: "ชั่วคราว (3 ชม.)", en: "Temporary (3 hr)" },

  // Statuses
  st_available: { th: "ว่าง", en: "Available" },
  st_occupied:  { th: "มีคนพัก", en: "Occupied" },
  st_dirty:     { th: "ยังไม่ทำความสะอาด", en: "Needs cleaning" },
  st_cleaning:  { th: "กำลังทำความสะอาด", en: "Cleaning" },
  st_broken:    { th: "ชำรุด", en: "Out of order" },
  st_reserved:  { th: "จองล่วงหน้า", en: "Reserved" },

  // Actions
  check_in:    { th: "เช็คอิน", en: "Check in" },
  check_out:   { th: "เช็คเอาท์", en: "Check out" },
  cancel_stay:  { th: "ยกเลิกการเข้าพัก", en: "Cancel check-in" },
  cancel_reason:{ th: "เหตุผลที่ยกเลิก", en: "Cancellation reason" },
  cancel_at:    { th: "ยกเลิกเมื่อ", en: "Cancelled at" },
  st_cancelled: { th: "ยกเลิก", en: "Cancelled" },
  edit:        { th: "แก้ไข", en: "Edit" },
  save:        { th: "บันทึก", en: "Save" },
  cancel:      { th: "ยกเลิก", en: "Cancel" },
  delete:      { th: "ลบ", en: "Delete" },
  add:         { th: "เพิ่ม", en: "Add" },
  add_new:     { th: "เพิ่มใหม่", en: "Add new" },
  print:       { th: "พิมพ์ใบเสร็จ", en: "Print receipt" },
  close:       { th: "ปิด", en: "Close" },
  confirm:     { th: "ยืนยัน", en: "Confirm" },
  search:      { th: "ค้นหา…", en: "Search…" },
  view:        { th: "ดู", en: "View" },
  details:     { th: "รายละเอียด", en: "Details" },
  filter_all:  { th: "ทั้งหมด", en: "All" },

  // Common labels
  guest_name:    { th: "ชื่อแขก", en: "Guest name" },
  phone:         { th: "เบอร์โทร", en: "Phone" },
  id_card:       { th: "เลขบัตรประชาชน", en: "ID card" },
  pax:           { th: "จำนวนผู้พัก", en: "Pax" },
  check_in_date: { th: "วันที่เข้าพัก", en: "Check-in" },
  check_out_date:{ th: "วันที่ออก", en: "Check-out" },
  nights:        { th: "จำนวนคืน", en: "Nights" },
  months:        { th: "จำนวนเดือน", en: "Months" },
  hours:         { th: "จำนวนชั่วโมง", en: "Hours" },
  amount:        { th: "ยอดรวม", en: "Total" },
  paid:          { th: "ชำระแล้ว", en: "Paid" },
  balance:       { th: "คงเหลือ", en: "Balance" },
  note:          { th: "หมายเหตุ", en: "Notes" },
  status:        { th: "สถานะ", en: "Status" },
  rate:          { th: "ราคา", en: "Rate" },
  room:          { th: "ห้อง", en: "Room" },
  room_no:       { th: "หมายเลขห้อง", en: "Room no." },
  building:      { th: "อาคาร", en: "Building" },
  type:          { th: "ประเภท", en: "Type" },
  baht:          { th: "บาท", en: "THB" },
  per_night:     { th: "/คืน", en: "/night" },
  per_month:     { th: "/เดือน", en: "/month" },
  per_3hr:       { th: "/3 ชม.", en: "/3hr" },

  // Dashboard
  d_occupancy:   { th: "อัตราเข้าพัก", en: "Occupancy" },
  d_revenue_today: { th: "รายรับวันนี้", en: "Revenue Today" },
  d_revenue_month: { th: "รายรับเดือนนี้", en: "Revenue This Month" },
  d_arrivals:    { th: "เช็คอินวันนี้", en: "Arrivals Today" },
  d_departures:  { th: "เช็คเอาท์วันนี้", en: "Departures Today" },
  d_room_status: { th: "สถานะห้อง", en: "Room Status" },
  d_today_activity:{ th: "กิจกรรมวันนี้", en: "Today's Activity" },
  d_weekly_revenue:{ th: "รายรับ 7 วันล่าสุด", en: "Last 7 Days" },
  d_quick_actions:{ th: "ทางลัด", en: "Quick Actions" },
  d_recent_stays: { th: "การเข้าพักล่าสุด", en: "Recent Stays" },
  d_repair_alert: { th: "แจ้งซ่อมที่ยังไม่เสร็จ", en: "Open Maintenance" },

  // Rooms page
  r_filter_status: { th: "กรองตามสถานะ", en: "Filter by status" },
  r_filter_bldg:  { th: "อาคาร", en: "Building" },
  r_change_status: { th: "เปลี่ยนสถานะ", en: "Change status" },
  r_set_cleaning: { th: "ตั้งเป็นกำลังทำ", en: "Start cleaning" },
  r_set_clean:    { th: "ทำเสร็จแล้ว", en: "Mark clean" },
  r_set_broken:   { th: "แจ้งชำรุด", en: "Report broken" },
  r_book_in:      { th: "รับเข้าพัก", en: "Check guest in" },
  r_room_note:    { th: "หมายเหตุห้อง", en: "Room notes" },
  r_repair_log:   { th: "ประวัติการซ่อม", en: "Repair history" },
  r_select_rate:  { th: "เลือกอัตราค่าห้อง", en: "Select rate" },
  r_select_bed_config: { th: "เลือกรูปแบบเตียง", en: "Select bed configuration" },

  // Bookings
  b_new:       { th: "จองใหม่", en: "New booking" },
  b_upcoming:  { th: "การจองที่จะมาถึง", en: "Upcoming" },
  b_confirmed: { th: "ยืนยันแล้ว", en: "Confirmed" },
  b_pending:   { th: "รอยืนยัน", en: "Pending" },
  b_cancelled: { th: "ยกเลิก", en: "Cancelled" },

  // Extend stay
  extend_stay: { th: "เพิ่มวันพัก", en: "Extend stay" },
  extend_by:   { th: "เพิ่มจำนวน", en: "Extend by" },
  new_checkout:{ th: "วันที่ออกใหม่", en: "New check-out" },
  extra_amount:{ th: "ค่าใช้จ่ายเพิ่ม", en: "Additional charge" },

  // Staff advance
  s_advance:        { th: "เบิกเงินล่วงหน้า", en: "Salary advance" },
  s_advance_short:  { th: "เบิกล่วงหน้า", en: "Advance" },
  s_balance:        { th: "ยอดคงเหลือ", en: "Balance" },
  s_accrued:        { th: "ค่าแรงสะสม", en: "Accrued wages" },
  s_advance_amount: { th: "จำนวนเงินที่เบิก", en: "Advance amount" },
  s_advance_history:{ th: "ประวัติการเบิก", en: "Advance history" },
  s_advance_too_much:{ th: "จำนวนเงินเกินยอดคงเหลือ", en: "Amount exceeds balance" },
  s_view_calendar:  { th: "ดูปฏิทินรายคน", en: "View per-staff calendar" },
  s_calendar_for:   { th: "ปฏิทินลงเวลาของ", en: "Attendance calendar for" },
  s_select_staff:   { th: "เลือกพนักงาน", en: "Select staff" },
  s_edit_note:      { th: "หมายเหตุการแก้ไข", en: "Edit note" },
  s_edit_required:  { th: "ต้องใส่หมายเหตุการแก้ไข", en: "Edit note required" },
  s_edited_by_manager:{ th: "แก้ไขโดยผู้จัดการ", en: "Edited by manager" },
  s_manager_only:   { th: "เฉพาะผู้จัดการเท่านั้น", en: "Manager only" },

  // Staff
  s_day:       { th: "กะกลางวัน", en: "Day shift" },
  s_night:     { th: "กะกลางคืน", en: "Night shift" },
  s_parttime:  { th: "พาร์ทไทม์", en: "Part-time" },
  s_daily_wage:{ th: "ค่าจ้างรายวัน", en: "Daily wage" },
  s_attendance:{ th: "ลงเวลาเข้าออกงาน", en: "Time clock" },
  s_clock_in:  { th: "เข้างาน", en: "Clock in" },
  s_clock_out: { th: "ออกงาน", en: "Clock out" },
  s_full_day:  { th: "เต็มวัน", en: "Full day" },
  s_half_day:  { th: "ครึ่งวัน", en: "Half day" },
  s_absent:    { th: "ไม่มา", en: "Absent" },
  s_present:   { th: "มาแล้ว", en: "On site" },
  s_payable:   { th: "ค่าแรงสุทธิ", en: "Payable" },
  s_period:    { th: "ช่วงเวลา", en: "Period" },
  s_total_hours: { th: "ชั่วโมงรวม", en: "Total hours" },
  s_today:     { th: "วันนี้", en: "Today" },

  // Finance
  f_revenue:   { th: "รายรับ", en: "Revenue" },
  f_expense:   { th: "ค่าใช้จ่าย", en: "Expenses" },
  f_wages:     { th: "ค่าแรงพนักงาน", en: "Staff wages" },
  f_profit:    { th: "กำไรสุทธิ", en: "Net profit" },
  f_loss:      { th: "ขาดทุน", en: "Loss" },
  f_room_income: { th: "รายรับจากห้องพัก", en: "Room income" },
  f_period_today: { th: "วันนี้", en: "Today" },
  f_period_week:  { th: "7 วัน", en: "7 days" },
  f_period_month: { th: "30 วัน", en: "30 days" },
  f_period_custom: { th: "กำหนดเอง", en: "Custom" },
  f_add_expense: { th: "บันทึกค่าใช้จ่าย", en: "Log expense" },
  f_category:  { th: "หมวด", en: "Category" },
  f_date:      { th: "วันที่", en: "Date" },
  f_breakdown: { th: "รายละเอียดรายรับ", en: "Revenue Breakdown" },
  f_pl:        { th: "กำไร-ขาดทุน", en: "Profit & Loss" },
  cat_utility: { th: "ค่าน้ำ-ค่าไฟ", en: "Utilities" },
  cat_supply:  { th: "อุปกรณ์/วัตถุดิบ", en: "Supplies" },
  cat_repair:  { th: "ค่าซ่อม", en: "Repairs" },
  cat_other:   { th: "อื่นๆ", en: "Other" },

  // Maintenance
  m_issue:     { th: "ปัญหา", en: "Issue" },
  m_reported_by: { th: "ผู้แจ้ง", en: "Reported by" },
  m_open:      { th: "ยังไม่ดำเนินการ", en: "Open" },
  m_inprogress:{ th: "กำลังซ่อม", en: "In progress" },
  m_resolved:  { th: "เสร็จแล้ว", en: "Resolved" },
  m_new_report:{ th: "แจ้งซ่อมใหม่", en: "New report" },
  m_cost:      { th: "ค่าใช้จ่าย", en: "Cost" },

  // Receipt
  rc_title:    { th: "ใบเสร็จรับเงิน", en: "Receipt" },
  rc_no:       { th: "เลขที่ใบเสร็จ", en: "Receipt no." },
  rc_date:     { th: "วันที่", en: "Date" },
  rc_thanks:   { th: "ขอบคุณที่ใช้บริการ TN Resort Hotel", en: "Thank you for staying with us" },
  rc_signed:   { th: "ลายเซ็นผู้รับเงิน", en: "Cashier signature" },

  // Tweaks
  tw_title:    { th: "ปรับแต่ง", en: "Tweaks" },
  tw_brand:    { th: "สีหลักของแบรนด์", en: "Brand color" },
  tw_density:  { th: "ความหนาแน่น", en: "Density" },
  tw_density_comfortable: { th: "สบายตา", en: "Comfortable" },
  tw_density_compact:     { th: "กระชับ", en: "Compact" },

  logout:      { th: "ออกจากระบบ", en: "Sign out" },
};

const I18nContext = React.createContext({ lang: "th", t: (k) => k, setLang: () => {} });

function I18nProvider({ children }) {
  const [lang, setLang] = React.useState(() => localStorage.getItem("tn_lang") || "th");
  React.useEffect(() => { localStorage.setItem("tn_lang", lang); }, [lang]);
  const t = React.useCallback((key) => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry.th || key;
  }, [lang]);
  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
  );
}
const useI18n = () => React.useContext(I18nContext);

Object.assign(window, { I18nContext, I18nProvider, useI18n, TRANSLATIONS });
