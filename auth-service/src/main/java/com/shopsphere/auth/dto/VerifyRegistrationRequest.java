package com.shopsphere.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyRegistrationRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String otp;
}
