package ch.reidyt.hivebalance.security.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = {})
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
// regex email validation from OWASP: https://owasp.org/www-community/OWASP_Validation_Regex_Repository
@Pattern(regexp = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$")
public @interface Email {
    String message() default "Invalid email format.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
