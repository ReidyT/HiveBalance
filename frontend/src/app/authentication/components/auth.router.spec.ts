import {RouterTestingHarness} from '@angular/router/testing';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {fireEvent, screen} from '@testing-library/angular';
import {routes} from '../../app.routes';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';

describe('AuthenticationRouter', () => {
  async function setup({initialUrl}: { initialUrl?: string } = {}) {
    const harness = await RouterTestingHarness.create();

    if (initialUrl) {
      await harness.navigateByUrl(initialUrl);
      expect(TestBed.inject(Router).url).toBe(initialUrl);
    }

    return {
      harness,
      clickLink: (element: HTMLElement) => {
        expect(element).toBeTruthy();
        fireEvent.click(element);

        // Needed to let some time navigate correctly.
        // Be aware to call clickLink from a fakeAsync test.
        tick();
        harness.detectChanges();
      }
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    })
      .compileComponents();
  });

  it('should display login page when navigating by url', async () => {
    await setup({initialUrl: '/auth/login'});
    expect(screen.getByTestId('login-card')).toBeTruthy();
  });

  it('should display sign up page when navigating by url', async () => {
    await setup({initialUrl: '/auth/signUp'});
    expect(screen.getByTestId('registration-card')).toBeTruthy();
  });

  it('should navigate to sign up page when clicking on the link from login page', fakeAsync(async () => {
    const {clickLink} = await setup({initialUrl: '/auth/login'});
    clickLink(screen.getByRole('link', {name: /sign up/i}));

    expect(TestBed.inject(Router).url).toBe('/auth/signUp');
    expect(screen.getByTestId('registration-card')).toBeTruthy();
  }));

  it('should navigate to log in page when clicking on the link from sign up page', fakeAsync(async () => {
    const {clickLink} = await setup({initialUrl: '/auth/signUp'});
    clickLink(screen.getByRole('link', {name: /log in/i}));

    expect(TestBed.inject(Router).url).toBe('/auth/login');
    expect(screen.getByTestId('login-card')).toBeTruthy();
  }));
});
