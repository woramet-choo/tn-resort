// === data.jsx ===
// Global app state: rooms, stays, guests, staff, attendance, expenses, maintenance, bookings.

// ---------- Room generator ----------
const GREEN_ROOMS = [
  "1102","1103","1104","1105","1106","1107","1108",
  "1201","1202","1203","1204","1205","1206","1207","1208","1209",
];
const TWIN_HOUSES = Array.from({length: 12}, (_, i) => "T" + String(i+1).padStart(2,"0"));
const LOFT_ROOMS = ["2201","2202","2203","2204","2301","2302","2303","2304"];

// Bed configurations available per room number (Green building has multiple configs)
function makeRooms() {
  const rooms = [];
  // Green
  GREEN_ROOMS.forEach((id) => {
    const configs = [{ type: "single", price: 550 }];
    if (["1104","1105","1106"].includes(id)) configs.push({ type: "double", price: 600 });
    if (["1102","1103","1107","1108"].includes(id)) configs.push({ type: "extra", price: 700 });
    rooms.push({
      id, label: id,
      building: "green",
      configs,
      monthlyRate: 5000,
      hourlyRate: 300,
      status: "available",
      note: "",
    });
  });
  // Twin houses
  TWIN_HOUSES.forEach((id, idx) => {
    rooms.push({
      id, label: "บ้านหลังที่ " + (idx+1),
      building: "twin",
      configs: [{ type: "single", price: 600 }],
      monthlyRate: 5500,
      hourlyRate: 350,
      status: "available",
      note: "",
    });
  });
  // Loft
  LOFT_ROOMS.forEach((id) => {
    rooms.push({
      id, label: id,
      building: "loft",
      configs: [{ type: "single", price: 600 }],
      monthlyRate: 5500,
      hourlyRate: 350,
      status: "available",
      note: "",
    });
  });
  return rooms;
}

const DEFAULT_STAFF = [
  { id: "s1", name: "สมชาย ใจดี",   shift: "day",   dailyWage: 400, note: "" },
  { id: "s2", name: "มาลี ขยันงาน",  shift: "day",   dailyWage: 400, note: "" },
  { id: "s3", name: "อรุณ สดใส",     shift: "day",   dailyWage: 400, note: "" },
  { id: "s4", name: "พิมพ์ ดวงดี",   shift: "day",   dailyWage: 400, note: "" },
  { id: "s5", name: "บุญมา ตั้งใจ",  shift: "day",   dailyWage: 400, note: "" },
  { id: "s6", name: "ดาว สว่าง",     shift: "day",   dailyWage: 400, note: "" },
  { id: "s7", name: "น้ำ",          shift: "night", dailyWage: 400, note: "พนักงานกะกลางคืน" },
];

// Date utilities
function ymd(d) {
  if (typeof d === "string") return d;
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function today() { return ymd(new Date()); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate()+n); return ymd(x); }
function fmtDate(d, lang = "th") {
  if (!d) return "—";
  const x = new Date(d);
  if (lang === "th") {
    return x.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
  }
  return x.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}
function fmtBaht(n) {
  if (n == null || isNaN(n)) return "—";
  return "฿" + Math.round(n).toLocaleString("en-US");
}
function diffDays(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / (1000*60*60*24)));
}

