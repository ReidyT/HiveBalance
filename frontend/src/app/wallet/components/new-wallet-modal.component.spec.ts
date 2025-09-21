import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewWalletModalComponent } from './new-wallet-modal.component';

describe('NewWalletModalComponent', () => {
  let component: NewWalletModalComponent;
  let fixture: ComponentFixture<NewWalletModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewWalletModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewWalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
