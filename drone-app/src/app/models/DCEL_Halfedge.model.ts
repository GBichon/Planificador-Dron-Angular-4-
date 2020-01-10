import { TurfUtilsService } from './../services/turf/turf-utils.service';
import { DCEL_Vertice } from './DCEL_Vertice.model';
import { DCEL_Face } from './DCEL_Face.model';
declare var turf: any;

export class  DCEL_Halfedge{

  origin: DCEL_Vertice;
  end : DCEL_Vertice;
  face :  DCEL_Face;
  twin :  DCEL_Halfedge;
  next :  DCEL_Halfedge;
  prev :  DCEL_Halfedge;

  constructor(vertices: DCEL_Vertice[]){
    // Assignation
    this.setVertices(vertices);
    this.twin = undefined;
    this.next = undefined;
    this.prev = undefined;
    this.face = undefined;
  }

  /**
   * Set the vertices of the edge instance
   * @param  vertices An array of DCEL_Vertice that contains the origin and end of the edge
   */
  public setVertices(vertices: DCEL_Vertice[]){
    // Validation
    if (vertices.length !== 2) throw new Error("An edge requires two different vertices");
    if (vertices[0].areEqual(vertices[1])) throw new Error("An edge requires two different vertices");
    // Assignation
    this.origin = vertices[0];
    this.end = vertices[1];
  }

  /**
   * Set the DCEL_Halfedge that follows the current instance
   * @param  n_edge Any DCEL_Halfedge object
   * @param  autocomplete [Optional] A flag, if true it also sets the previous of the given edge as the current instance
   */
  public setNextEdge(n_edge: DCEL_Halfedge, autocomplete?: boolean){
    this.next = n_edge;
    if (autocomplete) {
      n_edge.setPrevEdge(this);
    }
  }

  /**
   * Set the DCEL_Halfedge that precedes the current instance
   * @param  p_edge Any DCEL_Halfedge object
   * @param  autocomplete Optional] A flag, if true it also sets the next of the given edge as the current instance
   */
  public setPrevEdge(p_edge: DCEL_Halfedge, autocomplete?: boolean){
    this.prev = p_edge;
    if (autocomplete) {
      p_edge.setNextEdge(this);
    }
  }

  /**
   * Set the twin DCEL_Halfedge of the current instance
   * @param  t_edge Any DCEL_Halfedge object
   * @param  autocomplete [Optional] A flag, if true it also sets the twin of the given edge as the current instance
   */
  public setTwinEdge(t_edge: DCEL_Halfedge, autocomplete?: boolean){
    this.twin = t_edge;
    if (autocomplete) {
      t_edge.setTwinEdge(this);
    }
  }

  /**
   * Set the Face of the current instance
   * @param  face Any DCEL_Face object
   */
  public setFace(face: DCEL_Face){
    this.face = face;
  }

  /**
   * Returns the edge as a GeoJSON LineString
   * @return A GeoJSON LineString
   */
  public getLineString(){
    return turf.lineString(this.getCoordinates());
  }

  /**
   * Returns the coordinates of the edge
   * @return An array of two coordinates
   */
  public getCoordinates(): number[][]{
    return [this.getOriginCoordinate(), this.getEndCoordinate()];
  }

  /**
   * Returns the vertices of the edges as an array of DCEL_Vertice objects
   * @return An DCEL_Vertice array that contains the origin and end vertice of the edge
   */
  public getVertices(): DCEL_Vertice[]{
    return [this.getOriginVertice(), this.getEndVertice()];
  }

  /**
   * Returns the coordinate of the origin vertice
   * @return An array that contains a Latitude and a Longitude
   */
  public getOriginCoordinate(): number[]{
    return this.getOriginVertice().getCoordinate();
  }

  /**
   * Returns the origin vertice of the edge as a DCEL_Vertice object
   * @return a DCEL_Vertice object
   */
  public getOriginVertice(): DCEL_Vertice{
    return this.origin;
  }

  /**
   * Returns the coordinate of the end vertice
   * @return An array that contains a Latitude and a Longitude
   */
  public getEndCoordinate(): number[]{
    return this.getEndVertice().getCoordinate();
  }

  /**
   * Returns the end vertice of the edge as a DCEL_Vertice object
   * @return a DCEL_Vertice object
   */
  public getEndVertice(): DCEL_Vertice{
    return this.end;
  }

  /**
   * Returns the DCEL_Halfedge that follows the current instance
   * @return an DCEL_Halfedge object
   */
  public getNextEdge(): DCEL_Halfedge{
    return this.next;
  }

  /**
   * Returns the DCEL_Halfedge that precedes the current instance
   * @return an DCEL_Halfedge object
   */
  public getPrevEdge(): DCEL_Halfedge{
    return this.prev;
  }

