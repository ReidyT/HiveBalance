package ch.reidyt.hivebalance.config;

import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Setter
@Component
@ConfigurationProperties(prefix = "security.cors")
public class CorsProperties {
    private String allowedOrigins;

    public String[] getAllowedOrigins() {
        return allowedOrigins.split(",");
    }
}
