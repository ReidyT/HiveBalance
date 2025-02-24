package ch.reidyt.hivebalance.wallet.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(indexes = {
        @Index(name = "idx_wallet_name", columnList = "name"),
        @Index(name = "idx_wallet_currency", columnList = "currency_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 30, unique = true)
    private String name;

    @ManyToOne
    @JoinColumn(name = "currency_code", referencedColumnName = "code", nullable = false)
    private Currency currency;
}
