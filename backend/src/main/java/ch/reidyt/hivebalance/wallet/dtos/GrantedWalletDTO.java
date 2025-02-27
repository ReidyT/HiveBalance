package ch.reidyt.hivebalance.wallet.dtos;

import java.util.UUID;

/**
 * DTO representing a wallet that has been granted to a user.
 * Contains a subset of wallet information relevant to the granted permissions like the ID and wallet's name.
 */
public record GrantedWalletDTO(UUID id, String name) {
}
