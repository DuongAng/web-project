package com.library.service;

import com.library.dto.request.LoginRequest;
import com.library.dto.request.RegisterRequest;
import com.library.dto.response.AuthResponse;
import com.library.entity.ActivityLog;
import com.library.entity.Role;
import com.library.entity.User;
import com.library.repository.ActivityLogRepository;
import com.library.repository.RoleRepository;
import com.library.repository.UserRepository;
import com.library.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final ActivityLogRepository activityLogRepository;

    private void logActivity(User user, String action) {
        ActivityLog log = new ActivityLog();
        log.setUser(user);
        log.setAction(action);
        activityLogRepository.save(log);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(email);
        user.setRole(userRole);
        user.setStudentCode(request.getStudentCode());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        userRepository.save(user);

        logActivity(user, "Register a new account");

        // Generate token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().getName());
        String token = jwtUtil.generateToken(user, extraClaims);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().getName());

        return response;
    }

    public AuthResponse login(LoginRequest request) {
        String usernameOrEmail = request.getUsername().trim();

        User user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new RuntimeException("User not found")));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(),
                        request.getPassword()
                )
        );

        User authenticatedUser = (User) authentication.getPrincipal();


        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", authenticatedUser.getRole().getName());
        String token = jwtUtil.generateToken(authenticatedUser, extraClaims);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setType("Bearer");
        response.setId(authenticatedUser.getId());
        response.setUsername(authenticatedUser.getUsername());
        response.setEmail(authenticatedUser.getEmail());
        response.setRole(authenticatedUser.getRole().getName());

        return response;
    }
}