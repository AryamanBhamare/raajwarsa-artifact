package com.raajwarasa;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Base64;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression tests for the hardening pass: uploads must be real images, and the
 * admin login must be throttled against brute-force guessing.
 */
@AutoConfigureMockMvc
class SecurityHardeningIntegrationTest extends AbstractIntegrationTest {

    private static final String ADMIN_USER = "admin";
    private static final String ADMIN_PASS = "rajvarsa@123";

    /** Smallest valid 1x1 PNG. */
    private static final byte[] TINY_PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @DynamicPropertySource
    static void tightLoginLimit(DynamicPropertyRegistry registry) {
        registry.add("raajwarasa.rate-limit.login-failures-per-minute", () -> "5");
    }

    // ---- upload hardening --------------------------------------------------------------

    @Test
    void uploadRejectsHtmlBecauseItWouldExecuteOnOurOrigin() throws Exception {
        upload("10.0.0.1", "evil.html", "text/html", "<html><body><script>alert(1)</script></body></html>".getBytes())
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadRejectsSvgBecauseSvgCanCarryScript() throws Exception {
        upload("10.0.0.2", "evil.svg", "image/svg+xml",
                "<svg xmlns=\"http://www.w3.org/2000/svg\" onload=\"alert(1)\"/>".getBytes())
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadRejectsImageBytesHiddenBehindANonImageExtension() throws Exception {
        // Real PNG magic bytes, but the name/extension says script — must be refused.
        upload("10.0.0.3", "payload.js", "application/javascript", TINY_PNG)
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadRejectsDisguisedNonImageContentBehindAnImageExtension() throws Exception {
        upload("10.0.0.4", "disguised.png", "image/png",
                "<html><body><script>alert(1)</script></body></html>".getBytes())
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadStillAcceptsRealImages() throws Exception {
        upload("10.0.0.5", "ok.png", "image/png", TINY_PNG)
                .andExpect(status().isOk());
    }

    private org.springframework.test.web.servlet.ResultActions upload(String ip, String name, String type, byte[] content)
            throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("username", ADMIN_USER, "password", ADMIN_PASS)))
                        .header("X-Forwarded-For", ip))
                .andExpect(status().isOk())
                .andReturn();
        String token = mapper.readTree(login.getResponse().getContentAsString()).path("token").asText();
        return mvc.perform(multipart("/api/admin/media/upload")
                .file(new MockMultipartFile("file", name, type, content))
                .header("Authorization", "Bearer " + token)
                .header("X-Forwarded-For", ip));
    }

    // ---- admin login throttling -------------------------------------------------------

    @Test
    void repeatedBadLoginsAreThrottledWith429() throws Exception {
        String body = mapper.writeValueAsString(Map.of("username", ADMIN_USER, "password", "guess"));
        String ip = "10.1.0.1";

        int unauthorized = 0;
        int throttled = 0;
        for (int i = 0; i < 12; i++) {
            int status = mvc.perform(post("/api/auth/admin/login")
                            .contentType(MediaType.APPLICATION_JSON).content(body)
                            .header("X-Forwarded-For", ip))
                    .andReturn().getResponse().getStatus();
            if (status == 429) {
                throttled++;
            } else if (status == 401) {
                unauthorized++;
            }
        }

        if (throttled < 1) {
            throw new AssertionError("expected a 429 once the failed-login budget was spent");
        }
        if (unauthorized < 1) {
            throw new AssertionError("throttle engaged before any failure; legitimate attempts must still be checked");
        }
    }

    @Test
    void successfulLoginIsNotThrottledByTheFilter() throws Exception {
        String body = mapper.writeValueAsString(Map.of("username", ADMIN_USER, "password", ADMIN_PASS));
        for (int i = 0; i < 4; i++) {
            mvc.perform(post("/api/auth/admin/login")
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isOk());
        }
    }

    @Test
    void throttlingCannotBeBypassedByForgingForwardedFor() throws Exception {
        String body = mapper.writeValueAsString(Map.of("username", ADMIN_USER, "password", "guess"));
        String realIp = "203.0.113.9";

        // Spend the whole failure budget from the attacker's real address.
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/admin/login")
                            .contentType(MediaType.APPLICATION_JSON).content(body)
                            .header("X-Forwarded-For", realIp))
                    .andExpect(status().isUnauthorized());
        }

        // Now claim a fresh IP by pre-seeding the header; the proxy-appended hop
        // (the trustworthy one) must still keep the attacker throttled.
        int status = mvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body)
                        .header("X-Forwarded-For", "10.9.9.9, " + realIp))
                .andReturn().getResponse().getStatus();

        if (status != 429) {
            throw new AssertionError("expected 429 despite a spoofed leading X-Forwarded-For, got " + status);
        }
    }
}
