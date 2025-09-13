import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planung2 } from './planung2';

describe('Planung2', () => {
  let component: Planung2;
  let fixture: ComponentFixture<Planung2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planung2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planung2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
