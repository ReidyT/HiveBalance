const L = "a-zà-ú";
const U = "A-ZÀ-Ú";
const N = "\\d";
const S = "@$!%*?&^#~";
const ALLOWED_CHARS = `${U}${L}${N}${S}`;
export const STRONG_PASSWORD_REGEX = `^(?=.*[${L}])(?=.*[${U}])(?=.*${N})(?=.*[${S}])[${ALLOWED_CHARS}]{8,30}$`;
export const LOWER_CASE = L;
export const UPPER_CASE = U;
export const NUMERIC = N;
export const SPECIAL_CHARS = S;
