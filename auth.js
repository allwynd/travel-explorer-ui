/* ═══════════════════════════════════════════════════
   TRAVEL EXPLORER — Firebase Google Auth
   Uses the Firebase v10 modular SDK loaded straight from
   the CDN as an ES module — no bundler/npm install needed.
════════════════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// ── Firebase config ──────────────────────────────────────────────────────
// Get these values from: Firebase Console → Project settings → General →
// "Your apps" → Web app → SDK setup and configuration.
const firebaseConfig = {
  apiKey: "AIzaSyAJDp4H3CKmqMH5bObwKB4rdGHJkNNz0vQ",
  authDomain: "travel-explorer-45883.firebaseapp.com",
  projectId: "travel-explorer-45883",
  storageBucket: "travel-explorer-45883.firebasestorage.app",
  messagingSenderId: "612348160099",
  appId: "1:612348160099:web:4e9bfd2ea30c6eb743f056",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

// ── State ────────────────────────────────────────────────────────────────
let currentUser = null;
let currentIdToken = null;

// Keep the cached ID token fresh — Firebase rotates it roughly hourly.
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    currentIdToken = await user.getIdToken();
    renderAuthUI(user);
    window.onUserSignedIn?.(user);   // notify app.js → unlock nav + load data
  } else {
    currentIdToken = null;
    renderAuthUI(null);
    window.onUserSignedOut?.();       // notify app.js → lock nav + show prompt
  }
});

// Refresh the cached token every 50 minutes while signed in.
setInterval(async () => {
  if (auth.currentUser) {
    currentIdToken = await auth.currentUser.getIdToken(true);
  }
}, 50 * 60 * 1000);

// ── Sign in / out ────────────────────────────────────────────────────────
async function signInWithGoogle() {
  const btn = document.getElementById("authBtn");
  const stopBtn = typeof startBtnLoading === "function" ? startBtnLoading(btn, "Signing in…") : () => {};
  try {
    const result = await signInWithPopup(auth, googleProvider);
    currentIdToken = await result.user.getIdToken();
    if (typeof showToast === "function") showToast(`Welcome, ${result.user.displayName || result.user.email}`, "success");
  } catch (err) {
    console.error("Google sign-in failed:", err);
    if (typeof showToast === "function") showToast("Sign-in failed: " + err.message, "error");
  } finally {
    stopBtn();
  }
}

async function signOutUser() {
  try {
    await signOut(auth);
    if (typeof showToast === "function") showToast("Signed out", "info");
  } catch (err) {
    console.error("Sign-out failed:", err);
  }
}

// ── UI ───────────────────────────────────────────────────────────────────
function renderAuthUI(user) {
  const el = document.getElementById("authArea");
  if (!el) return;

  if (user) {
    el.innerHTML = `
      <div class="auth-user">
        <img class="auth-avatar" src="${user.photoURL || ''}" alt="" onerror="this.style.display='none'" />
        <div class="auth-user-info">
          <div class="auth-user-name">${escapeHtml(user.displayName || user.email || 'User')}</div>
          <button class="auth-signout-btn" id="authBtn" onclick="signOutUser()">Sign out</button>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <button class="auth-signin-btn" id="authBtn" onclick="signInWithGoogle()">
        <svg width="16" height="16" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92A8.78 8.78 0 0 0 17.64 9.2z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
        Sign in with Google
      </button>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ── Authenticated fetch wrapper ─────────────────────────────────────────
// Drop-in replacement for fetch() that attaches the Firebase ID token.
// Usage: authFetch(`${API_BASE}/trips`, { method: 'POST', body: ... })
async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (currentIdToken) {
    headers.set("Authorization", `Bearer ${currentIdToken}`);
  }
  return fetch(url, { ...options, headers });
}

function getCurrentUser() {
  return currentUser;
}

// Expose what the rest of app.js (a non-module script) needs on window,
// since app.js can't `import` this module directly.
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.authFetch = authFetch;
window.getCurrentUser = getCurrentUser;