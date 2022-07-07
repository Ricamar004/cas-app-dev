import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VpagoListComponent } from './vpago-list.component';

describe('VpagoListComponent', () => {
  let component: VpagoListComponent;
  let fixture: ComponentFixture<VpagoListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VpagoListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VpagoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
