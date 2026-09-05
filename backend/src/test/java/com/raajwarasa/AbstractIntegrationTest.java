package com.raajwarasa;

import org.junit.jupiter.api.TestInstance;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * Integration tests run against a dedicated Postgres database (default:
 * localhost:5433/raajwarasa_test). Point TEST_DB_URL at any PostgreSQL
 * instance in CI. A fresh database is expected on each run — flyway creates
 * the schema and the DataSeeder idempotently provisions admin + categories.
 */
@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class AbstractIntegrationTest {

    private static final String DEFAULT_URL = "jdbc:postgresql://localhost:5433/raajwarasa_test";

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> env("TEST_DB_URL", DEFAULT_URL));
        registry.add("spring.datasource.username", () -> env("TEST_DB_USER", "postgres"));
        registry.add("spring.datasource.password", () -> env("TEST_DB_PASSWORD", "password"));
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.sql.init.mode", () -> "never");
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }
}