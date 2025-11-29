import http from "k6/http";
import { check, sleep, fail } from "k6";

export const options = {
  vus: 10,
  duration: "15s",
  thresholds: {
    "http_req_duration": ["p(95)<500"],
    "checks": ["rate>0.99"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const USERNAME = __ENV.USERNAME || "admin";
const PASSWORD = __ENV.PASSWORD || "admin";

/**
 * If TOKEN is provided via env (set TOKEN=...), use it and skip login.
 * This makes running "k6 run scripts/customers-test.js" simple if you already have token.
 */
export function setup() {
  // 1) if TOKEN env exists, use it directly
  if (__ENV.TOKEN && __ENV.TOKEN.trim() !== "") {
    console.log("Using TOKEN from environment, skipping login.");
    return { token: __ENV.TOKEN.trim() };
  }

  // 2) Otherwise try login automatically
  const loginUrl = `${BASE_URL}/api/login`;
  console.log("No TOKEN env found — attempting login at:", loginUrl);

  const payload = JSON.stringify({ username: USERNAME, password: PASSWORD });
  const params = { headers: { "Content-Type": "application/json", Accept: "application/json" } };

  const maxAttempts = 3;
  let lastRes = null;
  for (let i = 0; i < maxAttempts; i++) {
    lastRes = http.post(loginUrl, payload, params);
    console.log(`login attempt ${i + 1} -> status: ${lastRes.status}, body: ${lastRes.body}`);

    if (lastRes && (lastRes.status === 201 || lastRes.status === 200)) {
      try {
        const j = lastRes.json();
        if (j && j.accessToken) {
          console.log("Login OK - token length:", j.accessToken.length);
          return { token: j.accessToken };
        } else {
          console.log("Login response did not include accessToken:", lastRes.body);
        }
      } catch (e) {
        console.log("Failed to parse login json:", e, "body:", lastRes.body);
      }
    }

    sleep(1);
  }

  console.error("Setup login failed - last response:", lastRes && lastRes.status, lastRes && lastRes.body);
  fail("Setup login failed - stopping k6 run");
}

export default function (data) {
  const token = data.token;
  const url = `${BASE_URL}/api/customers`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = http.get(url, { headers });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "content-type is json": (r) =>
      r.headers["Content-Type"] && r.headers["Content-Type"].includes("application/json"),
  });

  sleep(1);
}