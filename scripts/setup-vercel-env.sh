#!/bin/bash

# Vercel 환경 변수 설정 스크립트
# 사용법: ./scripts/setup-vercel-env.sh

echo "Vercel 환경 변수 설정을 시작합니다..."

# Supabase 프로젝트 정보
SUPABASE_URL="https://yymjjyzaqthuisdhscoe.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bWpqeXphcXRodWlzZGhzY29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzI2MjYsImV4cCI6MjA4MDE0ODYyNn0.wyn-lnPGUu1c2zRuLKEZRlfomSlu2s3gNylIfSzWyBI"

# Vercel 로그인 확인
if ! vercel whoami &> /dev/null; then
    echo "Vercel에 로그인이 필요합니다. 'vercel login'을 실행해주세요."
    exit 1
fi

# 프로젝트 링크 확인
if ! vercel project ls &> /dev/null; then
    echo "프로젝트를 링크합니다..."
    vercel link --yes
fi

echo "환경 변수를 설정합니다..."

# Production 환경 변수 설정
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Preview 환경 변수 설정
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

# Development 환경 변수 설정
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL development
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development

echo "환경 변수 설정이 완료되었습니다!"
echo "Vercel 대시보드에서 확인하거나 'vercel env ls'로 확인할 수 있습니다."

