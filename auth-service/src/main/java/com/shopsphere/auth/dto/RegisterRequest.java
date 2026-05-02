package com.shopsphere.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Name is required")
    private String name;

	@NotBlank
    private String email;
    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=]).*$",
        message = "Password must contain uppercase, lowercase, number and special character"
    )
    private String password;
}