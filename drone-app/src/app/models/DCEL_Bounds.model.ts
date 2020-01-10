import { DCEL_Vertice } from './DCEL_Vertice.model';

export class  DCEL_Bounds{

  private _min_latitude: number;       // The value of the minimum latitude of whoever owns this bound object
  private _min_longitude: number;      // The value of the minimum longitude of whoever owns this bound object
  private _max_latitude: number;       // The value of the maximum latitude of whoever owns this bound object
  private _max_longitude: number;      // The value of the maximum longitude of whoever owns this bound object
  private _ws: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the west and then to the south
  private _wn: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the west and then to the north
  private _es: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the east and then to the south
  private _en: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the east and then to the north
  private _sw: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the south and then to the west
  private _se: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the south and then to the east
  private _nw: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the north and then to the west
  private _ne: DCEL_Vertice;           // A Vertice that keeps track of the face coordinate that is most to the north and then to the east

  constructor(){
    this._min_latitude = NaN;
    this._min_longitude = NaN;
    this._max_latitude = NaN;
    this._max_longitude = NaN;
    this._ws = undefined;
    this._wn = undefined;
    this._es = undefined;
    this._en = undefined;
    this._sw = undefined;
    this._se = undefined;
    this._nw = undefined;
    this._ne = undefined;
  }

  /**
   * Get the bound vertices without repeating them
   * @return An array of DCEL_Vertices
   */
  public getDistinctVertices(){
    let vertices = [];
    if (vertices.indexOf(this._ws) === -1){ vertices.push(this._ws); }
    if (vertices.indexOf(this._wn) === -1){ vertices.push(this._wn); }
    if (vertices.indexOf(this._es) === -1){ vertices.push(this._es); }
    if (vertices.indexOf(this._en) === -1){ vertices.push(this._en); }
    if (vertices.indexOf(this._sw) === -1){ vertices.push(this._sw); }
    if (vertices.indexOf(this._se) === -1){ vertices.push(this._se); }
    if (vertices.indexOf(this._nw) === -1){ vertices.push(this._nw); }
    if (vertices.indexOf(this._ne) === -1){ vertices.push(this._ne); }
    return vertices;
  }

  /**
   * Get the minimum latitude contained by the Bound object
   * @return A number
   */
  public getMinimumLatitude(): number{
    return this._min_latitude;
  }

  /**
   * Get the minimum longitude contained by the Bound object
   * @return A number
   */
  public getMinimumLongitude(): number{
    return this._min_longitude;
  }

  /**
   * Get the maximum latitude contained by the Bound object
   * @return A number
   */
  public getMaximumLatitude(): number{
    return this._max_latitude;
  }

  /**
   * Get the maximum longitude contained by the Bound object
   * @return A number
   */
  public getMaximumLongitude(): number{
    return this._max_longitude;
  }

  /**
   * Get the west south vertice
   * @return A DCEL_Vertice
   */
  public getWestSouth(){
    return this._ws;
  }

  /**
   * Get the west north vertice
   * @return A DCEL_Vertice
   */
  public getWestNorth(){
    return this._wn;
  }

  /**
   * Get the east south vertice
   * @return A DCEL_Vertice
   */
  public getEastSouth(){
    return this._es;
  }

  /**
   * Get the east north vertice
   * @return A DCEL_Vertice
   */
  public getEastNorth(){
    return this._en;
  }

  /**
   * Get the south west vertice
   * @return A DCEL_Vertice
   */
  public getSouthWest(){
    return this._sw;
  }

  /**
   * Get the south east vertice
   * @return A DCEL_Vertice
   */
  public getSouthEast(){
    return this._se;
  }

  /**
   * Get the north west vertice
   * @return A DCEL_Vertice
   */
  public getNorthWest(){
    return this._nw;
  }

  /**
   * Get the north east vertice
   * @return A DCEL_Vertice
   */
  public getNorthEast(){
    return this._ne;
  }

  /**
   * Update the bound vertices depending on the given vertice
   * @param  vertice An array of DCEL_Vertice
   */
  public updateBounds(vertices: DCEL_Vertice[]){
    vertices.forEach( vertice => {
      this.updateMinLatitude(vertice);
      this.updateMinLongitude(vertice);
      this.updateMaxLatitude(vertice);
      this.updateMaxLongitude(vertice);
      this.updateWestNorth(vertice);
      this.updateWestSouth(vertice);
      this.updateEastNorth(vertice);
      this.updateEastSouth(vertice);
      this.updateSouthEast(vertice);
      this.updateSouthWest(vertice);
      this.updateNorthEast(vertice);
      this.updateNorthWest(vertice);
    });
  }

