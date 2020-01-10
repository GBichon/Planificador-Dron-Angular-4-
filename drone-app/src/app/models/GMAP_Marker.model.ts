declare var google: any;

export class GMAP_Marker {

  map: any;                           // Google Map's map object
  marker: any;                        // Google Map's marker object

  /**
   * Constructor
   * @param map           Google Map's map object
   * @param options       [options = {}] Optional parameters
   *                      [options.label = string] Label of the marker
   *                      [options.icon = string]  Icon of the marker
   *                      [options.shadow = string] Shadow of the marker
   *                      [options.draggable = boolean] Flag that indicate if the marker is draggable or not (default: true)
   */
  constructor(map: any, coordinates: number[], options: any){
    // Optional parameters
    if (options == void 0) { options = {}; }
    // Validate parameters
    if (!map) { throw new Error("The parameter 'map' is required but " + map + " was received"); }
    // Assignation
    this.map = map;
    this.createMarker(coordinates, options);
  }

  /**
   * Returns the coordinate of the marker
   * @return A coordinate, an array that contains a latitude and a longitude
   */
  public getCoordinate(){
    return [this.marker.position.lat(), this.marker.position.lng()];
  }

  /**
   * Set the coordinate of the marker
   * @param coordinates   Coordinates of the marker
   * @return              Marker object
   */
  public setCoordinate(coordinates: number[]){
    // Validate parameter
    if (!coordinates) { throw new Error("The parameter 'coordinates' is required but " + coordinates + " was received"); }
    if (coordinates.length !== 2){ throw new Error("The parameter 'coordinates' must contain a latitude and a longitude only"); }
    // Set Marker coordinates
    if (this.marker !== undefined && this.marker !== null){
      this.marker.setPosition({lat: coordinates[0], lng: coordinates[1]});
    } else{
      this.createMarker(coordinates);
    }
    return this.marker;
  }

  /**
   * Remove the marker from its map and set its value to undefined
   */
  public clearMarker(){
    this.marker.setMap(null);
    this.marker = undefined;
  }

  /**
   * Create and set a marker in the given coordinate
   * @param  coordinates    A coordinate [longitude, latitude]
   */
  private createMarker(coordinates: number[], options?: any){
    let parameters = { position: {lat: coordinates[0], lng: coordinates[1] }};
    Object.assign(parameters, options);
    this.marker = new google.maps.Marker(parameters);
    this.marker.setMap(this.map);
  }







}
