import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDownloadGuideQuipticComponent } from './pdf-download-guide-quiptic.component';

describe('PdfDownloadGuideQuipticComponent', () => {
  let component: PdfDownloadGuideQuipticComponent;
  let fixture: ComponentFixture<PdfDownloadGuideQuipticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PdfDownloadGuideQuipticComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfDownloadGuideQuipticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
