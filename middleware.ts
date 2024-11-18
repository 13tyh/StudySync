import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ダッシュボードへのアクセスを許可
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    return res;
  }

  // ログイン済みユーザーのログイン/サインアップページへのアクセスをチェック
  if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup') {
    return res;
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};