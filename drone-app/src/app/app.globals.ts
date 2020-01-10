// In this file there are defined the global constants of the project
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppGlobals {

  GOOGLE_MAPS_BUTTONS_POSITIONS: any = {
    TOP_CENTER: "TOP_CENTER",
    TOP_LEFT: "TOP_LEFT",
    TOP_RIGHT: "TOP_RIGHT",
    LEFT_TOP: "LEFT_TOP",
    RIGHT_TOP: "RIGHT_TOP",
    LEFT_CENTER: "LEFT_CENTER",
    RIGHT_CENTER: "RIGHT_CENTER",
    LEFT_BOTTOM: "LEFT_BOTTOM",
    RIGHT_BOTTOM: "RIGHT_BOTTOM",
    BOTTOM_CENTER: "BOTTOM_CENTER",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    BOTTOM_RIGT: "BOTTOM_RIGHT"
  }

  GOOGLE_MAPS_BUTTONS_ICON_TYPES: any = {
    ICOMOON: "ICOMOON",
    FONT_AWESOME: "FONT_AWESOME"
  }





}
