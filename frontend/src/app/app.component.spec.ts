import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {AuthenticationService} from './authentication/services/authentication.service';
import {MessageService} from 'primeng/api';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{
        provide: AuthenticationService,
        useValue: {},
      }, {
        provide: MessageService,
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
