package com.raajwarasa.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Sets Cache-Control across the API:
 *  - public read endpoints: browsers must always revalidate (so admin edits
 *    appear instantly), while shared/CDN caches may hold a copy for a minute
 *  - uploaded media: an hour (changes are rare and admin-controlled)
 *  - everything else (auth, admin, writes): never cached
 *
 * Spring Security's default `no-cache` header is disabled in SecurityConfig so
 * this filter is the single source of truth for caching.
 */
@Component
public class ApiCacheControlFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String cachePolicy;

        if ("GET".equalsIgnoreCase(request.getMethod()) && path.startsWith("/api/public/")) {
            cachePolicy = "public, max-age=0, s-maxage=60";
        } else if ("GET".equalsIgnoreCase(request.getMethod()) && path.startsWith("/uploads/")) {
            cachePolicy = "public, max-age=3600";
        } else {
            cachePolicy = "no-store";
        }
        response.setHeader("Cache-Control", cachePolicy);

        chain.doFilter(request, response);
    }
}