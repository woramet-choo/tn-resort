// === firebase-config.jsx ===

const firebaseConfig = {
  apiKey: "AIzaSyDMhkVUFf2b5ILFS4JkgEESMAR5dGs0dSo",
  authDomain: "tn-resort-a2939.firebaseapp.com",
  projectId: "tn-resort-a2939",
  storageBucket: "tn-resort-a2939.appspot.com",
  messagingSenderId: "668100384454",
  appId: "1:668100384454:web:77e6840bac9227455329c7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// Note: offline persistence disabled to avoid stale write queues

// Auth helpers
function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

function signUp(email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

function signIn(email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

function signOut() {
  return auth.signOut();
}

// Use fixed hotel ID (all staff access same data)
const HOTEL_ID = "tn-resort-main";

// Firestore helpers
async function getHotelState() {
  const doc = await db.collection('hotels').doc(HOTEL_ID).get();
  return doc.data() || null;
}

async function setHotelState(state) {
  // Strip out any metadata fields before saving to avoid sync loops
  const { _lastUpdated, _version, ...cleanState } = state;
  await db.collection('hotels').doc(HOTEL_ID).set(cleanState);
}

async function subscribeToHotelState(callback) {
  return db.collection('hotels').doc(HOTEL_ID).onSnapshot((doc) => {
    callback(doc.data() || null);
  });
}

// Backward compatibility (keep old names)
const getState = getHotelState;
const setState = setHotelState;
const subscribeToState = subscribeToHotelState;

Object.assign(window, {
  firebase, auth, db,
  getCurrentUser, signUp, signIn, signOut,
  getState, setState, subscribeToState,
  HOTEL_ID
});
