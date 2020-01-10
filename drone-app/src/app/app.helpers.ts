// Functions related to handling app configurations and globals
import { Injectable } from '@angular/core';
import { AppGlobals } from './app.globals';
import { AppConfigs } from './app.configs';

@Injectable({
  providedIn: 'root'
})
export class AppHelpers {

  constructor(
      private configs: AppConfigs,
      private globals: AppGlobals,
    ) {}


  public setStyleToButtonElement(renderer, buttonElement){
    renderer.addClass(buttonElement, "gm-button");
  }

  public setIconToButtonElement(renderer, buttonElement, iconType, iconValue){
    let iconElement = renderer.createElement("div");
    if (iconType === this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.ICOMOON){
      renderer.addClass(iconElement, "icomoon");
    } else if (iconType === this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.FONT_AWESOME){
      renderer.addClass(iconElement, "iconfa");
    }
    renderer.setProperty(iconElement, "innerHTML", iconValue);
    renderer.appendChild(buttonElement, iconElement);
  }


}
