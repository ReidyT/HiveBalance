package ch.reidyt.hivebalance.healthCheck;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/checks")
public class HealthCheckController {

    @GetMapping("/health")
    public String getHealthyStatus() {
        return "Healthy";
    }

    @GetMapping("/auth")
    public String getAuthStatus(Authentication authentication) {
        return "You are logged as \"" + authentication.getName() + "\".";
    }

    @PostMapping("/csrf")
    public String postMethodName() {
        return "Your CSRF-Token is valid!";
    }

}
