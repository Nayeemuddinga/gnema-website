const HEADERS = {
  "X-GNeMa-Worker": "active",
  "X-GNeMa-Diag-A": "alpha",
  "X-GNeMa-Diag-B": "beta",
  "X-GNeMa-Diag-C": "gamma",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https:; img-src 'self' data: https:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https:; upgrade-insecure-requests"
};

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(HEADERS)) headers.set(name, value);

    // Navigation assets must update immediately after a deployment.
    const pathname = new URL(request.url).pathname;
    if (pathname.endsWith('.css') || pathname.endsWith('.js')) {
      headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      headers.set('CDN-Cache-Control', 'no-store');
    }

    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
