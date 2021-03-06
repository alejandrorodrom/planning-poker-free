import { Component } from '@angular/core';
import { EnterNamePresenter } from './enter-name.presenter';

@Component({
  selector: 'ppf-enter-name',
  templateUrl: './enter-name.component.html',
  styleUrls: ['./enter-name.component.scss'],
  providers: [EnterNamePresenter]
})
export class EnterNameComponent {

  constructor(public presenter: EnterNamePresenter) { }

}
