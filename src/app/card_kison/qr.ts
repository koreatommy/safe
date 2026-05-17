import QRCode from "qrcode";
import { CARD_PUBLIC_URL } from "./constants";

let cachedPng: Buffer | null = null;

export async function getCardQrPng(): Promise<Buffer> {
  if (cachedPng) {
    return cachedPng;
  }

  cachedPng = await QRCode.toBuffer(CARD_PUBLIC_URL, {
    type: "png",
    width: 512,
    margin: 2,
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return cachedPng;
}
