export const DAUM_POSTCODE_SRC = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export const DAUM_POSTCODE_UNAVAILABLE = "주소검색은 인터넷 연결이 필요합니다. 일반 브라우저에서 다시 시도해 주세요.";

type DaumPostcodeResult = {
  zonecode: string;
  roadAddress: string;
  address: string;
};

type DaumPostcodeConstructor = new (options: {
  oncomplete: (data: DaumPostcodeResult) => void;
}) => { open: () => void };

declare global {
  interface Window {
    daum?: { Postcode: DaumPostcodeConstructor };
  }
}

export type SelectedAddress = {
  postcode: string;
  address: string;
};

export function openPostcode(onComplete: (address: SelectedAddress) => void): boolean {
  if (typeof window === "undefined" || !window.daum?.Postcode) return false;

  new window.daum.Postcode({
    oncomplete: (data) => {
      onComplete({
        postcode: data.zonecode,
        address: data.roadAddress || data.address,
      });
    },
  }).open();

  return true;
}
