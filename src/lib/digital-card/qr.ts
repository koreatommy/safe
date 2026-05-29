import QRCode from "qrcode";

const qrCache = new Map<string, Buffer>();

export async function getCardQrPng(publicUrl: string): Promise<Buffer> {
  const cached = qrCache.get(publicUrl);
  if (cached) {
    return cached;
  }

  const png = await QRCode.toBuffer(publicUrl, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  qrCache.set(publicUrl, png);
  return png;
}
