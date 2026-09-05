package com.raajwarasa;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
class ApiIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    private static final String ADMIN_USER = "admin";
    private static final String ADMIN_PASS = "rajvarsa@123";

    private String adminToken() throws Exception {
        String body = mapper.writeValueAsString(Map.of("username", ADMIN_USER, "password", ADMIN_PASS));
        MvcResult res = mvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();
        return mapper.readTree(res.getResponse().getContentAsString()).path("token").asText();
    }

    // ---- schema / seed integrity ------------------------------------------------

    @Test
    void flywayMigrationProducedSchemaThatMatchesEntitiesAndSeedsRun() throws Exception {
        mvc.perform(get("/api/public/categories")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(5));

        // V2 demo seed must have populated a fresh database.
        mvc.perform(get("/api/public/artifacts?page=0&size=100")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(6));
        mvc.perform(get("/api/public/artifacts/featured")).andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/public/journal?page=0&size=100")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    // ---- public catalog ----------------------------------------------------------

    @Test
    void allPublicReadEndpointsRespondWithoutAuthentication() throws Exception {
        mvc.perform(get("/api/public/home")).andExpect(status().isOk());
        mvc.perform(get("/api/public/artifacts")).andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.totalElements").isNumber());
        mvc.perform(get("/api/public/artifacts/featured")).andExpect(status().isOk());
        mvc.perform(get("/api/public/artifacts/filters/periods")).andExpect(status().isOk());
        mvc.perform(get("/api/public/artifacts/filters/materials")).andExpect(status().isOk());
        mvc.perform(get("/api/public/journal")).andExpect(status().isOk());
        mvc.perform(get("/api/public/journal/latest")).andExpect(status().isOk());
    }

    @Test
    void unknownSlugsAndMissingUploadsReturn404Not500() throws Exception {
        mvc.perform(get("/api/public/artifacts/slug-that-does-not-exist"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/public/journal/slug-that-does-not-exist"))
                .andExpect(status().isNotFound());
        mvc.perform(get("/uploads/file-that-does-not-exist.png"))
                .andExpect(status().isNotFound());
    }

    // ---- validation ----------------------------------------------------------------

    @Test
    void publicContactAndInquiryRejectInvalidPayloadsWith400() throws Exception {
        String badEmail = mapper.writeValueAsString(Map.of("name", "A", "email", "not-an-email", "message", "hi"));
        mvc.perform(post("/api/public/contact")
                        .contentType(MediaType.APPLICATION_JSON).content(badEmail))
                .andExpect(status().isBadRequest());

        String missingName = mapper.writeValueAsString(Map.of("email", "a@b.com", "message", "hi"));
        mvc.perform(post("/api/public/inquiries")
                        .contentType(MediaType.APPLICATION_JSON).content(missingName))
                .andExpect(status().isBadRequest());
    }

    // ---- auth / admin security -------------------------------------------------------

    @Test
    void adminEndpointsRejectAnonymousAndBogusTokens() throws Exception {
        mvc.perform(get("/api/admin/dashboard")).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/artifacts").header("Authorization", "Bearer bogus.token.value"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminLoginRejectsWrongPassword() throws Exception {
        String body = mapper.writeValueAsString(Map.of("username", ADMIN_USER, "password", "wrong-password"));
        mvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
    }

    // ---- full admin artifact CRUD lifecycle -------------------------------------------

    @Test
    void adminCanCreatePublishUpdateAndDeleteArtifact() throws Exception {
        String token = adminToken();
        MvcResult catRes = mvc.perform(get("/api/public/categories")).andExpect(status().isOk()).andReturn();
        long categoryId = mapper.readTree(catRes.getResponse().getContentAsString()).get(0).path("id").asLong();

        String slug = "it-verify-" + System.currentTimeMillis();
        String createBody = mapper.writeValueAsString(Map.<String, Object>of(
                "name", "Integration Test Artifact",
                "slug", slug,
                "categoryId", categoryId,
                "description", "Temporary object created by the integration suite.",
                "period", "18th Century",
                "material", "Bronze",
                "availability", "IN_COLLECTION",
                "featured", false,
                "active", true
        ));

        MvcResult created = mvc.perform(post("/api/admin/artifacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(slug))
                .andReturn();
        long id = mapper.readTree(created.getResponse().getContentAsString()).path("id").asLong();

        mvc.perform(get("/api/public/artifacts/" + slug)).andExpect(status().isOk());

        String updateBody = mapper.writeValueAsString(Map.<String, Object>of(
                "name", "Integration Test Artifact (updated)",
                "slug", slug,
                "categoryId", categoryId,
                "availability", "IN_COLLECTION",
                "active", true,
                "featured", true
        ));
        mvc.perform(put("/api/admin/artifacts/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.featured").value(true));

        mvc.perform(delete("/api/admin/artifacts/" + id)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mvc.perform(get("/api/public/artifacts/" + slug)).andExpect(status().isNotFound());
    }

    @Test
    void adminCannotCreateArtifactWithoutCategoryOrName() throws Exception {
        String token = adminToken();
        String invalid = "{\"name\":\"\",\"slug\":\"x\",\"categoryId\":null}";
        mvc.perform(post("/api/admin/artifacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest());
    }

    // ---- enquiry lifecycle ------------------------------------------------------------

    @Test
    void publicInquiryAppearsInAdminQueue() throws Exception {
        String name = "Integration Tester " + System.currentTimeMillis();
        String body = mapper.writeValueAsString(Map.of(
                "name", name,
                "email", "tester@example.com",
                "phone", "9999999999",
                "message", "I would like more details about the collection.",
                "source", "COLLECTION"
        ));
        mvc.perform(post("/api/public/inquiries")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        String token = adminToken();
        MvcResult res = mvc.perform(get("/api/admin/inquiries")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andReturn();
        JsonNode items = mapper.readTree(res.getResponse().getContentAsString()).path("content");
        boolean found = false;
        for (JsonNode it : items) {
            if (name.equals(it.path("name").asText())) {
                found = true;
                long id = it.path("id").asLong();
                String statusBody = mapper.writeValueAsString(Map.of("status", "FOLLOW_UP"));
                mvc.perform(put("/api/admin/inquiries/" + id + "/status")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON).content(statusBody))
                        .andExpect(status().isOk());
            }
        }
        assertThat(found).as("inquiry created via public API should appear in admin queue").isTrue();
    }

    // ---- caching --------------------------------------------------------------------------

    @Test
    void publicResponsesAreCacheableAndAdminResponsesAreNot() throws Exception {
        mvc.perform(get("/api/public/home")).andExpect(header().string("Cache-Control", "public, max-age=0, s-maxage=60"));
        mvc.perform(get("/api/public/artifacts")).andExpect(header().string("Cache-Control", "public, max-age=0, s-maxage=60"));
        String token = adminToken();
        mvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + token))
                .andExpect(header().string("Cache-Control", "no-store"));
    }
}