-- 제품 구매신청(안전점검 도구 랜딩) 접수 테이블
CREATE TABLE IF NOT EXISTS public.safe_inspect_tool_product_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  organization TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 9999),
  discount_eligible BOOLEAN NOT NULL DEFAULT false,
  request_note TEXT,
  privacy_agreed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.safe_inspect_tool_product_orders IS 'inspect_tool 랜딩 제품 구매신청 접수';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.customer_name IS '주문자 이름';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.organization IS '소속(기관/업체)';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.phone IS '연락처';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.email IS '이메일';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.quantity IS '주문 수량';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.discount_eligible IS '10개 이상 시 할인 안내 대상 여부';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.request_note IS '요청사항(선택)';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.privacy_agreed IS '개인정보 수집 동의';
COMMENT ON COLUMN public.safe_inspect_tool_product_orders.status IS '처리 상태';

CREATE INDEX IF NOT EXISTS idx_inspect_tool_product_orders_created_at
  ON public.safe_inspect_tool_product_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspect_tool_product_orders_status
  ON public.safe_inspect_tool_product_orders (status);

ALTER TABLE public.safe_inspect_tool_product_orders ENABLE ROW LEVEL SECURITY;

-- 공개 폼: anon/authenticated 는 INSERT 만 가능 (타인 행 조회 불가)
CREATE POLICY "Allow anon insert on safe_inspect_tool_product_orders"
  ON public.safe_inspect_tool_product_orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
