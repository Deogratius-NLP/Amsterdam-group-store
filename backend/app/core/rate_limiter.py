import time
import threading
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status


def get_client_ip(request: Request) -> str:
    """
    Extracts the true client IP address, supporting Cloudflare, reverse proxies,
    and Vercel/Railway hosting layers.
    """
    # Cloudflare
    cf_connecting_ip = request.headers.get("cf-connecting-ip")
    if cf_connecting_ip:
        return cf_connecting_ip.strip()

    # Standard X-Forwarded-For (client is the first IP in the comma-separated list)
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        parts = [p.strip() for p in x_forwarded_for.split(",") if p.strip()]
        if parts:
            return parts[0]

    # X-Real-IP
    x_real_ip = request.headers.get("x-real-ip")
    if x_real_ip:
        return x_real_ip.strip()

    # Fallback to direct socket connection host
    if request.client and request.client.host:
        return request.client.host

    return "127.0.0.1"


class InMemoryRateLimiter:
    """
    High-performance in-memory sliding-window rate limiter.
    Stores timestamps per (action, ip) and cleans up old entries periodically.
    """

    def __init__(self):
        self._lock = threading.Lock()
        # storage: { (action, ip): [timestamp1, timestamp2, ...] }
        self._records: Dict[Tuple[str, str], List[float]] = {}
        self._last_cleanup: float = time.time()

    def _cleanup_old_records(self, current_time: float):
        """Purge entries older than 1 hour to prevent memory leaks."""
        if current_time - self._last_cleanup < 300:  # Run at most once every 5 minutes
            return
        
        self._last_cleanup = current_time
        expired_keys = []
        for key, timestamps in self._records.items():
            valid_timestamps = [t for t in timestamps if current_time - t < 3600]
            if not valid_timestamps:
                expired_keys.append(key)
            else:
                self._records[key] = valid_timestamps

        for key in expired_keys:
            del self._records[key]

    def check_rate_limit(
        self,
        request: Request,
        action: str,
        max_requests: int,
        window_seconds: int,
        error_message: str
    ):
        """
        Enforces a maximum number of requests for a given action from a client IP
        within a sliding time window (in seconds).
        """
        ip = get_client_ip(request)
        key = (action, ip)
        now = time.time()

        with self._lock:
            self._cleanup_old_records(now)

            timestamps = self._records.get(key, [])
            # Keep only timestamps within the current window
            window_start = now - window_seconds
            valid_timestamps = [t for t in timestamps if t > window_start]

            if len(valid_timestamps) >= max_requests:
                earliest = valid_timestamps[0]
                retry_after = max(1, int(earliest + window_seconds - now))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"{error_message} Please wait {retry_after} seconds before trying again.",
                    headers={"Retry-After": str(retry_after)}
                )

            valid_timestamps.append(now)
            self._records[key] = valid_timestamps


rate_limiter = InMemoryRateLimiter()


def limit_login(request: Request):
    """
    Max 5 login attempts per minute per IP to prevent brute-force attacks.
    """
    rate_limiter.check_rate_limit(
        request=request,
        action="admin_login",
        max_requests=5,
        window_seconds=60,
        error_message="Too many failed login attempts."
    )


def limit_orders(request: Request):
    """
    Max 5 orders per 10 minutes per IP to prevent fake order bombing and cart starvation.
    """
    rate_limiter.check_rate_limit(
        request=request,
        action="submit_order",
        max_requests=5,
        window_seconds=600,
        error_message="Too many order attempts submitted from this device."
    )