// Seed sample data
function seedData() {
  const rooms = makeRooms();
  const t = new Date();
  const stays = [];
  const guests = [];
  const expenses = [];
  const attendance = {};
  const maintenance = [];
  const bookings = [];

  // Helper to seed a guest
  function addGuest(name, phone, idCard) {
    const id = "g" + (guests.length + 1);
    guests.push({ id, name, phone, idCard, history: [] });
    return id;
  }

  // Existing occupants
  const seedOccupants = [
    { roomId: "1103", name: "คุณวิทยา ภักดี", phone: "081-234-5678", idCard: "1-1234-56789-01-2", type: "monthly", checkInDaysAgo: 12, days: 30, paidPct: 1 },
    { roomId: "1201", name: "คุณกัลยา สุขใส",  phone: "086-789-1234", idCard: "1-2345-67890-12-3", type: "nightly", checkInDaysAgo: 1,  days: 3,  paidPct: 1 },
    { roomId: "T03",  name: "คุณธนพล ปานทอง", phone: "098-111-2222", idCard: "1-3456-78901-23-4", type: "monthly", checkInDaysAgo: 5,  days: 30, paidPct: 1 },
    { roomId: "2203", name: "คุณนภา แจ่มจันทร์", phone: "065-888-9999", idCard: "1-5678-90123-45-6", type: "nightly", checkInDaysAgo: 0,  days: 2,  paidPct: 0.5 },
    { roomId: "T07",  name: "คุณอนันต์ กล้าหาญ", phone: "092-555-1111", idCard: "1-6789-01234-56-7", type: "monthly", checkInDaysAgo: 18, days: 30, paidPct: 1 },
  ];

  for (const occ of seedOccupants) {
    const room = rooms.find(r => r.id === occ.roomId);
    if (!room) continue;
    const gid = addGuest(occ.name, occ.phone, occ.idCard);
    const checkIn = addDays(today(), -occ.checkInDaysAgo);
    const checkOut = addDays(checkIn, occ.days);
    let amount = 0;
    if (occ.type === "monthly") amount = room.monthlyRate * Math.ceil(occ.days/30);
    else amount = (room.configs[0].price) * occ.days;
    const stay = {
      id: "stay-" + stays.length,
      roomId: room.id,
      guestId: gid,
      guestName: occ.name,
      phone: occ.phone,
      type: occ.type,
      checkIn, checkOut, actualCheckOut: null,
      bedType: room.configs[0].type,
      rate: occ.type === "monthly" ? room.monthlyRate : room.configs[0].price,
      quantity: occ.days,
      pax: 1,
      amount,
      paid: Math.round(amount * occ.paidPct),
      status: "active",
      note: "",
      createdAt: checkIn,
    };
    stays.push(stay);
    room.status = "occupied";
    guests.find(g => g.id === gid).history.push(stay.id);
  }

  // Set some other statuses
  ["1102","1104","T05"].forEach(rid => {
    const r = rooms.find(x => x.id === rid); if (r) r.status = "dirty";
  });
  ["1205","T11"].forEach(rid => {
    const r = rooms.find(x => x.id === rid); if (r) r.status = "cleaning";
  });
  ["2302"].forEach(rid => {
    const r = rooms.find(x => x.id === rid); if (r) { r.status = "broken"; r.note = "แอร์ไม่เย็น รอช่างมาตรวจ"; }
  });
  // Notes on a few rooms
  const r1106 = rooms.find(r => r.id === "1106"); if (r1106) r1106.note = "ฝักบัวห้องน้ำต้องเปลี่ยน";

  // Past completed stays (for guest history + revenue)
  const pastStays = [
    { roomId: "1106", name: "คุณสุนีย์ รักษ์ดี", days: 2, rate: 550, daysAgo: 3, type: "nightly" },
    { roomId: "1205", name: "คุณเทพ สวัสดี", days: 5, rate: 550, daysAgo: 5, type: "nightly" },
    { roomId: "T01",  name: "คุณภาคิน ดำรง", days: 1, rate: 600, daysAgo: 1, type: "nightly" },
    { roomId: "2201", name: "คุณรัชนี งามใส", days: 4, rate: 600, daysAgo: 6, type: "nightly" },
    { roomId: "1102", name: "คุณจารุณี รื่นรมย์", days: 1, rate: 550, daysAgo: 2, type: "nightly" },
    { roomId: "2204", name: "คุณวีระ สง่างาม", days: 3, rate: 600, daysAgo: 4, type: "nightly" },
    { roomId: "1108", name: "คุณกนกพร พงษ์ภู่", days: 2, rate: 700, daysAgo: 7, type: "nightly" },
    { roomId: "T02",  name: "คุณสมหมาย ใจกล้า", days: 1, rate: 600, daysAgo: 1, type: "nightly" },
    { roomId: "1107", name: "คุณวีรพล จันทร์เพ็ญ", days: 2, rate: 700, daysAgo: 8, type: "nightly" },
    { roomId: "1202", name: "คุณนิภา ยอดยิ่ง", days: 2, rate: 550, daysAgo: 5, type: "nightly" },
  ];
  for (const p of pastStays) {
    const gid = addGuest(p.name, "—", "—");
    const checkOut = addDays(today(), -p.daysAgo);
    const checkIn = addDays(checkOut, -p.days);
    const amount = p.rate * p.days;
    const stay = {
      id: "stay-" + stays.length,
      roomId: p.roomId,
      guestId: gid,
      guestName: p.name,
      phone: "—",
      type: p.type,
      checkIn, checkOut, actualCheckOut: checkOut,
      bedType: "single",
      rate: p.rate,
      quantity: p.days,
      pax: 1,
      amount, paid: amount,
      status: "completed",
      note: "",
      createdAt: checkIn,
    };
    stays.push(stay);
    guests.find(g => g.id === gid).history.push(stay.id);
  }

  // Upcoming bookings
  const futureBookings = [
    { roomId: "1102", name: "คุณนพดล ปลื้มใจ", phone: "081-111-2233", daysFromNow: 2, days: 3, type: "nightly", rate: 550, status: "confirmed" },
    { roomId: "T04",  name: "คุณพรพิมล รุ่งเรือง", phone: "086-444-5566", daysFromNow: 5, days: 2, type: "nightly", rate: 600, status: "confirmed" },
    { roomId: "2202", name: "คุณสุริยา จันทร์งาม", phone: "098-777-8899", daysFromNow: 1, days: 5, type: "nightly", rate: 600, status: "pending" },
    { roomId: "1106", name: "คุณวรรณพร ดำรงค์", phone: "065-222-3344", daysFromNow: 7, days: 2, type: "nightly", rate: 600, status: "confirmed" },
    { roomId: "1209", name: "คุณกฤษณะ ใจเย็น", phone: "092-666-7788", daysFromNow: 3, days: 4, type: "nightly", rate: 550, status: "confirmed" },
  ];
  futureBookings.forEach((b, i) => {
    const checkIn = addDays(today(), b.daysFromNow);
    const checkOut = addDays(checkIn, b.days);
    bookings.push({
      id: "bk-" + (i+1),
      roomId: b.roomId,
      guestName: b.name,
      phone: b.phone,
      type: b.type,
      bedType: "single",
      rate: b.rate,
      checkIn, checkOut,
      pax: 1,
      status: b.status,
      note: "",
    });
  });

  // Expenses
  const expCats = [
    { cat: "utility", note: "ค่าไฟเดือนนี้", amount: 8500, daysAgo: 2 },
    { cat: "supply",  note: "ผ้าปูที่นอน × 12 ชุด", amount: 4200, daysAgo: 4 },
    { cat: "supply",  note: "ของใช้ในห้อง (สบู่ ยาสระผม)", amount: 2300, daysAgo: 6 },
    { cat: "repair",  note: "เปลี่ยนหลอดไฟอาคารเขียว", amount: 1100, daysAgo: 8 },
    { cat: "utility", note: "ค่าน้ำประปา", amount: 3200, daysAgo: 10 },
    { cat: "other",   note: "ค่าโทรศัพท์/อินเทอร์เน็ต", amount: 1500, daysAgo: 12 },
    { cat: "supply",  note: "อุปกรณ์ทำความสะอาด", amount: 1800, daysAgo: 14 },
    { cat: "repair",  note: "ซ่อมแอร์ห้อง 1108", amount: 2500, daysAgo: 15 },
  ];
  expCats.forEach((e, i) => {
    expenses.push({
      id: "ex-" + (i+1),
      date: addDays(today(), -e.daysAgo),
      category: e.cat,
      amount: e.amount,
      note: e.note,
    });
  });

  // Maintenance
  maintenance.push(
    { id: "mt-1", roomId: "2302", issue: "แอร์ไม่เย็น", reportedBy: "น้ำ",     date: addDays(today(), -3), status: "open", cost: 0, note: "" },
    { id: "mt-2", roomId: "1108", issue: "ก๊อกน้ำในห้องน้ำหยด", reportedBy: "มาลี", date: addDays(today(), -1), status: "inprogress", cost: 0, note: "ช่างนัดมาพรุ่งนี้" },
    { id: "mt-3", roomId: "T05",  issue: "ประตูปิดไม่สนิท", reportedBy: "อรุณ", date: addDays(today(), -7), status: "resolved", cost: 350, resolvedDate: addDays(today(), -5), note: "" },
    { id: "mt-4", roomId: "1106", issue: "ฝักบัวต้องเปลี่ยน", reportedBy: "พิมพ์", date: addDays(today(), -2), status: "open", cost: 0, note: "" },
  );

  // Attendance for last 14 days
  for (const s of DEFAULT_STAFF) {
    for (let d = 1; d <= 14; d++) {
      const date = addDays(today(), -d);
      const key = s.id + "_" + date;
      // 90% full day, 5% half day, 5% absent
      const r = Math.random();
      if (r < 0.06) attendance[key] = { status: "absent", clockIn: null, clockOut: null };
      else if (r < 0.12) attendance[key] = { status: "half", clockIn: "08:00", clockOut: "12:30" };
      else {
        if (s.shift === "day") attendance[key] = { status: "full", clockIn: "07:55", clockOut: "17:05" };
        else attendance[key] = { status: "full", clockIn: "17:00", clockOut: "08:05" };
      }
    }
  }

  // Today's attendance — all 6 day-shift workers clocked in
  ["s1","s2","s3","s4","s5","s6"].forEach(sid => {
    attendance[sid + "_" + today()] = { status: "full", clockIn: "08:02", clockOut: null };
  });
  attendance["s7_" + today()] = { status: "full", clockIn: null, clockOut: "08:10" }; // night shift just ended

  // Salary advances per staff (default empty)
  const advances = [];

  return { rooms, stays, guests, staff: DEFAULT_STAFF, attendance, expenses, maintenance, bookings, advances };
}

