import { GMAP_Polygon } from './GMAP_Polygon.model';

declare var google: any;

export class GMAP_PolygonManager {

  private _map: any;                           // Google Map's map objecth
  private _dictionary: any;                    // A dictionary in which each key contain an array of GMAP_Polygons
  private _selected_polygon: GMAP_Polygon;        // The currently selected polygon
  private _last_added_polygons: GMAP_Polygon[];  // A buffer with the last added polygons
  private _LAST_ADDED_LIMIT = 10;                  // The length of the last added buffer

  /**
   * GMAP_PolygonManager constructor
   */
  constructor(map: any){
    // Validation
    if (map === undefined || map === null) { throw new Error("'map' is required but " + map + " was given"); }
    // Assignation
    this._map = map;
    this._dictionary = {};
    this._selected_polygon = undefined;
    this._last_added_polygons = [];
    // Add listener
    google.maps.event.addListener(this._map, 'center_changed', (event) => this.clearLastAddedPolygons());
  }

// Getters

  /**
   * Get the map attached to the polygon manager
   * @return Google Map's map object
   */
  public getMap(): any{
    return this._map;
  }

  /**
   * Get the polygons attached to the polygon manager. Adittionaly, a filter key
   * can be used to obtain only the polygons related to the given key
   * @param  filter_key A string
   * @return            An array of polygons
   */
  public getPolygons(filter_key?: string): GMAP_Polygon[]{
    if (filter_key){
      return (this._dictionary.hasOwnProperty(filter_key))? this._dictionary[filter_key] : [];
    } else{
      return [].concat(...Object.values(this._dictionary));
    }
  }

  /**
   * Return the polygons that were last added to the manager
   * @return            An array of polygons
   */
  public getLastAddedPolygons(): GMAP_Polygon[]{
    return this._last_added_polygons;
  }

  /**
   * Returns the maximum amount of polygons that can be stored in the last
   * added array
   * @return            A number
   */
  public getLastAddedLimit(): number{
    return this._LAST_ADDED_LIMIT;
  }

// Public functions

  /**
   * Add a polygon to the manager. If no polygon is provided, then generate
   * a default polygon using the maps current coordinates
   * @param  key      Key of the polygon
   * @param  polygon  Polygon to be added. null if a default polygon will be used
   * @param  options  [optional parameters related to the polygon properties]
   */
  public addPolygon(key: string, polygon: GMAP_Polygon, options?: any){
    let p = (polygon !== null && polygon !== undefined)? (polygon) : new GMAP_Polygon(this._map, this.getDefaultPolygonCoordinates(), options);
    // Update dictionary
    if (this._dictionary.hasOwnProperty(key)){
      this._dictionary[key].push(p);
    } else{
      this._dictionary[key] = [p];
    }
    // Update last added polygons
    this._last_added_polygons.unshift(p);
    if (this._last_added_polygons.length >= this._LAST_ADDED_LIMIT){
      this._last_added_polygons.pop();
    }
    // Update selected polygon
    this.setSelectedPolygon(p);
    // Add listeners
    google.maps.event.addListener(p.getPolygon(), 'mousedown', (event) =>  this.setSelectedPolygon(p));
    google.maps.event.addListener(p.getPolygon(), 'mouseup', (event) =>  this.setSelectedPolygon(p));
  }



  /**
   * Delete the selected polygon and leave the last added as selected
   */
  public deleteSelectedPolygon(){
    if (this._selected_polygon){
      // Remove from last added polygons
      let idx = this._last_added_polygons.indexOf(this._selected_polygon);
      this._last_added_polygons.splice(idx, 1);
      // Remove from dictionary
      Object.keys(this._dictionary).forEach( k => {
        let oidx = this._dictionary[k].indexOf(this._selected_polygon);
        if (oidx !== -1){ this._dictionary[k].splice(oidx); }
        if (this._dictionary[k].length === 0){ delete this._dictionary[k]; }
      })
      // Remove from map
      this._selected_polygon.clearPolygon();
      // Remove from selected polygon
      this._selected_polygon = undefined
      if (this._last_added_polygons.length !== 0){
        this._selected_polygon = this._last_added_polygons[0];
      } else if (this._last_added_polygons.length === 0){
        let polygons = this.getPolygons();
        if (polygons.length !== 0){
          this._selected_polygon = polygons[0];
        }
      }
      if (this._selected_polygon) this._selected_polygon.selectStyle("selected");
    }
  }

  /**
   * Delete all of the polygons
   */
  public deleteAllPolygons(){
    this.getPolygons().forEach( p => {
      p.clearPolygon();
    });
    this._dictionary = {};
    this._selected_polygon = undefined;
    this._last_added_polygons = [];
  }

// Private functions

  /**
   * Get the default coordinates of a polygon in the shape of a triangle
   * @return An array of three coordinates
   */
  private getDefaultPolygonCoordinates(){
    const latdiff = Math.abs(this._map.getBounds().getNorthEast().lat() - this._map.getBounds().getSouthWest().lat());
    const lngdiff = Math.abs(this._map.getBounds().getNorthEast().lng() - this._map.getBounds().getSouthWest().lng());
    const multiplier = 0.2;
    // A loop to find a triangle whose coordinates aren't the same as the last added polygons
    let counter = 0;
    let ready = false;
    let tolerance = 10**-7;
    let A = [this._map.getCenter().lat() + latdiff * multiplier, this._map.getCenter().lng()];
    let B = [this._map.getCenter().lat() - latdiff * multiplier, this._map.getCenter().lng() - lngdiff * multiplier];
    let C = [this._map.getCenter().lat() - latdiff * multiplier, this._map.getCenter().lng() + lngdiff * multiplier];
    while (!ready){
      ready = true;
      for (let i = 0; i < this._last_added_polygons.length; i++){
        let currentPolygon = this._last_added_polygons[i];
        if (currentPolygon.hasSameCoordinates([A,B,C], tolerance)){
          A = [this._map.getCenter().lat() + latdiff * multiplier / (counter + 2), this._map.getCenter().lng()];
          B = [this._map.getCenter().lat() - latdiff * multiplier / (counter + 2), this._map.getCenter().lng() - lngdiff * multiplier / (counter + 2)];
          C = [this._map.getCenter().lat() - latdiff * multiplier / (counter + 2), this._map.getCenter().lng() + lngdiff * multiplier / (counter + 2)];
          ready = false;
          counter++;
        }
      }
    }
    // Return the coordinates of the default polygon
    return [A, B, C];
  }

  /**
   * Set the last added polyon variables to empty
   */
  private clearLastAddedPolygons(){
    this._last_added_polygons = [];
  }

  /**
   * Set the selected polygon
   * @param  polygon  A GMAP_Polygon
   */
  private setSelectedPolygon(polygon: GMAP_Polygon){
    let previousSelected = this._selected_polygon;
    if (previousSelected && previousSelected !== polygon) { previousSelected.selectStyle("unselected"); }
    this._selected_polygon = polygon;
    this._selected_polygon.selectStyle("selected");
  }
}
