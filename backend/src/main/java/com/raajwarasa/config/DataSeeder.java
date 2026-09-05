package com.raajwarasa.config;

import com.raajwarasa.entity.AdminUser;
import com.raajwarasa.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${raajwarasa.admin.username}")
    private String adminUsername;

    @Value("${raajwarasa.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {
        if (!adminUserRepository.existsByUsername(adminUsername)) {
            AdminUser admin = new AdminUser();
            admin.setUsername(adminUsername);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setDisplayName("Raajwarasa Admin");
            admin.setRole("ROLE_ADMIN");
            adminUserRepository.save(admin);
            log.info("Created default admin user '{}'", adminUsername);
        }
    }
}