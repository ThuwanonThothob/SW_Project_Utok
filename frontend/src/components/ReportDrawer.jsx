import { Bot, ImagePlus, MapPinCheck, Send, Siren, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { analyzeIncidentClient } from "../services/aiTriage.js";

const levels = ["10–30 ซม.", "30–50 ซม.", "50–100 ซม.", "มากกว่า 100 ซม."];

const quickTags = [
  { label: "+ ผู้สูงอายุ/ผู้ป่วยติดเตียง", text: "มีผู้สูงอายุและผู้ป่วยติดเตียงติดอยู่ในบ้าน " },
  { label: "+ ไฟรั่ว/อันตราย", text: "น้ำท่วมใกล้ปลั๊กไฟและมีความเสี่ยงไฟรั่ว " },
  { label: "+ น้ำท่วมมิดหลังคา", text: "น้ำขึ้นเร็วมาก ต้องหนีขึ้นชั้นสอง " },
  { label: "+ รถเล็กผ่านไม่ได้", text: "น้ำท่วมผิวการจราจร รถเล็กไม่สามารถผ่านได้ " },
];

export default function ReportDrawer({ open, coordinate, provinces, userLocation, onClose, onSubmit, busy }) {
  const [level, setLevel] = useState(levels[0]);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (!coordinate || !provinces.length) return;
    const nearest = provinces.reduce((best, item) => {
      const distance = Math.hypot(item.lat - coordinate.lat, item.lng - coordinate.lng);
      return !best || distance < best.distance ? { ...item, distance } : best;
    }, null);
    const resolvedProvince = nearest?.name || provinces[0].name;
    setProvince(resolvedProvince);

    if (userLocation?.districtName) {
      setDistrict(userLocation.districtName);
    } else if (nearest?.district) {
      setDistrict(nearest.district);
    }
  }, [coordinate, provinces, userLocation]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreview("");
      return undefined;
    }
    const objectUrl = URL.createObjectURL(photo);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  const selectedProvinceObj = useMemo(
    () => provinces.find((item) => item.name === province) || provinces[0],
    [provinces, province],
  );

  const liveTriage = useMemo(
    () =>
      analyzeIncidentClient({
        description,
        level,
        province,
        urgent,
        provinceScore: selectedProvinceObj?.score || 50,
      }),
    [description, level, province, urgent, selectedProvinceObj],
  );

  function appendQuickText(snippet) {
    setDescription((prev) => `${prev ? `${prev.trim()} ` : ""}${snippet}`);
  }

  async function submit(event) {
    event.preventDefault();
    const form = new FormData();
    form.append("province", province);
    if (district.trim()) form.append("district", district.trim());
    form.append("level", level);
    form.append("description", description);
    form.append("urgent", String(urgent));
    form.append("lat", String(coordinate.lat));
    form.append("lng", String(coordinate.lng));
    if (photo) form.append("photo", photo);
    if (photoUrl) form.append("photoUrl", photoUrl);
    await onSubmit(form);
    setDescription("");
    setDistrict("");
    setUrgent(false);
    setPhoto(null);
    setPhotoUrl("");
  }

  if (!open || !coordinate) return null;
  const previewSrc = photoPreview || photoUrl;

  return (
    <>
      <button className="overlay" aria-label="ปิดฟอร์ม" onClick={onClose} />
      <aside className="drawer" aria-label="ฟอร์มแจ้งสถานการณ์น้ำท่วม">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">Crowdsourcing + AI Triage</span>
            <h2>แจ้งสถานการณ์น้ำท่วม</h2>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="coordinate">
          <MapPinCheck />
          <div>
            <small>พิกัดที่รายงาน</small>
            <b>
              {coordinate.lat.toFixed(5)}, {coordinate.lng.toFixed(5)}
            </b>
          </div>
        </div>
        <form onSubmit={submit} className="form-stack">
          <fieldset>
            <legend>ระดับน้ำโดยประมาณ</legend>
            <div className="level-grid">
              {levels.map((item) => (
                <label key={item}>
                  <input type="radio" name="level" checked={level === item} onChange={() => setLevel(item)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="report-location-fields">
            <label>
              <span>จังหวัด / พื้นที่</span>
              <select
                value={province}
                onChange={(event) => {
                  const nextProv = event.target.value;
                  setProvince(nextProv);
                  const matched = provinces.find((p) => p.name === nextProv);
                  if (matched?.district) setDistrict(matched.district);
                }}
              >
                {provinces.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name} ({item.district})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>อำเภอ / เขต / ชุมชน</span>
              <input
                type="text"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                placeholder="เช่น อ.เมือง หรือ คลองหลวง"
              />
            </label>
          </div>

          <label>
            <span>รายละเอียดสถานการณ์ (AI วิเคราะห์คำสำคัญอัตโนมัติ)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows="3"
              placeholder="เช่น น้ำเข้าบ้านชั้นแรก มีผู้สูงอายุ รถเล็กไม่สามารถผ่านได้"
            />
          </label>

          <div className="quick-keyword-row">
            <small>
              <Sparkles /> แตะเพื่อเพิ่มข้อมูลฉุกเฉินด่วน:
            </small>
            <div className="quick-keyword-chips">
              {quickTags.map((item) => (
                <button key={item.label} type="button" className="keyword-chip" onClick={() => appendQuickText(item.text)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <section className={`ai-triage-preview ${liveTriage.priority}`} aria-live="polite">
            <div className="ai-triage-head">
              <span>
                <Bot /> <b>AI วิเคราะห์ความรุนแรงและคัดกรองเหตุอัตโนมัติ</b>
              </span>
              <strong className={`triage-pill ${liveTriage.priority}`}>
                {liveTriage.label} · {liveTriage.score}%
              </strong>
            </div>
            <div className="ai-tag-list">
              {liveTriage.tags.map((tag) => (
                <span key={tag} className="ai-tag">
                  {tag}
                </span>
              ))}
            </div>
            <p className="ai-rec-text">
              <b>ข้อเสนอแนะ AI ต่อศูนย์บัญชาการ:</b> {liveTriage.recommendation}
            </p>
          </section>

          <label>
            <span>ภาพประกอบหลักฐาน (ไม่เกิน 5 MB)</span>
            <div className="file-input">
              <ImagePlus />
              <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files[0] || null)} />
            </div>
          </label>

          <label>
            <span>หรือลิงก์ URL รูปภาพ</span>
            <input
              type="url"
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </label>

          {previewSrc && (
            <div className="drawer-photo-preview">
              <img src={previewSrc} alt="ตัวอย่างภาพรายงานน้ำท่วม" />
              <small>ภาพประกอบที่จะแนบไปพร้อมรายงาน</small>
            </div>
          )}

          <label className="urgent-check">
            <input type="checkbox" checked={urgent} onChange={(event) => setUrgent(event.target.checked)} />
            <Siren />
            <span>
              <b>ต้องการความช่วยเหลือเร่งด่วน</b>
              <small>ส่งต่อไปยังศูนย์ประสานงานและยกระดับ AI Triage ทันที</small>
            </span>
          </label>

          <button className="primary-button" disabled={busy}>
            <Send /> {busy ? "กำลังส่ง..." : "ส่งรายงานพร้อมผลวิเคราะห์ AI"}
          </button>
        </form>
      </aside>
    </>
  );
}
