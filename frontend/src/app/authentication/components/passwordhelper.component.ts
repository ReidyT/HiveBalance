import {Component, computed, inject, input, Input, OnChanges, SimpleChanges} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {Divider} from 'primeng/divider';

@Component({
  selector: 'app-password-helper',
  imports: [
    Divider
  ],
  template: `
    <p-divider/>
    <ul class="pl-2 ml-2 my-0 leading-normal" style="list-style-type: none; padding: 0; margin: 0;">
      <li><i
        [attr.data-testid]="'helper-lowercase'"
        [class]="icons().lowerCase.icon"
        [style]="icons().lowerCase.color"></i> At least one lowercase
      </li>
      <li><i
        [attr.data-testid]="'helper-uppercase'"
        [class]="icons().upperCase.icon"
        [style]="icons().upperCase.color"></i> At least one uppercase
      </li>
      <li><i
        [attr.data-testid]="'helper-numeric'"
        [class]="icons().numeric.icon"
        [style]="icons().numeric.color"></i> At least one numeric
      </li>
      <li><i
        [attr.data-testid]="'helper-special'"
        [class]="icons().specialChar.icon"
        [style]="icons().specialChar.color"></i> At least one special char
      </li>
      <li><i
        [attr.data-testid]="'helper-min'"
        [class]="icons().minLength.icon"
        [style]="icons().minLength.color"></i> Minimum 8 characters
      </li>
      <li><i
        [attr.data-testid]="'helper-max'"
        [class]="icons().maxLength.icon"
        [style]="icons().maxLength.color"></i> Maximum 30 characters
      </li>
    </ul>
  `,
  providers: [PasswordService]
})
export class PasswordHelperComponent {

  public password = input<string>('');
  protected passwordService = inject(PasswordService);
  protected icons = computed(() => ({
    lowerCase: this.getIcon(this.passwordService.containsAtLeastOneLowerCase(this.password())),
    upperCase: this.getIcon(this.passwordService.containsAtLeastOneUpperCase(this.password())),
    numeric: this.getIcon(this.passwordService.containsAtLeastOneNumeric(this.password())),
    specialChar: this.getIcon(this.passwordService.containsAtLeastOneSpecialChars(this.password())),
    minLength: this.getIcon(this.passwordService.exceedMinLength(this.password())),
    maxLength: this.getIcon(this.passwordService.doNotExceedMaxLength(this.password())),
  }));

  protected getIcon(isValid: boolean) {
    if (isValid) {
      return {icon: 'pi pi-check', color: 'color: green'};
    } else {
      return {icon: 'pi pi-times', color: 'color: red'};
    }
  }
}