// ---------- Migration ----------
// Runs on load — fills in missing today-attendance for day-shift staff
// without touching existing records (non-destructive patch).
function migrateState(state) {
  const todayStr = today();
  let att = { ...state.attendance };
  let changed = false;
  for (const s of (state.staff || [])) {
    if (s.shift !== "day") continue;
    const key = s.id + "_" + todayStr;
    if (!att[key]) {
      att[key] = { status: "full", clockIn: "08:02", clockOut: null };
      changed = true;
    }
  }
  // Ensure new field exists
  if (!state.advances) {
    return { ...state, attendance: att, advances: [] };
  }
  return changed ? { ...state, attendance: att } : state;
}

// ---------- Store ----------
const StoreContext = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem("tn_state_v1");
      if (raw) return migrateState(JSON.parse(raw));
    } catch (e) {}
    return seedData();
  });
  const [toasts, setToasts] = React.useState([]);
  const unsubscribeRef = React.useRef(null);
  const skipNextWriteRef = React.useRef(false);   // true when state was just updated from remote
  const writeTimerRef = React.useRef(null);
  const initialLoadDoneRef = React.useRef(false);

  // Load from Firestore and subscribe to real-time updates
  React.useEffect(() => {
    if (!window.subscribeToState) {
      initialLoadDoneRef.current = true;
      return;
    }

    // Load initial state from Firestore
    (async () => {
      try {
        const savedState = await window.getState();
        if (savedState && savedState.rooms && savedState.stays) {
          skipNextWriteRef.current = true;
          setState(migrateState(savedState));
        }
      } catch (e) {
        console.error('Failed to load from Firestore:', e);
      } finally {
        initialLoadDoneRef.current = true;
      }
    })();

    // Subscribe to real-time updates (skip local writes)
    try {
      unsubscribeRef.current = window.subscribeToState((newState) => {
        if (newState && newState.rooms && newState.stays) {
          setState(prev => {
            const newJson = JSON.stringify(newState);
            const prevJson = JSON.stringify(prev);
            if (prevJson !== newJson) {
              skipNextWriteRef.current = true;
              return migrateState(newState);
            }
            return prev;
          });
        }
      });
    } catch (e) {
      console.error('Failed to subscribe to Firestore:', e);
    }

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    };
  }, []);

  // Sync local state to Firestore (debounced, skip if just updated from remote)
  React.useEffect(() => {
    try {
      localStorage.setItem("tn_state_v1", JSON.stringify(state));
    } catch (e) {}

    // Skip if state was just updated from remote subscription
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }

    // Skip if initial load hasn't completed yet
    if (!initialLoadDoneRef.current) return;

    if (window.setState && state.rooms && state.stays) {
      // Debounce: wait 500ms before writing
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      writeTimerRef.current = setTimeout(() => {
        window.setState(state).catch(e => console.error('Firebase sync error:', e));
      }, 500);
    }
  }, [state]);

  // Update helpers
  const update = React.useCallback((fn) => {
    setState(prev => fn({ ...prev }));
  }, []);

  // Toast
  const toast = React.useCallback((msg, kind="success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, kind }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2400);
  }, []);

  const resetData = React.useCallback(() => {
    if (!confirm("รีเซ็ตข้อมูลทั้งหมดเป็นค่าเริ่มต้น?")) return;
    setState(seedData());
    toast("รีเซ็ตข้อมูลเรียบร้อย");
  }, [toast]);

  // Export current state to JSON file
  const exportData = React.useCallback(() => {
    const filename = `tn-resort-backup-${today()}.json`;
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast("สำรองข้อมูลเรียบร้อย · " + filename);
  }, [state, toast]);

  // Import / restore state from a JSON backup file
  const importData = React.useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!imported.rooms || !imported.stays) {
            alert("ไฟล์ไม่ถูกต้อง: ต้องมีข้อมูลห้องและการเข้าพัก");
            return;
          }
          if (!confirm(`นำเข้าข้อมูลจากไฟล์:\n${file.name}\n\nข้อมูลปัจจุบันทั้งหมดจะถูกแทนที่ด้วยข้อมูลในไฟล์\nต้องการดำเนินการต่อไหม?`)) return;
          setState(migrateState(imported));
          toast("นำเข้าข้อมูลเรียบร้อย · " + file.name);
        } catch (err) {
          alert("ไม่สามารถอ่านไฟล์ได้: " + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [toast]);

  // Clear all operational data (keep rooms + staff structure)
  const clearAllData = React.useCallback(() => {
    if (!confirm("ล้างข้อมูลการเข้าพัก/แขก/รายจ่าย/ซ่อมแซมทั้งหมด?\n(ห้องและพนักงานจะคงไว้)\n\nไม่สามารถกู้คืนได้")) return;
    setState(prev => ({
      ...prev,
      stays: [],
      guests: [],
      bookings: [],
      expenses: [],
      maintenance: [],
      advances: [],
      attendance: {},
      // Reset all rooms to available (clear status)
      rooms: prev.rooms.map(r => ({ ...r, status: "available", note: "" })),
    }));
    toast("ล้างข้อมูลเรียบร้อย");
  }, [toast]);

  // ===== Actions =====
  const actions = React.useMemo(() => ({
    setRoomStatus: (roomId, status) => update(s => ({
      ...s, rooms: s.rooms.map(r => r.id === roomId ? { ...r, status } : r),
    })),
    setRoomNote: (roomId, note) => update(s => ({
      ...s, rooms: s.rooms.map(r => r.id === roomId ? { ...r, note } : r),
    })),
    checkIn: (data) => update(s => {
      const stay = {
        id: "stay-" + Date.now(),
        status: "active",
        actualCheckOut: null,
        paid: 0,
        createdAt: today(),
        ...data,
      };
      // Add guest if new (no guestId)
      let guests = s.guests;
      let guestId = data.guestId;
      if (!guestId) {
        guestId = "g" + Date.now();
        guests = [...guests, { id: guestId, name: data.guestName, phone: data.phone, idCard: data.idCard || "—", history: [stay.id] }];
      } else {
        guests = guests.map(g => g.id === guestId ? { ...g, history: [...g.history, stay.id] } : g);
      }
      stay.guestId = guestId;
      return {
        ...s,
        stays: [...s.stays, stay],
        guests,
        rooms: s.rooms.map(r => r.id === data.roomId ? { ...r, status: "occupied" } : r),
      };
    }),
    checkOut: (stayId) => update(s => {
      const stay = s.stays.find(x => x.id === stayId);
      if (!stay) return s;
      return {
        ...s,
        stays: s.stays.map(x => x.id === stayId ? { ...x, status: "completed", actualCheckOut: today(), paid: x.amount } : x),
        rooms: s.rooms.map(r => r.id === stay.roomId ? { ...r, status: "dirty" } : r),
      };
    }),
    cancelStay: (stayId, reason) => update(s => {
      const stay = s.stays.find(x => x.id === stayId);
      if (!stay) return s;
      const now = new Date();
      const cancelledAt = now.toISOString();
      return {
        ...s,
        stays: s.stays.map(x => x.id === stayId ? {
          ...x,
          status: "cancelled",
          cancelReason: reason || "",
          cancelledAt,
          actualCheckOut: today(),
        } : x),
        rooms: s.rooms.map(r => r.id === stay.roomId ? { ...r, status: "available" } : r),
      };
    }),
    addPayment: (stayId, amt) => update(s => ({
      ...s,
      stays: s.stays.map(x => x.id === stayId ? { ...x, paid: Math.min(x.amount, (x.paid||0)+amt) } : x),
    })),
    // Bookings
    addBooking: (b) => update(s => ({
      ...s, bookings: [...s.bookings, { id: "bk-" + Date.now(), status: "confirmed", ...b }],
    })),
    cancelBooking: (id) => update(s => ({
      ...s, bookings: s.bookings.map(b => b.id === id ? { ...b, status: "cancelled" } : b),
    })),
    confirmBooking: (id) => update(s => ({
      ...s, bookings: s.bookings.map(b => b.id === id ? { ...b, status: "confirmed" } : b),
    })),
    bookingToCheckIn: (id) => update(s => {
      const b = s.bookings.find(x => x.id === id);
      if (!b) return s;
      const days = diffDays(b.checkIn, b.checkOut);
      const amount = b.type === "monthly" ? b.rate * Math.ceil(days/30) : b.rate * days;
      const stay = {
        id: "stay-" + Date.now(),
        roomId: b.roomId,
        guestName: b.guestName, phone: b.phone, guestId: "g" + Date.now(),
        type: b.type, bedType: b.bedType || "single", rate: b.rate,
        quantity: days, pax: b.pax || 1,
        checkIn: today(), checkOut: b.checkOut, actualCheckOut: null,
        amount, paid: 0, status: "active", note: b.note, createdAt: today(),
      };
      return {
        ...s,
        stays: [...s.stays, stay],
        guests: [...s.guests, { id: stay.guestId, name: b.guestName, phone: b.phone, idCard: "—", history: [stay.id] }],
        rooms: s.rooms.map(r => r.id === b.roomId ? { ...r, status: "occupied" } : r),
        bookings: s.bookings.filter(x => x.id !== id),
      };
    }),
    // Staff
    setStaff: (id, patch) => update(s => ({
      ...s, staff: s.staff.map(st => st.id === id ? { ...st, ...patch } : st),
    })),
    addStaff: (data) => update(s => ({
      ...s, staff: [...s.staff, { id: "s" + Date.now(), dailyWage: 400, shift: "day", note: "", ...data }],
    })),
    removeStaff: (id) => update(s => ({
      ...s, staff: s.staff.filter(st => st.id !== id),
    })),
    setAttendance: (staffId, date, patch) => update(s => {
      const key = staffId + "_" + date;
      const existing = s.attendance[key] || { status: "absent", clockIn: null, clockOut: null };
      return { ...s, attendance: { ...s.attendance, [key]: { ...existing, ...patch } } };
    }),
    // Salary advances
    addAdvance: (staffId, amount, note) => update(s => ({
      ...s,
      advances: [...(s.advances || []), {
        id: "adv-" + Date.now(),
        staffId, amount: Number(amount) || 0,
        date: today(),
        note: note || "",
        createdAt: new Date().toISOString(),
      }],
    })),
    removeAdvance: (id) => update(s => ({
      ...s, advances: (s.advances || []).filter(a => a.id !== id),
    })),
    // Extend stay — push checkout date and add to amount
    extendStay: (stayId, addQty) => update(s => {
      const stay = s.stays.find(x => x.id === stayId);
      if (!stay || !addQty || addQty < 1) return s;
      let newCheckOut = stay.checkOut;
      let extra = 0;
      if (stay.type === "monthly") {
        newCheckOut = addDays(stay.checkOut, addQty * 30);
        extra = stay.rate * addQty;
      } else if (stay.type === "temp") {
        // Temp = hours
        newCheckOut = stay.checkOut;
        extra = stay.rate * Math.ceil(addQty / 3);
      } else {
        // nightly
        newCheckOut = addDays(stay.checkOut, addQty);
        extra = stay.rate * addQty;
      }
      return {
        ...s,
        stays: s.stays.map(x => x.id === stayId ? {
          ...x,
          checkOut: newCheckOut,
          quantity: x.quantity + addQty,
          amount: x.amount + extra,
        } : x),
      };
    }),
    // Expenses
    addExpense: (e) => update(s => ({
      ...s, expenses: [{ id: "ex-" + Date.now(), ...e }, ...s.expenses],
    })),
    removeExpense: (id) => update(s => ({
      ...s, expenses: s.expenses.filter(e => e.id !== id),
    })),
    // Maintenance
    addMaintenance: (m) => update(s => {
      const item = { id: "mt-" + Date.now(), date: today(), status: "open", cost: 0, ...m };
      let rooms = s.rooms;
      if (m.makeBroken) rooms = rooms.map(r => r.id === m.roomId ? { ...r, status: "broken" } : r);
      return { ...s, maintenance: [item, ...s.maintenance], rooms };
    }),
    updateMaintenance: (id, patch) => update(s => ({
      ...s, maintenance: s.maintenance.map(m => m.id === id ? { ...m, ...patch } : m),
    })),
    resolveMaintenance: (id, cost) => update(s => {
      const m = s.maintenance.find(x => x.id === id);
      if (!m) return s;
      return {
        ...s,
        maintenance: s.maintenance.map(x => x.id === id ? { ...x, status: "resolved", cost: cost || 0, resolvedDate: today() } : x),
        rooms: s.rooms.map(r => r.id === m.roomId && r.status === "broken" ? { ...r, status: "dirty" } : r),
      };
    }),
  }), [update]);

  return (
    <StoreContext.Provider value={{ state, actions, toast, toasts, resetData, clearAllData, exportData, importData }}>
      {children}
    </StoreContext.Provider>
  );
}

