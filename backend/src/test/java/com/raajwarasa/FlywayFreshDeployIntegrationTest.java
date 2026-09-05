package com.raajwarasa;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guarantees a brand-new deployment boots into a populated, consistent catalog.
 * Creates an entirely fresh database, applies Flyway programmatically (exactly
 * what Spring Boot does at startup), then verifies V1 (schema), V3 (categories
 * + artifacts) and V2 (journal) produced the expected rows — independent of any
 * pre-existing database state.
 */
class FlywayFreshDeployIntegrationTest {

    private static final String DEFAULT_HOST = env("TEST_DB_HOST", "localhost:5433");
    private static final String DEFAULT_USER = env("TEST_DB_USER", "postgres");
    private static final String DEFAULT_PASS = env("TEST_DB_PASSWORD", "password");

    @Test
    void freshDatabaseEndsUpWithSeededCatalog() throws Exception {
        String dbName = "raajwarasa_fresh_" + UUID.randomUUID().toString().substring(0, 8);
        String rootUrl = "jdbc:postgresql://" + DEFAULT_HOST + "/postgres";
        String freshUrl = "jdbc:postgresql://" + DEFAULT_HOST + "/" + dbName;

        try (Connection root = DriverManager.getConnection(rootUrl, DEFAULT_USER, DEFAULT_PASS);
             Statement st = root.createStatement()) {
            st.execute("CREATE DATABASE " + dbName);
        }

        try {
            Flyway flyway = Flyway.configure()
                    .dataSource(freshUrl, DEFAULT_USER, DEFAULT_PASS)
                    .load();
            flyway.migrate();

            try (Connection c = DriverManager.getConnection(freshUrl, DEFAULT_USER, DEFAULT_PASS);
                 Statement st = c.createStatement()) {
                assertThat(count(st, "artifacts")).isEqualTo(6);
                assertThat(count(st, "categories")).isEqualTo(5);
                assertThat(count(st, "journal_articles")).isEqualTo(2);

                try (ResultSet featured = st.executeQuery(
                        "SELECT count(*) FROM artifacts WHERE featured = TRUE AND active = TRUE")) {
                    featured.next();
                    assertThat(featured.getInt(1)).isEqualTo(1);
                }
            }
        } finally {
            try (Connection root = DriverManager.getConnection(rootUrl, DEFAULT_USER, DEFAULT_PASS);
                 Statement st = root.createStatement()) {
                st.execute("DROP DATABASE " + dbName);
            }
        }
    }

    private static int count(Statement st, String table) throws Exception {
        try (ResultSet rs = st.executeQuery("SELECT count(*) FROM " + table)) {
            rs.next();
            return rs.getInt(1);
        }
    }

    private static String env(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isBlank() ? fallback : value;
    }
}