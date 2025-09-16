import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planung3 } from './planung3';

describe('Planung3', () => {
  let component: Planung3;
  let fixture: ComponentFixture<Planung3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planung3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planung3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