const useStore = () => React.useContext(StoreContext);

// ---------- Computed helpers ----------
// Base wage for a day (without OT)
function baseWageForDay(staff, attRecord) {
  if (!attRecord || attRecord.status === "absent") return 0;
  if (attRecord.status === "half") return staff.dailyWage * 0.5;
  return staff.dailyWage;
}

// Total wage including overtime pay
function wageForDay(staff, attRecord) {
  if (!attRecord) return 0;
  const base = baseWageForDay(staff, attRecord);
  const ot = Number(attRecord.otPay) || 0;
  return base + ot;
}

function getWagesInPeriod(state, fromDate, toDate) {
  let total = 0;
  const breakdown = state.staff.map(s => ({ ...s, days: 0, halfDays: 0, absent: 0, otPay: 0, otHours: 0, payable: 0 }));
  const from = new Date(fromDate), to = new Date(toDate);
  for (const s of state.staff) {
    let sum = 0; let days=0, halfDays=0, absent=0, otPay=0, otHours=0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate()+1)) {
      const key = s.id + "_" + ymd(d);
      const a = state.attendance[key];
      if (!a) continue;
      const w = wageForDay(s, a);
      sum += w;
      otPay += Number(a.otPay) || 0;
      otHours += Number(a.otHours) || 0;
      if (a.status === "full") days++;
      else if (a.status === "half") halfDays++;
      else if (a.status === "absent") absent++;
    }
    total += sum;
    const idx = breakdown.findIndex(b => b.id === s.id);
    breakdown[idx] = { ...breakdown[idx], days, halfDays, absent, otPay, otHours, payable: sum };
  }
  return { total, breakdown };
}

