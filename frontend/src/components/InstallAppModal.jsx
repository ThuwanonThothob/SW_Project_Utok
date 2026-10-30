import { Check, Copy, Download, ExternalLink, Share2, Smartphone, Wifi, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function InstallAppModal({ open, deferredPrompt, onInstallPrompt, onClose }) {
  const [network, setNetwork] = useState({ frontendPort: 5173, backendPort: 4000, lanAddresses: [] });
  const [copiedUrl, setCopiedUrl] = useState("");
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator?.standalone === true;
    setInstalled(Boolean(isStandalone));
    api
      .networkInfo()
      .then((info) => {
        if (info) {
          const ips = Array.isArray(info.lanAddresses)
            ? info.lanAddresses
            : Array.isArray(info.ips)
              ? info.ips
              : [];
          setNetwork({
            ...info,
            lanAddresses: ips,
            frontendPort: info.frontendPort || info.port || 5173,
          });
        }
      })
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const mobileUrls =
    Array.isArray(network.lanUrls) && network.lanUrls.length > 0
      ? network.lanUrls
      : network.lanAddresses.length > 0
        ? network.lanAddresses.map((ip) => `http://${ip}:${network.frontendPort || 5173}`)
        : [currentOrigin];

  async function copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(""), 2500);
    } catch {
      setCopiedUrl(url);
    }
  }

  return (
    <div className="modal-layer">
      <button className="overlay" onClick={onClose} aria-label="ปิด" />
      <section className="modal install-modal">
        <button className="modal-close" onClick={onClose} aria-label="ปิดหน้าต่าง">
          <X />
        </button>
        <span className="modal-icon">
          <Smartphone />
        </span>
        <span className="eyebrow">Mobile Application (PWA)</span>
        <h2>ติดตั้งแอป วารีการ์ด (WareeGuard) ลงมือถือ</h2>
        <p>ใช้งานได้เหมือนแอปพลิเคชันจริง เต็มหน้าจอ (Standalone) พร้อมไอคอนบนหน้าจอโฮมและระบบแจ้งเตือนฉุกเฉิน</p>

        {installed && (
          <div className="install-banner success">
            <Check />
            <div>
              <b>คุณกำลังใช้งานในโหมดแอปพลิเคชันที่ติดตั้งแล้ว</b>
              <small>รองรับการแสดงผลเต็มจอและการแจ้งเตือนฉุกเฉิน</small>
            </div>
          </div>
        )}

        {deferredPrompt && (
          <button type="button" className="primary-button orange install-now-btn" onClick={onInstallPrompt}>
            <Download /> ติดตั้งแอปลงอุปกรณ์นี้ทันที (Install App)
          </button>
        )}

        <div className="install-lan-box">
          <div className="install-lan-head">
            <Wifi />
            <div>
              <b>เปิดบนโทรศัพท์มือถือผ่าน Wi-Fi เดียวกัน</b>
              <small>พิมพ์ลิงก์ด้านล่างใน Safari (iPhone) หรือ Chrome (Android)</small>
            </div>
          </div>
          <div className="install-url-list">
            {mobileUrls.map((url) => (
              <div key={url} className="install-url-row">
                <code>{url}</code>
                <button type="button" className="chip-button" onClick={() => copyUrl(url)}>
                  {copiedUrl === url ? <Check /> : <Copy />}
                  {copiedUrl === url ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="install-guides">
          <article className="install-guide-card">
            <span className="eyebrow">สำหรับ iPhone / iPad (iOS)</span>
            <h3>ติดตั้งผ่าน Safari</h3>
            <ol>
              <li>เปิดลิงก์แอปในเบราว์เซอร์ <b>Safari</b></li>
              <li>
                แตะปุ่ม <b>แชร์ (Share)</b> <Share2 className="inline-icon" /> ด้านล่างหน้าจอ
              </li>
              <li>
                เลื่อนลงแล้วเลือก <b>“เพิ่มไปยังหน้าจอโฮม” (Add to Home Screen)</b>
              </li>
              <li>แตะ <b>เพิ่ม (Add)</b> ที่มุมขวาบน จะได้ไอคอนแอป วารีการ์ด บนหน้าจอมือถือทันที</li>
            </ol>
          </article>

          <article className="install-guide-card">
            <span className="eyebrow">สำหรับ Android / Chrome</span>
            <h3>ติดตั้งผ่าน Google Chrome</h3>
            <ol>
              <li>เปิดลิงก์แอปใน <b>Google Chrome</b></li>
              <li>
                แตะปุ่ม <b>ติดตั้งแอปลงอุปกรณ์นี้ทันที</b> ด้านบน หรือแตะเมนู <b>⋮</b> มุมขวาบน
              </li>
              <li>
                เลือก <b>“ติดตั้งแอป” (Install app)</b> หรือ <b>“เพิ่มลงในหน้าจอหลัก”</b>
              </li>
              <li>กดยืนยันเพื่อติดตั้งเป็นแอปเต็มหน้าจอพร้อมรับแจ้งเตือน</li>
            </ol>
          </article>
        </div>

        <a className="secondary-link-btn" href="/manifest.webmanifest" target="_blank" rel="noreferrer">
          <ExternalLink /> ตรวจสอบไฟล์ Web App Manifest
        </a>
      </section>
    </div>
  );
}
