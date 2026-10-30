import { RadioTower, Send, X } from "lucide-react";
import { useState } from "react";

export default function BroadcastModal({ open, provinces, onClose, onSubmit, busy }) {
  const [form, setForm] = useState({ level: "warning", province: "ทั่วประเทศ", headline: "", advisory: "" });
  if (!open) return null;
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm({ level: "warning", province: "ทั่วประเทศ", headline: "", advisory: "" });
  }

  return <div className="modal-layer"><button className="overlay" onClick={onClose} aria-label="ปิด" /><section className="modal broadcast-modal">
    <button className="modal-close" onClick={onClose}><X /></button><span className="modal-icon orange"><RadioTower /></span><span className="eyebrow">Emergency broadcast</span><h2>สร้างประกาศเตือนภัย</h2><p>ประกาศจะถูกส่งไปยัง Citizen portal ผ่าน real-time event</p>
    <form onSubmit={submit} className="form-stack">
      <label><span>ระดับประกาศ</span><select value={form.level} onChange={update("level")}><option value="warning">เฝ้าระวัง</option><option value="red">เตือนภัยสูง</option><option value="evacuation">อพยพ</option></select></label>
      <label><span>พื้นที่เป้าหมาย</span><select value={form.province} onChange={update("province")}><option>ทั่วประเทศ</option>{provinces.map((item) => <option key={item.id}>{item.name}</option>)}</select></label>
      <label><span>หัวข้อประกาศ</span><input value={form.headline} onChange={update("headline")} required placeholder="เช่น เตือนน้ำล้นตลิ่งริมแม่น้ำปิง" /></label>
      <label><span>คำแนะนำประชาชน</span><textarea value={form.advisory} onChange={update("advisory")} required rows="4" placeholder="ระบุสิ่งที่ประชาชนควรปฏิบัติ" /></label>
      <button className="primary-button orange" disabled={busy}><Send /> {busy ? "กำลังส่ง..." : "ส่งประกาศทันที"}</button>
    </form>
  </section></div>;
}
