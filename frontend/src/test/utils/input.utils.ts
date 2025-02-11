import {UserEvent} from '@testing-library/user-event';

export const INPUT_COMMANDS = {
  CLEAR: '{clear}',
} as const;

export async function applyInputCommand(userEvent: UserEvent, input: HTMLInputElement, value: string) {
  switch (value) {
    case INPUT_COMMANDS.CLEAR:
      await userEvent.clear(input);
      break;
    default:
      await userEvent.type(input, value);
  }
}
