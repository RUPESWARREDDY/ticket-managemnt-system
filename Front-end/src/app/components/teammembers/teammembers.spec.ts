import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Teammembers } from './teammembers';

describe('Teammembers', () => {
  let component: Teammembers;
  let fixture: ComponentFixture<Teammembers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Teammembers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Teammembers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
