import { Component, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { NgbDropdown,  NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { AppGlobals } from './app.globals';
import { AppConfigs } from './app.configs';
import { AppHelpers } from './app.helpers';
import { ImageModalContent } from './app.image-modal-content.component';

import { GMAP_Marker } from './models/GMAP_Marker.model';
import { GMAP_PolygonManager } from './models/GMAP_PolygonManager.model';
import { GMAP_Polygon } from './models/GMAP_Polygon.model';

import { CommonUtilsService } from './services/common-utils.service';
import { TestingService } from './services/testing.service';
import { Integration_GeoJSON_Service } from './services/geojson.services/integration.service';
import { Integration_DCEL_Service } from './services/DCEL.services/integration.service';

declare var google: any;
declare var turf: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private globals: AppGlobals,
    private configs: AppConfigs,
    private helpers: AppHelpers,
    private testing: TestingService,
    private renderer: Renderer2,
    private modal: NgbModal,
    private sanitizer: DomSanitizer,
    private CommonUtils : CommonUtilsService,
    private modalService: NgbModal
  ){  }

  @ViewChild('GoogleMapsButtons') refGoogleMapsButtons: ElementRef;
  @ViewChild(NgbDropdown) refSettingsDropdownMenu: NgbDropdown;

  private _GMAP_Map: any;
  private _GMap_Map_Ready : boolean = false;
  private _GMAP_Start_Marker: GMAP_Marker;
  private _GMAP_End_Marker: GMAP_Marker;
  private _GMAP_Polygons: GMAP_PolygonManager;
  private _GMAP_Coverage_Key = "COVERAGE";
  private _GMAP_Obstacle_Key = "OBSTACLE";
  private image_url: any;
  private south_west_coordinate_latitude: any;
  private south_west_coordinate_longitude: any;
  private north_east_coordinate_latitude: any;
  private north_east_coordinate_longitude: any;
  private ground_overlay_image: any;
  private ground_overlay_latitude: any;
  private ground_overlay_longitude: any;
  private ground_overlay_bounds_y_latitude: any;
  private ground_overlay_bounds_y_longitude: any;
  private ground_overlay_zindex: any;
  private satellite_mode_selected: boolean = false;

  // Run when map is loaded correctly
  onMapReady(map) {
    this._GMAP_Map = map;
    this.SetMapMode();
    this._GMap_Map_Ready = true;
    this._GMAP_Polygons = new GMAP_PolygonManager(this._GMAP_Map);
    this.setGoogleMapsInitialLocation(map);
    this.setGoogleMapsDefaulZoomLevel(map);
    this.setGoogleMapsButtons(map);
  }

  private ChangeMode(){
    this.satellite_mode_selected = !this.satellite_mode_selected;
    this.SetMapMode();

  }

  private SetMapMode(){
    if (this.satellite_mode_selected){
      this._GMAP_Map.setMapTypeId('satellite');
    } else{
      this._GMAP_Map.setMapTypeId('roadmap');
    }
  }


  // Set google map initial location
  private setGoogleMapsInitialLocation(map){
    if (map && navigator){
      navigator.geolocation.getCurrentPosition(resp => {
        map.setCenter({ lat: resp.coords.latitude, lng: resp.coords.longitude});
      }, error => {
        this.setGoogleMapsDefaultLocation(map);
      });
    } else{
      this.setGoogleMapsDefaultLocation(map);
    }
  }

  // Set default initial location defined in the configurations file
  private setGoogleMapsDefaultLocation(map){
    if (map){
      map.setCenter({ lat: this.configs.DEFAULT_MAP_VALUES.LATITUDE, lng: this.configs.DEFAULT_MAP_VALUES.LONGITUDE });
    }
  }

  // Set default initial zoom level defined in the configurations file
  private setGoogleMapsDefaulZoomLevel(map){
    if (map){
      map.setZoom(this.configs.DEFAULT_MAP_VALUES.ZOOM);
    }
  }

  // Display google maps buttons defined in the globals file
  private setGoogleMapsButtons(map){
    this.configs.GOOGLE_MAPS_BUTTONS.forEach( buttonGroup => {
      let buttonGroupElement = this.renderer.createElement("div");
      this.renderer.setProperty(buttonGroupElement, "name", buttonGroup.NAME);
      this.renderer.addClass(buttonGroupElement, "gm-controls");
      buttonGroup.BUTTONS.forEach( button => {
        let buttonElement = this.renderer.createElement("button")
        this.renderer.setProperty(buttonElement, 'id', button.ID);
        this.helpers.setIconToButtonElement(this.renderer, buttonElement, button.ICON_TYPE, button.ICON);
        this.helpers.setStyleToButtonElement(this.renderer, buttonElement);
        this.renderer.listen(buttonElement, 'click', (event) => { this[button.CLICK_FUNCTION]() });
        this.renderer.appendChild(buttonGroupElement, buttonElement);
      })
      this.renderer.appendChild(this.refGoogleMapsButtons.nativeElement, buttonGroupElement);
      map.controls[google.maps.ControlPosition[buttonGroup.POSITION]].push(buttonGroupElement);
    });
  }

  // Returns true/false if the function for a google button is defined in this script
  private doesGoogleButtonHasClickFunction(gButton){
    let doesItHasIt = !(this[gButton.CLICK_FUNCTION] == undefined);
    if (!doesItHasIt) console.error("Button click function ("+gButton.CLICK_FUNCTION+") is not defined in app.component.ts");
    return doesItHasIt;
  }

  /**
   * Add or update the marker for the start position
   */
  private AddStartMarker(){
    const map = this._GMAP_Map;
    const options = this.configs.MARKER_PROPERTIES.START;
    const center = [map.getCenter().lat(), map.getCenter().lng()];
    const southWest = [map.getBounds().getSouthWest().lat(), map.getBounds().getSouthWest().lng()];
    const coordinates = [ center[0], center[1] - Math.abs(center[1] - southWest[1])/2 ];
    if (this._GMAP_Start_Marker){
      this._GMAP_Start_Marker.setCoordinate(coordinates);
    } else{
      this._GMAP_Start_Marker = new GMAP_Marker(map, coordinates, options);
    }
  }

  /**
   * Add or update the marker for the end position
   */
  private AddEndMarker(){
    const map = this._GMAP_Map;
    const options = this.configs.MARKER_PROPERTIES.END;
    const center = [map.getCenter().lat(), map.getCenter().lng()];
    const southWest = [map.getBounds().getSouthWest().lat(), map.getBounds().getSouthWest().lng()];
    const coordinates = [ center[0], center[1] + Math.abs(center[1] - southWest[1])/2 ];
    if (this._GMAP_End_Marker){
      this._GMAP_End_Marker.setCoordinate(coordinates);
    } else{
      this._GMAP_End_Marker = new GMAP_Marker(map, coordinates, options);
    }
  }

// Buttons

  /**
   * Add a coverage polygon
   */
  private AddCoveragePolygon(){
    this._GMAP_Polygons.addPolygon(this._GMAP_Coverage_Key, null, this.configs.POLYGON_PROPERTIES.COVERAGE);
  }

  /**
   * Add an obstacle polygon
   */
  private AddObstaclePolygon(){
    this._GMAP_Polygons.addPolygon(this._GMAP_Obstacle_Key, null, this.configs.POLYGON_PROPERTIES.OBSTACLE);
  }

  /**
   * Remove the selected polygon
   */
  private DeleteSelectedPolygon(){
    this._GMAP_Polygons.deleteSelectedPolygon();
  }

  /**
   * Remove all of the polygons
   */
  private DeleteAll(){
    if (this._GMAP_Start_Marker) { this._GMAP_Start_Marker.clearMarker();  this._GMAP_Start_Marker = undefined; }
    if (this._GMAP_End_Marker) { this._GMAP_End_Marker.clearMarker(); this._GMAP_End_Marker = undefined; }
    if (this._GMAP_Polygons) { this._GMAP_Polygons.deleteAllPolygons(); }
  }

  // Function for button
  private OpenSettings(){
    this.refSettingsDropdownMenu.open();
    console.log(this._GMAP_Map.getBounds());

  }

  // Function for button
  private CloseSettings(){
    this.refSettingsDropdownMenu.close();
  }

  private OpenImageModal(content){
    if (!this.image_url) this.image_url = "../../assets/img/placeholder.png";
    if (!this.south_west_coordinate_latitude) this.south_west_coordinate_latitude = turf.round(this._GMAP_Map.getBounds().getSouthWest().lat(), 7);
    if (!this.south_west_coordinate_longitude) this.south_west_coordinate_longitude = turf.round(this._GMAP_Map.getBounds().getSouthWest().lng(), 7);
    if (!this.north_east_coordinate_latitude) this.north_east_coordinate_latitude = turf.round(this._GMAP_Map.getBounds().getNorthEast().lat(), 7);
    if (!this.north_east_coordinate_longitude) this.north_east_coordinate_longitude = turf.round(this._GMAP_Map.getBounds().getNorthEast().lng(), 7);
    this.modalService.open(content, { })
  }


  private onImageChange($event) {
    let target = event.currentTarget as HTMLInputElement;
    if (target.files && target.files[0]){
      var reader = new FileReader();
      reader.onload = (event: ProgressEvent) => { this.image_url = (<FileReader> event.target).result; }
      reader.readAsDataURL(target.files[0]);
    } else {
      console.log("No File Uploaded");
    }
  }

  private UploadImage(){
    console.log("uPLOAD");
    this.ground_overlay_latitude = this.south_west_coordinate_latitude;
    this.ground_overlay_longitude = this.south_west_coordinate_longitude;
    this.ground_overlay_bounds_y_latitude = Math.abs(this.south_west_coordinate_latitude - this.north_east_coordinate_latitude);
    this.ground_overlay_bounds_y_longitude = Math.abs(this.south_west_coordinate_longitude - this.north_east_coordinate_longitude);
    this.ground_overlay_image = this.image_url;
    this.ground_overlay_zindex = -99999;
    console.log("goverlay z index: " + this.ground_overlay_zindex);
  }


  // Function for button
  private GenerateCoveragePath(){
    // Load services
    const GeoJSONServices = new Integration_GeoJSON_Service();
    const DCELServices = new Integration_DCEL_Service();

    // Related parameters
    const roundingPrecision = this.configs.ROUNDING_PRECISION;
    const angleIncrement = this.configs.ANGLE_INCREMENT;
    const pass_width = this.configs.PASS_WIDTH;
    // Related variables
    let obstacles = this._GMAP_Polygons.getPolygons(this._GMAP_Obstacle_Key).map( p => { return p.getCoordinates(); });
    let coverages = this._GMAP_Polygons.getPolygons(this._GMAP_Coverage_Key).map( p => { return p.getCoordinates(); });
    if (coverages.length == 0){
      window.alert("No polygon has been drawn for the coverage area of the drone");
    } else{
      // If there is no start point, use the first coordinate of the polygon
      let start = (this._GMAP_Start_Marker)? this._GMAP_Start_Marker.getCoordinate() : coverages[0][0];
      // If there is no end point, use the start point as end point
      let end = (this._GMAP_End_Marker)? this._GMAP_End_Marker.getCoordinate() : start;
      // Convert to geoJson Polygons
      let coverage_polygons = coverages.map(coordinates => { return GeoJSONServices.transformToGeoJsonPolygon([coordinates])});
      let obstacle_polygons = obstacles.map(coordinates => { return GeoJSONServices.transformToGeoJsonPolygon([coordinates])});
      // Merge and unmerge overlapping polygons
      coverage_polygons = GeoJSONServices.mergeOverlappingPolygons(coverage_polygons);
      obstacle_polygons = GeoJSONServices.mergeOverlappingPolygons(obstacle_polygons);
      coverage_polygons = GeoJSONServices.removeOverlapingPolygons(coverage_polygons, obstacle_polygons);
      // Compute the optimal sweep direction for each polygon
      coverage_polygons.forEach( polygon => {
        polygon.properties["optimal_coverage_direction"] = GeoJSONServices.determineOptimalSweepDirection(polygon, pass_width).optimalAngle;
      })
      // Convert the polygons into DCELS
      let coverage_dcels = coverage_polygons.map( polygon => {
        return DCELServices.transformPolygonToDCEL(polygon);
      })
      // Decompose the DCELS into trapezoids using the normal of the optimal coverage direction of the original polygon
      coverage_dcels.forEach( (dcel,idx) => {
        DCELServices.decompose(dcel, coverage_polygons[idx].properties["optimal_coverage_direction"] + 90);
      });
      // Obtain adjacent regions
      let coverage_regions = [].concat.apply([], coverage_dcels.map( dcel => {
        return DCELServices.obtainAdjacentRegions(dcel, pass_width);
      }));
      // Obtain waypoints
      let waypoints = DCELServices.getWaypointsFromRegions(start, end, coverage_regions, obstacle_polygons);
      // Generate file
      this.generateFile(waypoints);

      // Print stuff
      coverage_regions.forEach( (r, ridx) => {
        let c = this.CommonUtils.getRandomColor();
        r.getFaces().forEach( (f, fidx) => {
          let polygon = f.getPolygon();
          GeoJSONServices.displayFeature(this._GMAP_Map, polygon, c);
        })
      });
      GeoJSONServices.displayFeatureIDs(this._GMAP_Map,  turf.multiPoint(waypoints), "#00FF00");
      GeoJSONServices.displayFeature(this._GMAP_Map,  turf.lineString(waypoints), "#00FF00");



    }
  }

  private generateFile(coordinates: number[][]){

    let text = "";

    let header = "QGC WPL 110\n";
    text += header;


    // Start coordinate
    text += "" + 0 + "\t" + 1 + "\t" + 0 + "\t" + 16 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + coordinates[0][0] + "\t" + coordinates[0][1] + "\t" + 0 + "\t" + 1 + "\n";
    text += "" + 1 + "\t" + 0 + "\t" + 3 + "\t" + 22 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + coordinates[0][0] + "\t" + coordinates[0][1] + "\t" + 15 + "\t" + 1 + "\n";


    // Other coordinates
    for (let idx = 1; idx < coordinates.length - 1; idx++){
      let line = "" + (idx+1)+ "\t" + 0 + "\t" + 3 + "\t" + 16 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + coordinates[idx][0] + "\t" + coordinates[idx][1] + "\t" + 15 + "\t" + 1 + "\n";
      text += line;
    }

    // last coordinate
    let line = "" + (coordinates.length) + "\t" + 0 + "\t" + 3 + "\t" + 21 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + 0 + "\t" + coordinates[coordinates.length-1][0] + "\t" + coordinates[coordinates.length-1][1] + "\t" + 15 + "\t" + 1 + "\n";
    text += line;

    console.log(text);

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', "waypoints.txt");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    /**
    let filename = "waypoints.txt";
    let filetype = "text/plain";
    let dataURI = "data:" + filetype + ";base64," + btoa(text);
    console.log(dataURI);
    window.open(dataURI);
    **/
  }


  // Function for button
  private LoadTestPolygon(){
    let data = this.testing.getCase(this._GMAP_Map, 0);
    data.coverages.forEach( p => {
      let polygon = new GMAP_Polygon(this._GMAP_Map, p, this.configs.POLYGON_PROPERTIES.COVERAGE);
      this._GMAP_Polygons.addPolygon(this._GMAP_Coverage_Key, polygon);
    });
    data.obstacles.forEach( p =>{
      let polygon = new GMAP_Polygon(this._GMAP_Map, p, this.configs.POLYGON_PROPERTIES.OBSTACLE);
      this._GMAP_Polygons.addPolygon(this._GMAP_Obstacle_Key, polygon);
    })
  }



}
