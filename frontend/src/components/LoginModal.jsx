import { Building2, KeyRound, LockKeyhole, LogIn, Mail, MapPin, Phone, ShieldCheck, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function LoginModal({ open, intent = "citizen", provinces, onClose, onLogin, onRegister, busy }) {
  const [roleIntent, setRoleIntent] = useState(intent);
  const [view, setView] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    homeProvince: "กรุงเทพมหานคร",
    homeDistrict: "",
    agency: "",
    authorityCode: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setRoleIntent(intent);
    setView("login");
    setError("");
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      homeProvince: provinces?.[0]?.name || "กรุงเทพมหานคร",
      homeDistrict: "",
      agency: "",
      authorityCode: "",
    });
  }, [open, intent, provinces]);

  if (!open) return null;

  const authority = roleIntent === "authority";
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  function switchView(nextView) {
    setView(nextView);
    setError("");
    setForm((prev) => ({
      ...prev,
      email: "",
      password: "",
    }));
  }

  function switchRole(nextRole) {
    setRoleIntent(nextRole);
    setError("");
    setForm((prev) => ({
      ...prev,
      email: "",
      password: "",
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (view === "register") {
        await onRegister({
          ...form,
          role: authority ? "authority" : "citizen",
        });
      } else {
        await onLogin(form.email, form.password, roleIntent);
      }
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <div className="modal-layer">
      <button className="overlay" onClick={onClose} aria-label="ปิด" />
      <section className="modal member-modal">
        <button className="modal-close" onClick={onClose} aria-label="ปิดหน้าต่าง">
          <X />
        </button>
        <span className="modal-icon">{authority ? <ShieldCheck /> : view === "register" ? <UserPlus /> : <LogIn />}</span>
        <span className="eyebrow">{authority ? "Authority Command Access" : "Citizen Membership"}</span>
        <h2>
          {authority
            ? view === "register"
              ? "ลงทะเบียนเจ้าหน้าที่ใหม่"
              : "เข้าสู่ระบบเจ้าหน้าที่"
            : view === "register"
              ? "สมัครสมาชิกประชาชน"
              : "เข้าสู่ระบบประชาชน"}
        </h2>
        <p>
          {authority
            ? "สำหรับเจ้าหน้าที่รัฐ ปภ. และหน่วยกู้ภัย เพื่อบริหารจัดการสถานการณ์และออกประกาศเตือนภัย"
            : "สมัครสมาชิกจริงด้วยอีเมลของคุณ เพื่อแจ้งเหตุน้ำท่วม บันทึกพื้นที่บ้าน และรับการแจ้งเตือน"}
        </p>

        <div className="auth-role-pills" role="group" aria-label="เลือกประเภทบัญชี">
          <button type="button" className={!authority ? "active" : ""} onClick={() => switchRole("citizen")}>
            บัญชีประชาชน
          </button>
          <button type="button" className={authority ? "active" : ""} onClick={() => switchRole("authority")}>
            บัญชีเจ้าหน้าที่
          </button>
        </div>

        <div className="auth-tabs">
          <button type="button" className={view === "login" ? "active" : ""} onClick={() => switchView("login")}>
            เข้าสู่ระบบ
          </button>
          <button type="button" className={view === "register" ? "active" : ""} onClick={() => switchView("register")}>
            สมัครสมาชิกจริง
          </button>
        </div>

        <form onSubmit={submit} className="form-stack">
          {view === "register" && (
            <label>
              <span>{authority ? "ชื่อ–นามสกุลเจ้าหน้าที่" : "ชื่อ–นามสกุล"}</span>
              <div className="input-icon">
                <UserPlus />
                <input
                  value={form.name}
                  onChange={update("name")}
                  required
                  minLength="2"
                  placeholder={authority ? "กรอกชื่อ–นามสกุลเจ้าหน้าที่" : "กรอกชื่อ–นามสกุลจริง"}
                />
              </div>
            </label>
          )}

          <label>
            <span>อีเมล</span>
            <div className="input-icon">
              <Mail />
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                required
                placeholder={authority ? "officer@agency.go.th" : "you@example.com"}
              />
            </div>
          </label>

          <label>
            <span>รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)</span>
            <div className="input-icon">
              <LockKeyhole />
              <input
                type="password"
                value={form.password}
                onChange={update("password")}
                required
                minLength="8"
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
            </div>
          </label>

          {view === "register" && !authority && (
            <>
              <label>
                <span>เบอร์โทรศัพท์ติดต่อกลับ (ไม่บังคับ)</span>
                <div className="input-icon">
                  <Phone />
                  <input value={form.phone} onChange={update("phone")} placeholder="08x-xxx-xxxx" />
                </div>
              </label>
              <div className="profile-grid">
                <label>
                  <span>จังหวัดที่พักอาศัย</span>
                  <select value={form.homeProvince} onChange={update("homeProvince")}>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>เขต / อำเภอ</span>
                  <div className="input-icon">
                    <MapPin />
                    <input value={form.homeDistrict} onChange={update("homeDistrict")} required placeholder="ระบุเขต/อำเภอ" />
                  </div>
                </label>
              </div>
            </>
          )}

          {view === "register" && authority && (
            <div className="profile-grid">
              <label>
                <span>หน่วยงานต้นสังกัด</span>
                <div className="input-icon">
                  <Building2 />
                  <input value={form.agency} onChange={update("agency")} required placeholder="เช่น ปภ. / เทศบาล" />
                </div>
              </label>
              <label>
                <span>รหัสยืนยันหน่วยงาน</span>
                <div className="input-icon">
                  <KeyRound />
                  <input value={form.authorityCode} onChange={update("authorityCode")} required placeholder="กรอกรหัสยืนยันหน่วยงาน" />
                </div>
              </label>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" disabled={busy}>
            {view === "register" ? <UserPlus /> : <LogIn />}
            {busy
              ? "กำลังดำเนินการ..."
              : view === "register"
                ? authority
                  ? "ยืนยันลงทะเบียนเจ้าหน้าที่"
                  : "สร้างบัญชีประชาชน"
                : authority
                  ? "เข้าสู่ศูนย์บัญชาการ"
                  : "เข้าสู่ระบบประชาชน"}
          </button>
        </form>
      </section>
    </div>
  );
}
