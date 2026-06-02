"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // 빌드는 통과시키되, 런타임에서 친절한 에러를 띄움
  console.warn(
    "[supabase] NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다. .env.local 을 확인하세요.",
  );
}

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (_client) return _client;
  _client = createBrowserClient(
    supabaseUrl ?? "https://placeholder.supabase.co",
    supabaseKey ?? "placeholder-anon-key",
  );
  return _client;
}