  /** Clear the value of every vertice attached to the instance */
  public clearBounds(){
    this._min_latitude = NaN;
    this._min_longitude = NaN;
    this._max_latitude = NaN;
    this._max_longitude = NaN;
    this._ws = undefined;
    this._wn = undefined;
    this._es = undefined;
    this._en = undefined;
    this._sw = undefined;
    this._se = undefined;
    this._nw = undefined;
    this._ne = undefined;
  }

  /** Update the minimum longitude if needed **/
  private updateMinLatitude(vertice: DCEL_Vertice){
    if (isNaN(this._min_latitude) || vertice[0] < this._min_latitude ){
      this._min_latitude = vertice[0];
    }
  }

  /** Update the minimum longitude if needed **/
  private updateMinLongitude(vertice: DCEL_Vertice){
    if (isNaN(this._min_longitude) || vertice[1] < this._min_longitude ){
      this._min_longitude = vertice[1];
    }
  }

  /** Update the minimum longitude if needed **/
  private updateMaxLatitude(vertice: DCEL_Vertice){
    if (isNaN(this._max_latitude) || vertice[0] > this._max_latitude ){
      this._max_latitude = vertice[0];
    }
  }

  /** Update the maximum longitude if needed **/
  private updateMaxLongitude(vertice: DCEL_Vertice){
    if (isNaN(this._max_longitude) || vertice[1] > this._max_longitude ){
      this._max_longitude = vertice[1];
    }
  }

  /** Update the WestSouth vertice if needed **/
  private updateWestSouth(vertice: DCEL_Vertice){
    let condition = (this._ws === undefined) ||
                    (vertice.isToTheWestOf(this._ws)) ||
                    (vertice.hasSameLng(this._ws) && vertice.isToTheSouthOf(this._ws));
    if (condition) this._ws = vertice;
  }

  /** Update the WestNorth vertice if needed **/
  private updateWestNorth(vertice: DCEL_Vertice){
    let condition = (this._wn === undefined) ||
                    (vertice.isToTheWestOf(this._wn)) ||
                    (vertice.hasSameLng(this._wn) && vertice.isToTheNorthOf(this._wn));
    if (condition) this._wn = vertice;
  }

  /** Update the EastSouth vertice if needed **/
  private updateEastSouth(vertice: DCEL_Vertice){
    let condition = (this._es === undefined) ||
                    (vertice.isToTheEastOf(this._es)) ||
                    (vertice.hasSameLng(this._es) && vertice.isToTheSouthOf(this._es));
    if (condition) this._es = vertice;
  }

  /** Update the EastNorth vertice if needed **/
  private updateEastNorth(vertice: DCEL_Vertice){
    let condition = (this._en === undefined) ||
                    (vertice.isToTheEastOf(this._en)) ||
                    (vertice.hasSameLng(this._en) && vertice.isToTheNorthOf(this._en));
    if (condition) this._en = vertice;
  }

  /** Update the SouthWest vertice if needed **/
  private updateSouthWest(vertice: DCEL_Vertice){
    let condition = (this._sw === undefined) ||
                    (vertice.isToTheSouthOf(this._sw)) ||
                    (vertice.hasSameLat(this._sw) && vertice.isToTheWestOf(this._sw));
    if (condition) this._sw = vertice;
  }

  /** Update the SouthEast vertice if needed **/
  private updateSouthEast(vertice: DCEL_Vertice){
    let condition = (this._se === undefined) ||
                    (vertice.isToTheSouthOf(this._se)) ||
                    (vertice.hasSameLat(this._se) && vertice.isToTheEastOf(this._se));
    if (condition) this._se = vertice;
  }

  /** Update the NorthWest vertice if needed **/
  private updateNorthWest(vertice: DCEL_Vertice){
    let condition = (this._nw === undefined) ||
                    (vertice.isToTheSouthOf(this._nw)) ||
                    (vertice.hasSameLat(this._nw) && vertice.isToTheWestOf(this._nw));
    if (condition) this._nw = vertice;
  }

  /** Update the NorthEast vertice if needed **/
  private updateNorthEast(vertice: DCEL_Vertice){
    let condition = (this._ne === undefined) ||
                    (vertice.isToTheNorthOf(this._ne)) ||
                    (vertice.hasSameLat(this._ne) && vertice.isToTheEastOf(this._ne));
    if (condition) this._ne = vertice;
  }

}
