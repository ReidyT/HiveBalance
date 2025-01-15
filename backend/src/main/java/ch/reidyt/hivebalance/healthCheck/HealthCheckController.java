package ch.reidyt.hivebalance.healthCheck;

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
    public String getAuthStatus() {
        return "You're authenticated!";
    }

    @PostMapping("/csrf")
    public String postMethodName() {
        return "Your CSRF-Token is valid!";
    }

}
