import {faker} from '@faker-js/faker';

const MAX_GEN_ITERATIONS = 100;

function generateString(generator: () => string, maxLength: number) {
  let str = "";
  let i = 0;

  do {
    if (++i > MAX_GEN_ITERATIONS) {
      console.error("Error generating string: " + str + " max length: " + maxLength + " exceeded.");
      break;
    }

    str = generator();
  } while (str.length > maxLength);

  return str;
}

export function generateEmail(maxLength: number = 30) {
  const e = generateString(() => faker.internet.email(), maxLength);
  console.log("Generated email: " + e);
  return e;
}

export function generateUsername(maxUsernameLength: number = 15) {
  const u = generateString(() => faker.internet.username(), maxUsernameLength);
  console.log("Generated username: " + u);
  return u;
}
