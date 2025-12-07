import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // 一時的に認証チェックを無効化してテスト
    console.log('Middleware:', req.nextUrl.pathname)
    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
