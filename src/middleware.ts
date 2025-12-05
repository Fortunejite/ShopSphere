// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  // handle localhost/dev (lvh.me works too), and apex (example.com)
  // if (host.includes('localhost') || host.startsWith('127.') || host === 'example.com') {
  //   return NextResponse.next();
  // }

  const hostParts = host.split('.');
  if (hostParts.length < 3) {
    return NextResponse.next();
  }
  const subdomain = hostParts[0];

  // skip common hosts
  if (!subdomain || subdomain === 'www' || subdomain === 'app') return NextResponse.next();

  // rewrite to /shops/<subdomain><original-path>
  const url = req.nextUrl.clone();
  url.pathname = `/shops/${subdomain}${req.nextUrl.pathname}`;
  return NextResponse.rewrite(url);
}

// run for all routes except static/_next/api etc
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};