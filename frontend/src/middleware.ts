import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only intercept requests directed to /api/
  if (request.nextUrl.pathname.startsWith('/api/')) {
    
    // Get the internal backend URL and the secret from environment variables
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://localhost:8080'; 
    const bffSecret = process.env.BFF_SECRET || 'default-secret-for-dev';

    // Construct the destination URL
    // Client calls: http://localhost:3000/api/products
    // Proxy routes to: http://backend:8080/api/products
    const targetUrl = `${backendUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;

    // Clone headers and inject the BFF secret
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-BFF-Secret', bffSecret);

    // Rewrite the request (proxy it)
    return NextResponse.rewrite(new URL(targetUrl), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Allow all other requests (pages, images, etc.) to proceed normally
  return NextResponse.next();
}

export const config = {
  // Apply middleware only to /api/ routes
  matcher: '/api/:path*',
};
