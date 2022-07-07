import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BancoComponent } from './banco.component';

describe('BancoComponent', () => {
  let component: BancoComponent;
  let fixture: ComponentFixture<BancoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BancoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BancoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
