import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekPlanner } from './week-planner';

describe('WeekPlanner', () => {
  let component: WeekPlanner;
  let fixture: ComponentFixture<WeekPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeekPlanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekPlanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
