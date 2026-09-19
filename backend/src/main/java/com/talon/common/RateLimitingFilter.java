package com.talon.common;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class RateLimitingFilter implements Filter {

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generalBuckets = new ConcurrentHashMap<>();

    private Bucket createBucket(int capacity, Duration refill) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder().capacity(capacity).refillGreedy(capacity, refill).build())
                .build();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String ip = req.getRemoteAddr();
        String uri = req.getRequestURI();

        boolean isLogin = uri.contains("/auth/login");
        Bucket bucket = isLogin 
            ? loginBuckets.computeIfAbsent(ip, k -> createBucket(5, Duration.ofMinutes(1)))
            : generalBuckets.computeIfAbsent(ip, k -> createBucket(120, Duration.ofMinutes(1)));

        if (!bucket.tryConsume(1)) {
            res.setStatus(429);
            res.setContentType("application/json");
            res.setHeader("Retry-After", "60");
            res.getWriter().write("""
                {"type":"about:blank","title":"Too Many Requests","status":429,"detail":"Rate limit exceeded. Try again later."}
                """);
            return;
        }

        chain.doFilter(request, response);
    }
}