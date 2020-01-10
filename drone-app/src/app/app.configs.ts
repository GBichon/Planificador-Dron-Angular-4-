import { Injectable } from '@angular/core';
import { AppGlobals } from './app.globals';
@Injectable({
  providedIn: 'root'
})
export class AppConfigs {

  constructor( private globals: AppGlobals ) {  }

  ROUNDING_PRECISION = 7      // How many decimals will be used for each coordinate
  ANGLE_INCREMENT = 10        // How much will be the increment when testing angles from 0 to 180
  PASS_WIDTH = 0.01          // How much of area does the drone covers (in kilometers)

  // Default values of the map when initialized
  DEFAULT_MAP_VALUES = {
    LATITUDE: -33.4491524,    // Latitude of the map center
    LONGITUDE: -70.6795314,   // Longitude of the map center
    ZOOM: 18                  // Zoom level of the map
  }

  MARKER_PROPERTIES = {
    START : {
      draggable: true,
      label: "",
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      shadow: 'http://chart.apis.google.com/chart?chst=d_map_pin_shadow'
    },
    END : {
      draggable: true,
      label: "",
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      shadow: 'http://chart.apis.google.com/chart?chst=d_map_pin_shadow'
    }
  }

  POLYGON_PROPERTIES = {
    COVERAGE: {
      styles: {
        selected: {
          strokeColor: "#00FF00",
          fillColor: "#00FF00",
          strokeOpacity: 1,
          strokeWeight: 4,
          fillOpacity: 0.5 + 0.2,
        },
        unselected: {
          strokeColor: "#339933",
          fillColor: "#339933",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillOpacity: 0.3 + 0.2,
        }
      },
      editable: true,
      draggable: true
    },
    OBSTACLE: {
      styles: {
        selected: {
          strokeColor: "#FF0000",
          fillColor: "#FF0000",
          strokeOpacity: 1,
          strokeWeight: 4,
          fillOpacity: 0.5 + 0.2,
        },
        unselected: {
          strokeColor: "#800000",
          fillColor: "#800000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillOpacity: 0.3 + 0.2,
        }
      },
      editable: true,
      draggable: true
    }
  }



  // Define the buttons that appears in the google maps canvas. The parameters
  // are:
  // 1) Button Group
  // 1.1) Name of the group
  // 1.2) Position of the button group in the map
  // 1.3) If orientation is vertical (If not, it's horizontal)
  // 1.4) Buttons
  // 1.4.1) Identifier of the button
  // 1.4.2) Name of the function called on click
  // 1.4.3) Icon type (Related to the icon font used: icomoon or font-awesome)
  // 1.4.4) Hex code of the icon
  GOOGLE_MAPS_BUTTONS = [
    {
      NAME: "Marker_Buttons",
      POSITION: this.globals.GOOGLE_MAPS_BUTTONS_POSITIONS.TOP_LEFT,
      ORIENTATION_VERTICAL: true,
      BUTTONS: [
        {
          ID: "AddStartMarker",
          CLICK_FUNCTION: "AddStartMarker",
          ICON_TYPE: this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.FONT_AWESOME,
          ICON: "&#xf04b;"
        },
        {
          ID: "AddEndMarker",
          CLICK_FUNCTION: "AddEndMarker",
          ICON_TYPE: this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.FONT_AWESOME,
          ICON: "&#xf04d;"
        }
      ]
    },
    {
      NAME: "Polygon_Buttons",
      POSITION: this.globals.GOOGLE_MAPS_BUTTONS_POSITIONS.LEFT_TOP,
      ORIENTATION_VERTICAL: true,
      BUTTONS: [
        {
          ID: "AddCoveragePolygon",
          CLICK_FUNCTION: "AddCoveragePolygon",
          ICON_TYPE: this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.ICOMOON,
          ICON: "&#xe900;"
        },
        {
          ID: "AddObstaclePolygon",
          CLICK_FUNCTION: "AddObstaclePolygon",
          ICON_TYPE: this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.ICOMOON,
          ICON: "&#xe901;"
        },
        {
          ID: "DeleteSelectedPolygon",
          CLICK_FUNCTION: "DeleteSelectedPolygon",
          ICON_TYPE: this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.FONT_AWESOME,
          ICON: "&#xf05e;"
        },
        {
          ID: "DeleteAll",
          CLICK_FUNCTION: "DeleteAll",
          ICON_TYPE: this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.FONT_AWESOME,
          ICON: "&#xf1f8;"
        }
      ]
    },
    {
      NAME: "Settings_Buttons",
      POSITION: this.globals.GOOGLE_MAPS_BUTTONS_POSITIONS.TOP_RIGHT,
      ORIENTATION_VERTICAL: true,
      BUTTONS: [
        {
          ID: "OpenSettings",
          CLICK_FUNCTION: "OpenSettings",
          ICON_TYPE: this.globals.GOOGLE_MAPS_BUTTONS_ICON_TYPES.FONT_AWESOME,
          ICON: "&#xf0c9;"
        }
      ]
    }
  ];

}
