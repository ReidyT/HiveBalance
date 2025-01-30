package ch.reidyt.hivebalance.utils;

import ch.reidyt.hivebalance.security.dtos.UserRegistrationDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import net.datafaker.Faker;

import java.util.Random;
import java.util.function.Supplier;

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockUserUtils {
    private static final PasswordPolicy STRONG_PASSWORD_POLICY = PasswordPolicy.builder().build();
    private static final int MAX_GEN_ITERATIONS = 100;
    @Builder.Default
    private int seed = 42;
    private final Faker faker = new Faker(new Random(seed));
    @Builder.Default
    private int maxEmailLength = 30;
    @Builder.Default
    private int maxUsernameLength = 15;

    private String generateString(Supplier<String> generator, int maxLength) {
        var str = "";
        var i = 0;

        do {
            if (++i > MAX_GEN_ITERATIONS) {
                System.err.println("Error generating string: " + str + " max length: " + maxLength + " exceeded.");
                break;
            }

            str = generator.get();
        } while (str.length() > maxLength);

        return str;
    }

    private String generateEmail() {
        var e = generateString(() -> faker.internet().emailAddress(), maxEmailLength);
        System.out.println("Generated email: " + e);
        return e;
    }

    private String generateUsername() {
        var u = generateString(() -> faker.internet().username(), maxUsernameLength);
        System.out.println("Generated username: " + u);
        return u;
    }

    private String generatePassword(PasswordPolicy passwordPolicy) {
        if (passwordPolicy == null) {
            throw new IllegalArgumentException("Password policy is required");
        }

        var p = faker.internet().password(
                passwordPolicy.getMinLength(),
                passwordPolicy.getMaxLength(),
                passwordPolicy.isIncludeUppercase(),
                passwordPolicy.isIncludeSpecialCase(),
                passwordPolicy.isIncludeDigit()
        );
        System.out.println("Generated password: " + p);
        return p;
    }

    public UserRegistrationDTO createRandomUser(PasswordPolicy passwordPolicy) {
        var password = generatePassword(passwordPolicy);
        var email = generateEmail();
        var username = generateUsername();

        return new UserRegistrationDTO(email, username, password);
    }

    public UserRegistrationDTO createRandomUserWithStrongPassword() {
        return createRandomUser(STRONG_PASSWORD_POLICY);
    }

    public MockUserBuilder userBuilder() {
        return userBuilder(STRONG_PASSWORD_POLICY);
    }

    public MockUserBuilder userBuilder(PasswordPolicy passwordPolicy) {
        return new MockUserBuilder(this, passwordPolicy);
    }

    public static class MockUserBuilder {
        private final MockUserUtils mockUserUtils;

        private final PasswordPolicy passwordPolicy;

        private String email;

        private String username;

        private String password;

        private MockUserBuilder(MockUserUtils mockUserUtils, PasswordPolicy passwordPolicy) {
            this.mockUserUtils = mockUserUtils;
            this.passwordPolicy = passwordPolicy;
        }

        public MockUserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public MockUserBuilder username(String username) {
            this.username = username;
            return this;
        }

        public MockUserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserRegistrationDTO build() {
            return new UserRegistrationDTO(
                    email != null ? email : mockUserUtils.generateEmail(),
                    username != null ? username : mockUserUtils.generateUsername(),
                    password != null ? password : mockUserUtils.generatePassword(passwordPolicy)
            );
        }
    }
}
