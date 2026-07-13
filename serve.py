"""
Local dev server that mimics Netlify's pretty_urls behaviour.

Usage:  python serve.py [port]   (default port 5173)

Rules (in order):
  1) /          → index.html
  2) /something → if /something.html exists, serve it
  3) /something/ → if /something/index.html exists, serve it
  4) otherwise → default file lookup (404 if missing)
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlsplit


class PrettyHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Strip query string / fragment from path before resolving
        clean = urlsplit(path).path
        rel = clean.lstrip("/")

        # Empty → let default handler serve index.html
        if rel == "" or rel.endswith("/"):
            return super().translate_path(path)

        # If the literal file exists, serve it as-is
        full = os.path.join(os.getcwd(), rel)
        if os.path.exists(full):
            return super().translate_path(path)

        # Try .html fallback (e.g. /drink → /drink.html)
        if os.path.exists(full + ".html"):
            return super().translate_path("/" + rel + ".html")

        # Try directory index (e.g. /book/ → /book/index.html)
        if os.path.isdir(full):
            return super().translate_path("/" + rel + "/index.html")

        # Nothing matched → default behaviour (likely 404)
        return super().translate_path(path)

    def end_headers(self):
        # Disable caching for local dev so edits show immediately
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quieter log — only show path + status
        sys.stderr.write("%s  %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    host = ""
    print(f"Serving '{os.getcwd()}' on http://localhost:{port}/  (pretty URLs on, cache disabled)")
    try:
        HTTPServer((host, port), PrettyHandler).serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
