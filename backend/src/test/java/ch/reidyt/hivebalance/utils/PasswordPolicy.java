package ch.reidyt.hivebalance.utils;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class PasswordPolicy {
    @Builder.Default
    private int minLength = 8;
    @Builder.Default
    private int maxLength = 30;
    @Builder.Default
    private boolean includeUppercase = true;
    @Builder.Default
    private boolean includeSpecialCase = true;
    @Builder.Default
    private boolean includeDigit = true;
}
