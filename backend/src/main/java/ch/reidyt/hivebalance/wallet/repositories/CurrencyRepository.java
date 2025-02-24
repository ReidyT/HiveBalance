package ch.reidyt.hivebalance.wallet.repositories;

import ch.reidyt.hivebalance.wallet.models.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurrencyRepository extends JpaRepository<Currency, String> {
}
