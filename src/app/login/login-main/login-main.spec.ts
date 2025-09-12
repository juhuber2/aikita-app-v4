import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginMain } from './login-main';

describe('LoginMain', () => {
  let component: LoginMain;
  let fixture: ComponentFixture<LoginMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginMain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
