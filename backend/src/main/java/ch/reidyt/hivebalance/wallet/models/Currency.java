package ch.reidyt.hivebalance.wallet.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(indexes = {@Index(name = "idx_currency_symbol", columnList = "symbol")})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Currency {
    @Id
    @Column(length = 5)
    private String code;

    @Column(nullable = false, length = 5, unique = true)
    private String symbol;
}
