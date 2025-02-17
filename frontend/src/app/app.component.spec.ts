import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {AuthenticationService} from './authentication/services/authentication.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{
        provider: AuthenticationService,
        useValue: {},
      }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
