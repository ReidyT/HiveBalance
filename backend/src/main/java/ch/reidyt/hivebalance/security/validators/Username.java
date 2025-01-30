package ch.reidyt.hivebalance.security.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = {})
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Pattern(regexp = "^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$")
public @interface Username {
    String message() default "Username must contain only letters, numbers, and separators (.-_), must start and end with an alphanumeric character.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}