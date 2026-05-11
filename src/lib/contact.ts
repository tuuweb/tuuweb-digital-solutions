export const WHATSAPP_NUMBER = "573332732672"; // +57 333 273 2672
export const WHATSAPP_DISPLAY = "+57 333 273 2672";
export const INSTAGRAM_URL = "https://www.instagram.com/tuuweb/";
export const INSTAGRAM_HANDLE = "@tuuweb";

export const waLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
