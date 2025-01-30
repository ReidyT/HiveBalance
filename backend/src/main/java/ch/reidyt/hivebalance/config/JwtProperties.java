package ch.reidyt.hivebalance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "security.jwt")
public class JwtProperties {
    private String key;

    private Long expiration;

    private Long refreshTokenExpiration;
}
