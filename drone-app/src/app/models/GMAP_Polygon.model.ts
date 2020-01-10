declare var google: any;

export class GMAP_Polygon {

  _map: any;                          // Google Map's map object
  _polygon: any;                      // Google Map's polygon object
  _styles: any;                       // Style related objects
  _dirty: boolean;                    // Dirtyness flag
  _min_latitude: number;              // Minimum latitude
  _max_latitude: number;              // Maximum Latitude
  _min_longitude: number;             // Minimum Longitude
  _max_longitude: number;             // Maximum Longitude

  /**
   * Constructor
   * @param map           Google Map's map object
   * @param options       [options = {}] Optional parameters
   */
  constructor(map: any, coordinates: number[][], options?: any){
    // Optional parameters
    if (options == void 0) { options = {}; }
    // Validate parameters
    if (!map) { throw new Error("The parameter 'map' is required but " + map + " was received"); }
    // Assignation
    this._map = map;
    this._polygon = this.createPolygon(coordinates, options);
    this._polygon.setMap(this._map);
    this._styles = (options.styles)? options.styles : {};
    this._dirty = true;
    this._min_latitude = NaN;
    this._max_latitude = NaN;
    this._min_longitude = NaN;
    this._max_longitude = NaN;
    this.addListeners();
  }

// Getter

  /**
   * Returns the coordinate of the polygon
   * @return An array of coordinates
   */
  public getCoordinates(): number[][]{
    return this._polygon.getPath().getArray().map( p => { return [p.lat(), p.lng()]; });
  }

  /**
   * Returns the polygon object
   * @return A googleMaps polygon object
   */
  public getPolygon(){
    return this._polygon;
  }

  /**
   * Returns the minimum longitude of the polygon
   * @return a number
   */
  public getMinLongitude(){
    if (this._dirty) this.handleDirtyness();
    return this._min_longitude;
  }

  /**
   * Returns the maximum longitude of the polygon
   * @return a number
   */
  public getMaxLongitude(){
    if (this._dirty) this.handleDirtyness();
    return this._max_longitude;
  }

  /**
   * Returns the minimum latitude of the polygon
   * @return a number
   */
  public getMinLatitude(){
    if (this._dirty) this.handleDirtyness();
    return this._min_latitude;
  }

  /**
   * Returns the maximum longitude of the polygon
   * @return a number
   */
  public getMaxLatitude(){
    if (this._dirty) this.handleDirtyness();
    return this._max_latitude;
  }

  /**
   * Returns the bounds of the polygon
   * @return An object that contains the minimum and maximum latitudes and longitudes
   */
  public getBounds(){
    if (this._dirty) this.handleDirtyness();
    return {
      min_latitude: this._min_latitude,
      min_longitude: this._min_longitude,
      max_latitude: this._max_latitude,
      max_longitude: this._max_longitude
    }
  }

// Public functions


  public selectStyle(style: string){
    if (this._styles.hasOwnProperty(style)){
      this._polygon.setOptions(this._styles[style]);
    } else{
      console.error("Polygon doesn't have the '" + style + "' style attached'");
    }
  }

  /**
   * Remove the polygon from its map and set its value to undefined
   */
   public clearPolygon(){
     this._polygon.setMap(null);
     this._polygon = undefined;
     this._styles = {};
     this._dirty = true;
     this._min_latitude = NaN;
     this._max_latitude = NaN;
     this._min_longitude = NaN;
     this._max_longitude = NaN;
   }

  /**
   * Check if the polygon has the same coordinates as the given ones
   * @param  coordinates An array of coordinates
   * @return             True or false, depending if they are equal or not
   */
  public hasSameCoordinates(coordinates: number[][], tolerance?: number): boolean{
    if (tolerance == null || tolerance == undefined) { tolerance = 0; }
    let pcoordinates = this.getCoordinates();
    if (coordinates.length !== pcoordinates.length){ return false; }
    for (let idx = 0; idx < coordinates.length; idx++){
      let latdiff = Math.abs(coordinates[idx][0] - pcoordinates[idx][0]);
      let lngdiff = Math.abs(coordinates[idx][1] - pcoordinates[idx][1]);
      if (latdiff > tolerance || lngdiff > tolerance){
        return false;
      }
    }
    return true;
  }

// Private functions

  private createPolygon(coordinates: number[][], options?: any){
    // Validation
    if (coordinates.length < 3) { throw new Error("The parameter 'coordinates' must have at least 3 coordinates but " + coordinates.length + " were received"); }
    if (coordinates.length === 3 && coordinates[0][0] === coordinates[2][0] && coordinates[0][1] === coordinates[2][1])  { throw new Error("The parameter 'coordinates' must have at least 3 coordinates but 2 were received"); }
    // If the first and last coordinate are the same, then remove the last
    let sameFirstAndLastVertice = coordinates[0][0] === coordinates[coordinates.length-1][0] && coordinates[0][1] === coordinates[coordinates.length-1][1]
    if (sameFirstAndLastVertice){
      coordinates = coordinates.slice(0,-1);
    }
    let paths = coordinates.map( c => { return {lat: c[0], lng: c[1] }});
    let parameters = { paths: paths };
    parameters["editable"] = (options.editable)? options.editable : true;
    parameters["draggable"] = (options.draggable) ? options.draggable : true;
    return new google.maps.Polygon(parameters);
  }

  private addListeners(){
    if (this._polygon){
      google.maps.event.addListener(this._polygon, 'mousedown', (event) => this.OnMouseDownPolygon(event));
      google.maps.event.addListener(this._polygon, 'mouseup', (event) => this.OnMouseUpPolygon(event));
    }
  }

  // Assign the mouse downed polygon as current selected polygon
  private OnMouseDownPolygon(event){
    this._dirty = true;
    this.updateZIndex();
  }

  // Assign the mouse upned polygon as current selected polygon
  private OnMouseUpPolygon(event){
    this._dirty = true;
    this.updateZIndex();
  }

  private updateZIndex(){
    if (this._polygon){
      const Multiplier = 10000000;
      let bounds = this.getBounds();
      let latdiff = Math.abs(bounds.min_latitude - bounds.max_latitude);
      let lngdiff = Math.abs(bounds.min_longitude - bounds.max_longitude);
      let zIndex = - (latdiff * lngdiff) * Multiplier;

      // End of quick fix
      this._polygon.setOptions({zIndex: zIndex});
    }
  }

  private handleDirtyness(){
    // Update the polygon bounds
    let minLat = NaN;
    let maxLat = NaN;
    let minLng = NaN;
    let maxLng = NaN;
    this.getCoordinates().forEach( c => {
      let lat = c[0];
      let lng = c[1];
      if (isNaN(minLat) || lat < minLat){ minLat = lat; }
      if (isNaN(minLng) || lng < minLng){ minLng = lng; }
      if (isNaN(maxLat) || lat > maxLat){ maxLat = lat; }
      if (isNaN(maxLng) || lng > maxLng){ maxLng = lng; }
    });
    this._min_latitude = minLat;
    this._max_latitude = maxLat;
    this._min_longitude = minLng;
    this._max_longitude = maxLng;
    this._dirty = false;
  }




}
