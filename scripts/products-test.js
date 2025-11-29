import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "15s",
  thresholds: {
    "http_req_duration": ["p(95)<500"],
    "checks": ["rate>0.99"],
  },
};

export function setup() {
  const loginUrl = "http://localhost:3000/api/login";
  const payload = JSON.stringify({ username: "admin", password: "admin" });
  const headers = { "Content-Type": "application/json" };

  const res = http.post(loginUrl, payload, { headers });
  check(res, {
    "login status 201": (r) => r.status === 201,
    "returned accessToken": (r) => {
      try {
        const j = r.json();
        return !!j.accessToken;
      } catch (e) {
        return false;
      }
    },
  });

  const token = res.json().accessToken;
  return { token };
}

export default function (data) {
  const token = data.token;
  const url = "http://localhost:3000/api/products";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const res = http.get(url, { headers });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "content-type json": (r) => r.headers["Content-Type"] && r.headers["Content-Type"].includes("application/json"),
  });

  sleep(1);
}