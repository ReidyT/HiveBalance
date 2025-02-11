import {render, screen} from '@testing-library/angular';

import {PasswordHelperComponent} from './passwordhelper.component';

const DATA_TEST_IDS = {
  LOWER: 'helper-lowercase',
  UPPER: 'helper-uppercase',
  NUMBER: 'helper-numeric',
  SPECIAL: 'helper-special',
  MIN: 'helper-min',
  MAX: 'helper-max',
};

const CLASS_LIST = {
  VALID: 'pi-check',
  INVALID: 'pi-times',
}

const expectIsValid = (dataTestId: string) => {
  expect(screen.getByTestId(dataTestId).classList.contains(CLASS_LIST.VALID)).toBeTruthy();
}

const expectIsInValid = (dataTestId: string) => {
  expect(screen.getByTestId(dataTestId).classList.contains(CLASS_LIST.INVALID)).toBeTruthy();
}

describe('PasswordHelperComponent', () => {
  [
    {
      name: 'strong password should be valid',
      password: 'P@sswOrd123',
      expectValidList: [
        DATA_TEST_IDS.MAX,
        DATA_TEST_IDS.LOWER,
        DATA_TEST_IDS.UPPER,
        DATA_TEST_IDS.NUMBER,
        DATA_TEST_IDS.SPECIAL,
        DATA_TEST_IDS.MIN,
      ],
      expectInvalidList: [],
    },
    {
      name: 'empty password should not be valid except for the max length',
      password: '',
      expectValidList: [DATA_TEST_IDS.MAX],
      expectInvalidList: [
        DATA_TEST_IDS.LOWER,
        DATA_TEST_IDS.UPPER,
        DATA_TEST_IDS.NUMBER,
        DATA_TEST_IDS.SPECIAL,
        DATA_TEST_IDS.MIN,
      ],
    },
    {
      name: 'too long strong password should be invalid',
      password: 'P@sswOrd123ButTooMuchLongTheMaxIs30', // Max password length is 30
      expectValidList: [
        DATA_TEST_IDS.LOWER,
        DATA_TEST_IDS.UPPER,
        DATA_TEST_IDS.NUMBER,
        DATA_TEST_IDS.SPECIAL,
        DATA_TEST_IDS.MIN,
      ],
      expectInvalidList: [DATA_TEST_IDS.MAX],
    },
    {
      name: 'too short password should be invalid',
      password: 'M1nP@wd', // Min password length is 8
      expectValidList: [
        DATA_TEST_IDS.LOWER,
        DATA_TEST_IDS.UPPER,
        DATA_TEST_IDS.NUMBER,
        DATA_TEST_IDS.SPECIAL,
        DATA_TEST_IDS.MAX,
      ],
      expectInvalidList: [DATA_TEST_IDS.MIN],
    },
    {
      name: 'missing lowercase should be invalid',
      password: 'P@SSWORD123$',
      expectValidList: [
        DATA_TEST_IDS.UPPER,
        DATA_TEST_IDS.NUMBER,
        DATA_TEST_IDS.SPECIAL,
        DATA_TEST_IDS.MAX,
        DATA_TEST_IDS.MIN,
      ],
      expectInvalidList: [DATA_TEST_IDS.LOWER],
    },
    {
      name: 'missing uppercase should be invalid',
      password: 'p@ssword123',
      expectValidList: [
        DATA_TEST_IDS.LOWER,
        DATA_TEST_IDS.NUMBER,
        DATA_TEST_IDS.SPECIAL,
        DATA_TEST_IDS.MAX,
        DATA_TEST_IDS.MIN,
      ],
      expectInvalidList: [DATA_TEST_IDS.UPPER],
    },
    {
      name: 'missing numeric should be invalid',
      password: 'P@ssword',
      expectValidList: [
        DATA_TEST_IDS.LOWER,
        DATA_TEST_IDS.UPPER,
        DATA_TEST_IDS.SPECIAL,
        DATA_TEST_IDS.MAX,
        DATA_TEST_IDS.MIN,
      ],
      expectInvalidList: [DATA_TEST_IDS.NUMBER],
    },
    {
      name: 'missing special char should be invalid',
      password: 'Password123',
      expectValidList: [
        DATA_TEST_IDS.LOWER,
        DATA_TEST_IDS.UPPER,
        DATA_TEST_IDS.NUMBER,
        DATA_TEST_IDS.MAX,
        DATA_TEST_IDS.MIN,
      ],
      expectInvalidList: [DATA_TEST_IDS.SPECIAL],
    }
  ].forEach(({name, password, expectValidList, expectInvalidList}) => {
    it(name, async () => {
      await render(PasswordHelperComponent, {
        inputs: {
          password: password,
        }
      });

      for (const expectInValid of expectInvalidList) {
        expectIsInValid(expectInValid);
      }

      for (const expectValid of expectValidList) {
        expectIsValid(expectValid);
      }
    });
  });
});
