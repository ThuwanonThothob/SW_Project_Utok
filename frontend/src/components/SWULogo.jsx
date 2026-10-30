export default function SWULogo({ className = "swu-logo", size = 32 }) {
  return (
    <span
      className={className}
      title="ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 8px 3px 6px",
        borderRadius: "999px",
        background: "rgba(255, 255, 255, 0.12)",
        border: "1px solid rgba(255, 255, 255, 0.22)",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.02em",
        verticalAlign: "middle",
        userSelect: "none",
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, borderRadius: "50%", background: "#ffffff", padding: "2px" }}
        aria-label="ตราสัญลักษณ์ มหาวิทยาลัยศรีนครินทรวิโรฒ"
      >
        {/* SWU Circular base */}
        <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#c81e2b" strokeWidth="3" />
        {/* SWU Iconic Growth Curve Graphic (กราฟโค้งสีเทาและสีแดงเอกลักษณ์ มศว) */}
        <path
          d="M 22 74 C 36 74 44 65 52 48 C 58 35 66 22 78 22 C 72 32 66 52 58 64 C 50 78 38 78 22 74 Z"
          fill="#c81e2b"
        />
        <path
          d="M 30 78 C 42 78 50 68 58 52 C 64 39 70 30 80 26 C 74 38 68 58 60 70 C 52 82 40 82 30 78 Z"
          fill="#5a6065"
          opacity="0.85"
        />
        {/* Center node */}
        <circle cx="78" cy="22" r="5" fill="#c81e2b" />
        <circle cx="78" cy="22" r="2.5" fill="#ffffff" />
      </svg>
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.15 }}>
        <b style={{ color: "#ffffff", fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em" }}>มศว</b>
        <small style={{ color: "#fca5a5", fontSize: "8px", fontWeight: 700 }}>SWU CPE</small>
      </span>
    </span>
  );
}
