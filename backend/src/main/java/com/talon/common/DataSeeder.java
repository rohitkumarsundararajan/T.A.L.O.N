package com.talon.common;

import com.talon.identity.domain.UserAccount;
import com.talon.identity.infra.UserAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserAccountRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String hash = passwordEncoder.encode("Demo@1234");

        seedUserIfMissing("hr@talon.ai", hash, "HR_ADMIN", null);
        seedUserIfMissing("priya@talon.ai", hash, "EMPLOYEE", 1L);
        seedUserIfMissing("arjun@talon.ai", hash, "EMPLOYEE", 2L);
        seedUserIfMissing("kavya@talon.ai", hash, "EMPLOYEE", 3L);
    }

    private void seedUserIfMissing(String email, String passwordHash, String role, Long employeeId) {
        if (!userRepo.existsByEmail(email)) {
            userRepo.save(new UserAccount(email, passwordHash, role, employeeId));
            log.info("Seeded demo user account: {} (role: {})", email, role);
        }
    }
}