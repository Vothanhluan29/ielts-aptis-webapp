from typing import Optional
from app.core.config import settings


def rewrite_static_url(v: Optional[str]) -> Optional[str]:
    """
    Rewrites a static file URL to always use the current BASE_URL from settings.
    This fixes broken media links if the backend domain changes.
    Examples:
      - https://old-domain.com/static/tips/img.png  -> https://new-domain.com/static/tips/img.png
      - /static/tips/img.png                        -> https://new-domain.com/static/tips/img.png
    """
    if not v:
        return v

    # Relative path -> prepend current base URL
    if v.startswith('/static/'):
        return f"{settings.BASE_URL.rstrip('/')}{v}"

    # Absolute URL with old domain -> replace domain
    if '/static/' in v:
        parts = v.split('/static/', 1)
        if len(parts) == 2:
            return f"{settings.BASE_URL.rstrip('/')}/static/{parts[1]}"

    return v
