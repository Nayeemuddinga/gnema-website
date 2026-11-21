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

    // Revalidate stable asset URLs rather than disabling their cache entirely.
    // Keep versioned filenames eligible for long immutable caching in future builds.
    const pathname = new URL(request.url).pathname;
    if (/\.(?:css|js)$/i.test(pathname)) {
      headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
      headers.delete('CDN-Cache-Control');
    } else if (pathname.endsWith('.html') || pathname === '/' || !pathname.split('/').pop().includes('.')) {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }

    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
