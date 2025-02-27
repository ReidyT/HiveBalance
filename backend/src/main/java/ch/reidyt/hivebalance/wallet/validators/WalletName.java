package ch.reidyt.hivebalance.wallet.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = {})
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Pattern(regexp = "^[A-Za-zÀ-ÿα-ωА-Яа-яЁё]+([ ._-][A-Za-zÀ-ÿα-ωА-Яа-яЁё0-9]+)*$")
public @interface WalletName {
    String message() default "Wallet name must contain only letters, numbers, separators (., _, - or space), and begin and end with a letter. No punctuation or spaces before or after the name are allowed.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}