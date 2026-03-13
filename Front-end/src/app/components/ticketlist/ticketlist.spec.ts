
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ticketlist } from './ticketlist';

describe('Ticketlist', () => {
  let component: Ticketlist;
  let fixture: ComponentFixture<Ticketlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ticketlist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ticketlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
