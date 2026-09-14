export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Temporary isolation endpoint: bypass ASSETS completely so we can
    // determine whether the edge removes security headers from a synthetic
    // Worker response after Worker execution.
    if (url.pathname === "/__header-test") {
      return new Response("G-NeMa header isolation test\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-GNeMa-Worker": "active",
          "X-GNeMa-Diag-A": "alpha",
          "X-GNeMa-Diag-B": "beta",
          "X-GNeMa-Diag-C": "gamma",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
          "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https:; img-src 'self' data: https:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https:; upgrade-insecure-requests",
        },
      });
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);

    headers.set("X-GNeMa-Worker", "active");
    headers.set("X-GNeMa-Diag-A", "alpha");
    headers.set("X-GNeMa-Diag-B", "beta");
    headers.set("X-GNeMa-Diag-C", "gamma");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()");
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https:; img-src 'self' data: https:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' https:; upgrade-insecure-requests");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
};