// Compute accrued wages (all attendance entries from start of current month up to today)
// and amount already advanced — used to show remaining balance.
function getStaffBalance(state, staffId) {
  const staff = state.staff.find(s => s.id === staffId);
  if (!staff) return { accrued: 0, advanced: 0, balance: 0, advances: [] };
  const n = new Date();
  const first = ymd(new Date(n.getFullYear(), n.getMonth(), 1));
  const todayStr = today();
  // Accrued wages this month
  let accrued = 0;
  for (let d = new Date(first); d <= new Date(todayStr); d.setDate(d.getDate() + 1)) {
    const key = staffId + "_" + ymd(d);
    const a = state.attendance[key];
    if (a) accrued += wageForDay(staff, a);
  }
  // Advances this month
  const advances = (state.advances || []).filter(a => a.staffId === staffId && a.date >= first && a.date <= todayStr);
  const advanced = advances.reduce((s, a) => s + (a.amount || 0), 0);
  return { accrued, advanced, balance: accrued - advanced, advances };
}

function getRevenueInPeriod(state, fromDate, toDate) {
  // Revenue counts stays that ended (actualCheckOut) within range, OR active stays prorated by overlap days.
  // Cancelled stays are excluded.
  let total = 0;
  const byDay = {};
  const items = [];
  for (const s of state.stays) {
    if (s.status === "cancelled") continue;
    const endDate = s.actualCheckOut || s.checkOut;
    if (endDate >= fromDate && endDate <= toDate) {
      total += s.amount;
      byDay[endDate] = (byDay[endDate] || 0) + s.amount;
      items.push(s);
    }
  }
  return { total, byDay, items };
}

