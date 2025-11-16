import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WPSettings } from './wpsettings';

describe('WPSettings', () => {
  let component: WPSettings;
  let fixture: ComponentFixture<WPSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WPSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WPSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
