package com.raajwarasa.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple, dependency-free rate limiter for public write endpoints (enquiry and
 * contact forms) to stop spam and bot floods. Tracks a rolling per-minute count
 * per client IP. Designed for single-instance deployments; for multi-instance,
 * replace with a Redis-backed limiter.
 */
@Component
public class PublicRateLimitFilter extends OncePerRequestFilter {

    private final int perMinute;
    private final ConcurrentHashMap<String, long[]> buckets = new ConcurrentHashMap<>();

    public PublicRateLimitFilter(@Value("${raajwarasa.rate-limit.per-minute:30}") int perMinute) {
        this.perMinute = perMinute;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if ("POST".equalsIgnoreCase(request.getMethod()) && isPublicWrite(request.getRequestURI())) {
            String clientIp = resolveIp(request);
            if (!allow(clientIp)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Too many requests. Please try again shortly.\",\"error\":\"rate_limited\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private boolean isPublicWrite(String path) {
        return path.startsWith("/api/public/inquiries") || path.startsWith("/api/public/contact");
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private boolean allow(String ip) {
        long now = System.currentTimeMillis();
        long windowMs = 60_000L;
        if (buckets.size() > 10_000) {
            buckets.clear();
        }
        long[] slot = buckets.computeIfAbsent(ip, k -> new long[]{now, 0});
        synchronized (slot) {
            if (now - slot[0] >= windowMs) {
                slot[0] = now;
                slot[1] = 0;
            }
            if (slot[1] >= perMinute) {
                return false;
            }
            slot[1]++;
            return true;
        }
    }
}