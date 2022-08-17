import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GifMakerComponent } from './gif-maker.component';

describe('GifMakerComponent', () => {
  let component: GifMakerComponent;
  let fixture: ComponentFixture<GifMakerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GifMakerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GifMakerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