  /**
   * Returns the twin DCEL_Halfedge of the current instance
   * @return an DCEL_Halfedge object
   */
  public getTwinEdge(): DCEL_Halfedge{
    return this.twin;
  }

  /**
   * Get the Face of the current instance
   * @return a Face object
   */
  public getFace(): DCEL_Face{
    return this.face;
  }

  /**
   * Returns the Face at the opposite face of the current half edge
   * @return A DCEL_Face object
   */
  public getOppositeFace(): DCEL_Face{
    if (!this.getTwinEdge()){
      throw new Error("DCEL_Halfedge instance doesn't have a Face at its opposite side");
    }
    return this.getTwinEdge().getFace();
  }

  /**
   * Get the minimum latitude and maximum latitude of the DCEL_Halfedge instance
   * @return  An array that contains the minimum latitude and the maximum latitude
   */
  public getMinimumAndMaximumLatitude(): number[]{
    let latA = this.getOriginCoordinate()[0];
    let latB = this.getEndCoordinate()[0];
    let minLat = (latA < latB)? latA : latB;
    let maxLat = (latA > latB)? latA : latB;
    return [minLat, maxLat];
  }

  /**
   * Get the minimum longitude and maximum longitude of the DCEL_Halfedge instance
   * @return  An array that contains the minimum longitude and the maximum longitude
   */
  public getMinimumAndMaximumLongitude(): number[]{
    let lngA = this.getOriginCoordinate()[1];
    let lngB = this.getEndCoordinate()[1];
    let minLng = (lngA < lngB)? lngA : lngB;
    let maxLng = (lngA > lngB)? lngA : lngB;
    return [minLng, maxLng];
  }

  /**
   * Get the minimum longitude of the DCEL_Halfedge instance
   * @return A number, the minimum longitude
   */
  public getMinLongitude(): number{
    return this.getMinimumAndMaximumLongitude()[0];
  }

  /**
   * Get the maximum longitude of the DCEL_Halfedge instance
   * @return A number, the minimum longitude
   */
  public getMaxLongitude(): number{
    return this.getMinimumAndMaximumLongitude()[1];
  }

  /**
   * Get the minimum latitude of the DCEL_Halfedge instance
   * @return A number, the minimum longitude
   */
  public getMinLatitude(): number{
    return this.getMinimumAndMaximumLatitude()[0];
  }

  /**
   * Get the maximum latitude of the DCEL_Halfedge instance
   * @return A number, the minimum longitude
   */
  public getMaxLatitude(): number{
    return this.getMinimumAndMaximumLatitude()[1];
  }

  /**
   * Get the angle, in degrees, of the edge instance
   * @return A number between 0 and 180
   */
  public getAngle(): number{
    let start = this.getOriginCoordinate();
    let end = this.getEndCoordinate();
    let azimuth = turf.bearingToAzimuth(turf.rhumbBearing(start, end));
    let angle = azimuth % 180;
    return angle;
  }

  /**
   * Check if the  DCEL_Halfedge contains the given coordinate as one of its vertices
   * @param  coordinate   Any coordinate [latitude, longitude]
   * @return              True if the given coordinate is one of the DCEL_Halfedge's vertices. False if otherwise.
   */
  public containsCoordinateAsVertice(coordinate : number[]): boolean{
    return this.origin.hasEqualCoordinate(coordinate) || this.end.hasEqualCoordinate(coordinate);
  }

    /**
     * Check if the DCEL_Halfedge contains the given coordinate inbetween its longitudes
     * @param  coordinate   Any coordinate [latitude, longitude]
     * @return              True if the given coordinate is inbetween the DCEL_Halfedge's longitudes. False if otherwise.
     */
    public containsCoordinateLongitudeInBetween(coordinate : number[]): boolean{
      if (coordinate.length !== 2) throw new Error("Coordinate must be an array that contains a Latitude and a Longitude");
      let [cLat, cLng] = coordinate;
      let [minLng, maxLng] = this.getMinimumAndMaximumLongitude();
      return (minLng <= cLng && cLng <= maxLng);
    }

    /**
     * Clear the variables of the current instance
     */
    public clearObject(){
      this.prev = undefined;
      this.next = undefined;
      this.twin = undefined;
      this.face = undefined;
      this.origin = undefined;
      this.end = undefined;
    }


    /**
     * Set the preceding DCEL_Halfedge as undefined
     */
    public clearPrevEdge(){
      this.prev = undefined;
    }

    /**
     * Set the following DCEL_Halfedge as undefined
     */
    public clearNextEdge(){
      this.next = undefined;
    }

    /**
     * Set the twin DCEL_Halfedge as undefined
     */
    public clearTwinEdge(){
      this.twin = undefined;
    }

    /**
     * Set the Face as undefined
     */
    public clearFace(){
      this.face = undefined;
    }

}
