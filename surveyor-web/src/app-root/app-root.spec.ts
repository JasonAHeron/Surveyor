import { TestBed, async } from '@angular/core/testing';
import { AppRootComponent } from './app-root.component';
describe('AppRootComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppRootComponent
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppRootComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'surveyor'`, async(() => {
    const fixture = TestBed.createComponent(AppRootComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('surveyor');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppRootComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to surveyor!');
  }));
});
