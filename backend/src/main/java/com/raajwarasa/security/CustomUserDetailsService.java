package com.raajwarasa.security;

import com.raajwarasa.entity.AdminUser;
import com.raajwarasa.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminUserRepository adminUserRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + username));
        if (!admin.isEnabled()) {
            throw new UsernameNotFoundException("Admin account disabled");
        }
        return new User(
                admin.getUsername(),
                admin.getPasswordHash(),
                List.of(new SimpleGrantedAuthority(admin.getRole()))
        );
    }
}