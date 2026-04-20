This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 관리자: 제품 구매 견적서 이메일

`/admin` → 제품 구매 신청 탭에서 **견적서**로 미리보기·발송합니다.

`.env.local`에 다음을 설정하세요 (자세한 키 이름은 [.env.example](.env.example) 참고).

- **Resend**: `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (도메인 검증 전에는 `onboarding@resend.dev` 사용 가능)
- **발신처(견적서 상단)**: `COMPANY_NAME`, `COMPANY_CEO`, `COMPANY_BIZ_NO`, `COMPANY_PHONE`, `COMPANY_ADDRESS`, `COMPANY_EMAIL` — 모두 비어 있지 않아야 미리보기·발송 API가 동작합니다.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
