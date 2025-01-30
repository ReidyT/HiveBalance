package ch.reidyt.hivebalance.security.tasks;

import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import ch.reidyt.hivebalance.security.repositories.TokenRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TokenScheduledTasks {

    private Logger logger = LoggerFactory.getLogger(TokenScheduledTasks.class);

    private final TokenRepository tokenRepository;

    @Scheduled(cron = "0 0 0 1 * ?", zone = "Europe/Zurich")
    public void cleanInvalidTokens() {
        logger.info("Start cleaning the token table.");
        var removedRows = tokenRepository.deleteInvalidTokens(Instant.now());
        logger.info("Cleaning task done. " + removedRows + " row(s) deleted.");
    }
}
