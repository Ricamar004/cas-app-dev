import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GcobroListComponent } from './gcobro-list.component';

describe('GcobroListComponent', () => {
  let component: GcobroListComponent;
  let fixture: ComponentFixture<GcobroListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GcobroListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GcobroListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
