package com.shopsphere.auth.service;

import com.shopsphere.auth.dto.AuthRequest;
import com.shopsphere.auth.dto.AuthResponse;
import com.shopsphere.auth.dto.RegisterRequest;
import com.shopsphere.auth.entity.Role;
import com.shopsphere.auth.entity.User;
import com.shopsphere.auth.repository.UserRepository;
import com.shopsphere.auth.service.impl.AuthServiceImpl;
import com.shopsphere.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("encoded_password")
                .role(Role.USER)
                .build();
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@test.com");
        request.setPassword("password123");

        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        assertDoesNotThrow(() -> authService.register(request));
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@test.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
        when(jwtUtil.generateToken("test@test.com", "USER")).thenReturn("mock_jwt_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
    }

    @Test
    void testLogin_UserNotFound_ThrowsException() {
        AuthRequest request = new AuthRequest();
        request.setEmail("unknown@test.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    void testLogin_InvalidPassword_ThrowsException() {
        AuthRequest request = new AuthRequest();
        request.setEmail("test@test.com");
        request.setPassword("wrongpassword");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrongpassword", "encoded_password")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid credentials", exception.getMessage());
    }
}
