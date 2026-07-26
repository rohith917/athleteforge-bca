"""Serve the built React SPA from Django (same-origin deploy)."""
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponse


def _dist() -> Path:
    return Path(settings.FRONTEND_DIST)


def _content_type_for(path: str) -> str:
    content_type = 'application/octet-stream'
    if path.endswith('.js'):
        content_type = 'application/javascript'
    elif path.endswith('.css'):
        content_type = 'text/css'
    elif path.endswith('.svg'):
        content_type = 'image/svg+xml'
    elif path.endswith('.jpg') or path.endswith('.jpeg'):
        content_type = 'image/jpeg'
    elif path.endswith('.png'):
        content_type = 'image/png'
    elif path.endswith('.webp'):
        content_type = 'image/webp'
    return content_type


def serve_frontend_asset(request, path):
    asset = _dist() / 'assets' / path
    if not asset.is_file():
        raise Http404
    return FileResponse(open(asset, 'rb'), content_type=_content_type_for(path))


def serve_frontend_image(request, path):
    image = _dist() / 'images' / path
    if not image.is_file():
        raise Http404
    return FileResponse(open(image, 'rb'), content_type=_content_type_for(path))


def serve_spa(request):
    # Root-level public/ files (favicon.svg, icons.svg, ...) land directly in
    # frontend_dist/ — the catch-all otherwise routes everything except
    # assets/, images/, api/, admin/, static/, media/ to index.html, which
    # would silently serve HTML in place of these files.
    requested = request.path.lstrip('/')
    if requested:
        candidate = _dist() / requested
        if candidate.is_file() and candidate.resolve().parent == _dist().resolve():
            return FileResponse(open(candidate, 'rb'), content_type=_content_type_for(requested))

    index = _dist() / 'index.html'
    if not index.is_file():
        return HttpResponse(
            '<h1>AthleteForge API</h1>'
            '<p>API is running at <a href="/api/auth/csrf/">/api/</a></p>'
            '<p>Frontend build missing — redeploy the backend service.</p>',
            content_type='text/html',
        )
    return FileResponse(open(index, 'rb'), content_type='text/html')