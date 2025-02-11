import {Component, computed, input} from '@angular/core';
import {NgClass} from '@angular/common';

// TODO: extract
interface Breakpoint {
  sm?: string[]; // Optional properties for 'sm' breakpoint
  md?: string[]; // Optional properties for 'md' breakpoint
  lg?: string[]; // Optional properties for 'lg' breakpoint
  xl?: string[]; // Optional properties for 'xl' breakpoint
}

@Component({
  selector: 'app-stack',
  imports: [
    NgClass
  ],
  template: `
    <div [ngClass]="classes()">
      <ng-content></ng-content>
    </div>
  `,
  styles: `
    .fluid {
      width: 100%;
    }
  `
})
export class StackComponent {
  public direction = input<'row' | 'column' | 'column-reverse' | 'row-reverse'>('column');
  public breakpoints = input<Breakpoint>({});
  public gap = input<number>(0);
  public fluid = input<boolean>(false);
  protected classes = computed(() => ([
      `flex`,
      `flex-${this.direction()}`,
      `gap-${this.gap()}`,
      this.fluid() ? 'fluid' : '',
      ...Object.entries(this.breakpoints()).flatMap(([k, v]) =>
        (v as string[]).flatMap((cls) => `${k}:${cls}`)
      )
    ].filter((c) => Boolean(c)))
  );
}
