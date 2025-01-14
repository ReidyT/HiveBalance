package ch.reidyt.hivebalance.healthCheck;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {

    @GetMapping("/health-check")
    public String getHealthyStatus() {
        return "Healthy";
    }

    @GetMapping("/auth-check")
    public String getAuthStatus() {
        return "You're authenticated!";
    }
}
