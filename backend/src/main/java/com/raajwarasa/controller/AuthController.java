package com.raajwarasa.controller;

import com.raajwarasa.dto.LoginRequest;
import com.raajwarasa.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    @PostMapping("/admin/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException();
        }
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtUtil.generateToken(userDetails);
        return Map.of("success", true, "token", token, "username", userDetails.getUsername());
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class InvalidCredentialsException extends RuntimeException {
    }
}