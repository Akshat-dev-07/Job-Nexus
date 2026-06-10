const AUTH_STATE_KEYS = [
  "session",
  "role",
  "name",
  "email",
  "userId",
  "companyName",
  "isVerified",
];

function getAuthStateValue(name) {
  if (!AUTH_STATE_KEYS.includes(name)) return "";
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(name) || "";
  } catch {
    return "";
  }
}

export function getCookie(name) {
  if (typeof document === "undefined") return "";
  const pattern = `(?:^|; )${encodeURIComponent(name)}=`;
  const match = document.cookie.match(new RegExp(pattern + "([^;]*)"));
  if (match) return decodeURIComponent(match[1]);

  // On split frontend/backend domains, browser JS cannot read backend-set cookies.
  return getAuthStateValue(name);
}

export function setCookie(name, value, options = {}) {
  if (typeof document === "undefined") return;

  const {
    path = "/",
    maxAge, // seconds
    expires, // Date
    sameSite = "Lax",
    secure,
  } = options;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value ?? "")}`;
  if (path) cookie += `; Path=${path}`;
  if (typeof maxAge === "number") cookie += `; Max-Age=${maxAge}`;
  if (expires instanceof Date) cookie += `; Expires=${expires.toUTCString()}`;
  if (sameSite) cookie += `; SameSite=${sameSite}`;
  if (secure) cookie += `; Secure`;

  document.cookie = cookie;
}

export function deleteCookie(name, options = {}) {
  setCookie(name, "", { ...options, maxAge: 0 });
}

export function setAuthState(values = {}) {
  if (typeof window === "undefined") return;

  for (const key of AUTH_STATE_KEYS) {
    const next = values[key];
    try {
      if (next === undefined || next === null || next === "") {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, String(next));
      }
    } catch {
      // ignore storage failures
    }
  }
}

export function clearAuthState() {
  if (typeof window === "undefined") return;

  for (const key of AUTH_STATE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore storage failures
    }
  }
}
