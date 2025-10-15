import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planung4 } from './planung4';

describe('Planung4', () => {
  let component: Planung4;
  let fixture: ComponentFixture<Planung4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planung4]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planung4);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
