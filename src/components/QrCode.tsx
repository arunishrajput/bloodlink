"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function QrCode({ path, size = 180 }: { path: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const url = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "") + path;
    QRCode.toDataURL(url, { margin: 1, width: size * 2, color: { dark: "#1c1517", light: "#ffffff" } }).then(setSrc);
  }, [path, size]);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} width={size} height={size} alt="QR code to open Find Blood on your phone" className="rounded-xl" />
  ) : (
    <div style={{ width: size, height: size }} className="animate-pulse rounded-xl bg-line" />
  );
}
