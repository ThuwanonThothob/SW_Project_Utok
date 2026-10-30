import test from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { createAuthority, createCitizen, findUserByEmail } from "../src/data/repository.js";
import { requireAuthority, signAuthToken } from "../src/middleware/auth.js";
import { registerUserHandler } from "../src/routes/auth.js";

function mockResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
  };
}

test("Citizen account stores a password hash and can be retrieved", async () => {
  const email = `citizen-${Date.now()}@example.com`;
  const password_hash = await bcrypt.hash("secure-pass-123", 12);
  await createCitizen({ name: "Test Citizen", email, password_hash, homeProvince: "เชียงใหม่", homeDistrict: "เมืองเชียงใหม่" });
  const user = await findUserByEmail(email);
  assert.equal(user.role, "citizen");
  assert.notEqual(user.password_hash, "secure-pass-123");
  assert.equal(await bcrypt.compare("secure-pass-123", user.password_hash), true);
});

test("Citizen JWT is rejected by authority middleware", () => {
  const token = signAuthToken({ sub: "citizen-test", name: "Citizen", email: "citizen@example.com", role: "citizen" });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockResponse();
  let nextCalled = false;
  requireAuthority(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});

test("Authority JWT passes authority middleware", () => {
  const token = signAuthToken({ sub: "admin-test", name: "Admin", email: "admin@flood.go.th", role: "authority" });
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = mockResponse();
  let nextCalled = false;
  requireAuthority(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("Authority registration rejects invalid authorityCode with 403", async () => {
  const email = `invalid-auth-${Date.now()}@flood.go.th`;
  const req = {
    body: {
      name: "เจ้าหน้าที่ทดสอบ",
      email,
      password: "authority-pass-123",
      role: "authority",
      authorityCode: "WRONG-CODE",
      agency: "กรมป้องกันและบรรเทาสาธารณภัย",
    },
  };
  const res = mockResponse();
  await registerUserHandler(req, res, (err) => { throw err; });
  assert.equal(res.statusCode, 403);
  assert.match(res.payload.message, /รหัสยืนยันเจ้าหน้าที่ไม่ถูกต้อง/);
  const user = await findUserByEmail(email);
  assert.equal(user, null);
});

test("Authority registration succeeds with valid authorityCode (1784 or SWU-CPE-2026)", async () => {
  const email = `valid-auth-${Date.now()}@flood.go.th`;
  const req = {
    body: {
      name: "เจ้าหน้าที่ ปภ. จังหวัด",
      email,
      password: "authority-pass-123",
      role: "authority",
      authorityCode: "1784",
      agency: "ปภ. พระนครศรีอยุธยา",
      phone: "035-123-456",
      homeProvince: "พระนครศรีอยุธยา",
      homeDistrict: "อ.พระนครศรีอยุธยา",
    },
  };
  const res = mockResponse();
  await registerUserHandler(req, res, (err) => { throw err; });
  assert.equal(res.statusCode, 201);
  assert.ok(res.payload.token);
  assert.equal(res.payload.user.role, "authority");
  assert.equal(res.payload.user.agency, "ปภ. พระนครศรีอยุธยา");
  assert.equal(res.payload.user.phone, "035-123-456");

  const stored = await findUserByEmail(email);
  assert.ok(stored);
  assert.equal(stored.role, "authority");
  assert.equal(stored.agency, "ปภ. พระนครศรีอยุธยา");
});

test("createAuthority helper creates an authority account directly", async () => {
  const email = `direct-auth-${Date.now()}@flood.go.th`;
  const password_hash = await bcrypt.hash("direct-pass-123", 12);
  const created = await createAuthority({
    name: "Direct Authority",
    email,
    password_hash,
    agency: "ศูนย์เตือนภัยพิบัติแห่งชาติ",
    phone: "1784",
  });
  assert.equal(created.role, "authority");
  assert.equal(created.agency, "ศูนย์เตือนภัยพิบัติแห่งชาติ");
});
