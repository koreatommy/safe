import Script from "next/script";

export function InsightChatWidget() {
  return (
    <Script
      src="https://playsafe.co.kr/embed/insight-chat.js"
      strategy="lazyOnload"
      data-offset-y="110"
    />
  );
}
