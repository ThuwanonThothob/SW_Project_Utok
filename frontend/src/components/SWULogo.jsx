export default function SWULogo({ className = "swu-logo", size = 36 }) {
  return (
    <span
      className={className}
      title="คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "3px 10px 3px 4px",
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
      <img
        src="/swu-eng-logo.jpg"
        alt="ตราสัญลักษณ์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยศรีนครินทรวิโรฒ"
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: "contain",
          borderRadius: "50%",
          flexShrink: 0,
          background: "#ffffff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        }}
      />
      <span className="swu-logo-text" style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.15 }}>
        <b style={{ color: "#ffffff", fontSize: "11px", fontWeight: 800, letterSpacing: "0.04em" }}>วิศวฯ มศว</b>
        <small style={{ color: "#fca5a5", fontSize: "8px", fontWeight: 700 }}>SWU ENG</small>
      </span>
    </span>
  );
}
