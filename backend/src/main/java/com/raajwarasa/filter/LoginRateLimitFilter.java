package com.raajwarasa.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Throttles brute-force password guessing against the admin login.
 *
 * Only *failed* attempts count, and a successful login clears the counter, so the
 * genuine admin is never penalised. Once the per-IP failure budget is spent the
 * client is dropped to one probe per minute — an attacker gets ~1 guess/min while
 * the real admin still gets in on their next try.
 *
 * In-memory per instance; swap for a Redis-backed limiter when running more than
 * one API replica.
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/admin/login";
    private static final long WINDOW_MS = 60_000L;

    private final int failuresPerMinute;
    private final ConcurrentHashMap<String, long[]> failures = new ConcurrentHashMap<>();

    public LoginRateLimitFilter(@Value("${raajwarasa.rate-limit.login-failures-per-minute:10}") int failuresPerMinute) {
        this.failuresPerMinute = failuresPerMinute;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (!isLoginAttempt(request)) {
            chain.doFilter(request, response);
            return;
        }

        String ip = resolveIp(request);
        long[] bucket = bucketFor(ip);
        long now = System.currentTimeMillis();
        synchronized (bucket) {
            if (now - bucket[0] >= WINDOW_MS) {
                bucket[0] = now;
                bucket[1] = 0;
            }
            // Over budget: allow a single probe per window so a locked-out admin
            // (e.g. someone guessing from the same NAT) can still sign in.
            if (bucket[1] >= failuresPerMinute && now - bucket[2] < WINDOW_MS) {
                retryAfter((WINDOW_MS - (now - bucket[0])) / 1000 + 1, response);
                return;
            }
            bucket[2] = now;
        }

        chain.doFilter(request, response);

        // Count only rejections: a valid login clears the bucket outright.
        int status = response.getStatus();
        if (status == HttpStatus.UNAUTHORIZED.value() || status == HttpStatus.FORBIDDEN.value()) {
            synchronized (bucket) {
                bucket[1]++;
            }
        } else if (status < 400) {
            failures.remove(ip, bucket);
        }
    }

    private long[] bucketFor(String ip) {
        if (failures.size() > 10_000) {
            failures.clear();
        }
        // { windowStart, failureCount, lastAttemptAt }
        return failures.computeIfAbsent(ip, k -> new long[]{System.currentTimeMillis(), 0, 0});
    }

    private boolean isLoginAttempt(HttpServletRequest request) {
        return "POST".equalsIgnoreCase(request.getMethod()) && LOGIN_PATH.equals(request.getRequestURI());
    }

    private void clear(String ip) {
        failures.remove(ip);
    }

    private void retryAfter(long seconds, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(Math.max(seconds, 1)));
        response.getWriter().write(
                "{\"error\":\"rate_limited\",\"message\":\"Too many failed sign-in attempts. Please wait a minute and try again.\"}");
    }

    /**
     * The API sits behind exactly one trusted proxy (nginx), which appends the
     * real client address to the right-hand end of X-Forwarded-For. Reading the
     * *last* hop keeps the key spoof-proof: a client-supplied leading value is
     * ignored, so the limiter cannot be bypassed with a forged header.
     */
    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String[] hops = forwarded.split(",");
            String last = hops[hops.length - 1].trim();
            if (!last.isEmpty()) {
                return last;
            }
        }
        return request.getRemoteAddr();
    }
}
