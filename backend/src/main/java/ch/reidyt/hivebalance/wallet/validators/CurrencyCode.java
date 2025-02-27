package ch.reidyt.hivebalance.wallet.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = {})
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Pattern(regexp = "^[A-Za-z0-9]{1,5}$")
public @interface CurrencyCode {
    String message() default "Currency code must contain only letters and must be between 1 and 5 characters.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}