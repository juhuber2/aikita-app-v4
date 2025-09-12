import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planung } from './planung';

describe('Planung', () => {
  let component: Planung;
  let fixture: ComponentFixture<Planung>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planung]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planung);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