function getExpensesInPeriod(state, fromDate, toDate) {
  let total = 0;
  const byCat = {};
  const byDay = {};
  const items = [];
  for (const e of state.expenses) {
    if (e.date >= fromDate && e.date <= toDate) {
      total += e.amount;
      byCat[e.category] = (byCat[e.category] || 0) + e.amount;
      byDay[e.date] = (byDay[e.date] || 0) + e.amount;
      items.push(e);
    }
  }
  return { total, byCat, byDay, items };
}

function hasDateConflict(state, roomId, checkIn, checkOut, excludeId = null) {
  // Returns the conflicting item, or null if no conflict.
  // A conflict exists when: existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
  if (!roomId || !checkIn || !checkOut) return null;
  for (const s of state.stays) {
    if (s.roomId !== roomId) continue;
    if (s.status !== "active") continue;
    if (excludeId && s.id === excludeId) continue;
    if (s.checkIn < checkOut && s.checkOut > checkIn) return { kind: "stay", item: s };
  }
  for (const b of state.bookings) {
    if (b.roomId !== roomId) continue;
    if (b.status === "cancelled") continue;
    if (excludeId && b.id === excludeId) continue;
    if (b.checkIn < checkOut && b.checkOut > checkIn) return { kind: "booking", item: b };
  }
  return null;
}

Object.assign(window, {
  StoreContext, StoreProvider, useStore,
  ymd, today, addDays, fmtDate, fmtBaht, diffDays,
  wageForDay, baseWageForDay, getWagesInPeriod, getRevenueInPeriod, getExpensesInPeriod,
  hasDateConflict, getStaffBalance,
});
