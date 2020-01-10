import { DCEL_Vertice } from './DCEL_Vertice.model';
import { DCEL_Halfedge } from './DCEL_Halfedge.model';
import { DCEL_Bounds } from './DCEL_Bounds.model';
declare var turf: any;

export class DCEL_Face{

  private _DCEL_Vertices: any;         // A dictionary that lets you access to vertices using their coordinate as key.
  private _DCEL_Halfedges: any;        // A dictionary that lets you access to half edges using their origin coordinate as key. More than one half edge can have the same origin coordinate, therefore a key returns an array of edges.
  private _sorted_vertices: any;       // An array of vertices, sorted from west to east and from south to north
  private _polygon : any;              // A GeoJSON Polygon
  private _properties: any;            // A dictionary that keeps track of any additional property that could be attached to the DCEL instance
  private _bounds: DCEL_Bounds         // An object that contains the extreme vertices
  private _dirty_sorted_vertices: boolean     // A flag that tracks when the sorted vertices array must be updated
  private _dirty_polygon: boolean             // A flag that tracks when the polygon must be updated
  private _dirty_bounds: boolean              // A flag that tracks when the bound vertices must be updated

  /**
   * Constructor
   * @param edges [optional] a list of DCEL_Halfedges that are going to be part of the current new Face instance
   */
  constructor(edges?: DCEL_Halfedge[]){
    // Optional parameters
    if (edges == void 0) { edges = []; }
    // Initialization
    this._DCEL_Halfedges = {};
    this._DCEL_Vertices = {};
    this._sorted_vertices = [];
    this._polygon = undefined;
    this._properties = {}
    this._bounds = new DCEL_Bounds();
    this._dirty_sorted_vertices = true;
    this._dirty_polygon = true;
    this._dirty_bounds = true;
    // In case the edges are given, add them to the instance
    edges.forEach(e => { this.addHalfEdge(e); });
  }

  /**
   * Returns all of the edges attached to the DCEL_Face instance
   * @return An array of Edges;
   */
  public getAllEdges(): DCEL_Halfedge[]{
    return [].concat(...Object.values(this._DCEL_Halfedges));
  }

  /**
   * Returns the amount of edges attached to the DCEL_Face instance
   * @return Amount of edges
   */
  public getEdgeCount(){
    return this.getAllEdges().length;
  }

  /**
   * Returns the DCEL_Halfedges that has the given vertice as its origin
   * @param  origin Any DCEL_Vertice object
   * @return        An array of DCEL_Halfedge objects
   */
  public getEdgesByOrigin(origin: DCEL_Vertice){
    return this.getEdgesByOriginCoordinate(origin.getCoordinate());
  }

  /**
   * Returns the DCEL_Halfedges that has the given vertice as its origin
   * @param  origin Any coordinate
   * @return        An array of DCEL_Halfedge objects
   */
  public getEdgesByOriginCoordinate(origin: number[]){
    let key = (origin).toString();
    return (this._DCEL_Halfedges.hasOwnProperty(key)) ? this._DCEL_Halfedges[key] : [];
  }

  /**
   * Returns all of the DCEL_Vertices stored in the current DCEL instance
   * @param sorted  [optional] If true, then it returns the DCEL_Vertices sorted from west to east, and from south to north
   * @return An array of DCEL_Vertices object
   */
  public getVertices(sorted?: boolean) : DCEL_Vertice[]{
    if (sorted){
      this.handleSortedVerticesDirtyness();
      return this._sorted_vertices;
    }
    return Object.values(this._DCEL_Vertices);
  }

  /**
   * Returns all of the vertices coordinates stored in the current DCEL instance
   * @param sorted  [optional] If true, then it returns the DCEL_Vertices sorted from west to east, and from south to north
   * @return An array of coordinates
   */
  public getCoordinates(sorted?: boolean) : number[][]{
    return this.getVertices(sorted).map( v => { return v.getCoordinate() });
  }

  /**
   * Returns the vertice further to the west and to the south
   * @return A DCEL_Vertice
   */
  public getSouthWestVertice(){
    this.handleBoundsDirtyness();
    return this._bounds.getSouthWest();
  }

  /**
   * Returns the vertice further to the east and to the north
   * @return A DCEL_Vertice
   */
  public getNorthEastVertice(){
    this.handleBoundsDirtyness();
    return this._bounds.getNorthEast();
  }

  /**
   * Returns the vertice further to the west and to the north
   * @return A DCEL_Vertice
   */
  public getNorthWestVertice(){
    this.handleBoundsDirtyness();
    return this._bounds.getNorthWest();
  }

  /**
   * Returns the vertice further to the east and to the south
   * @return A DCEL_Vertice
   */
  public getSouthEastVertice(){
    this.handleBoundsDirtyness();
    return this._bounds.getSouthEast();
  }

  /**
   * Get the GeoJSON Polygon formed by the DCEL_Face instance
   * @return A GeoJSON Polygon
   */
  public getPolygon(){
    this.handlePolygonDirtyness();
    return this._polygon;
  }

  /**
   * Returns the DCEL_Bounds attached to the Face instance
   * @return A DCEL_Bounds object
   */
  public getBounds(){
    this.handleBoundsDirtyness();
    return this._bounds;
  }

  /**
   * Returns all of the DCEL_Vertices that are at the extreme of the face, with
   * no repetition
   * @return An array of DCEL_Vertice objects
   */
  public getBoundsVertices(){
    this.handleBoundsDirtyness();
    return this._bounds.getDistinctVertices();
  }

  /**
   * Checks if the current DCEL instance contains the given edge or not
   * @param  edge Any DCEL_Halfedge
   * @return      boolean value
   */
  public hasEdge(edge: DCEL_Halfedge): boolean{
    return this.getEdgesByOrigin(edge.getOriginVertice()).indexOf(edge) !== -1;
  }

  /**
   * Checks if the current DCEL instance contains the given vertice or not
   * @param  vertice Any DCEL_Vertice
   * @return         a boolean
   */
  public hasVertice(vertice: DCEL_Vertice): boolean{
    return this.hasCoordinateAsVertice(vertice.getCoordinate());
  }

  /**
   * Returns true if the DCEL instance contains the coodinate as one of their vertices
   * @param  coordinate Any coordinate
   * @return            True if the coordinate of the vertice is already in the instance
   */

  public hasCoordinateAsVertice(coordinate: number[]): boolean{
    let key = coordinate.toString();
    return this._DCEL_Vertices.hasOwnProperty(key);
  }

  /**
   * Push the given DCEL_Halfedge to the array of edges attached to the DCEL_Face
   * instance
   * @param  edge Any DCEL_Halfedge
   * @param  addVertice A flag. If True, it also adds the origin vertice to the array of vertices of this DCEL instance
   */
  public addHalfEdge(edge: DCEL_Halfedge){
    const origin = edge.getOriginCoordinate();
    const key = origin.toString();
    let hedges = this.getEdgesByOriginCoordinate(origin);
    if (hedges.indexOf(edge) === -1){
      // In case the edge is not already in the face: attach it to the face
      // instance, update the face attached to the edge and add the new origin
      // vertice if it wasn't added before
      (hedges.length === 0)? this._DCEL_Halfedges[key] = [edge] : this._DCEL_Halfedges[key].push(edge);
      this.addVertice(edge.getOriginVertice());
      edge.setFace(this);
      // Update the Dirtyness flag
      this._dirty_bounds = true;
      this._dirty_polygon = true;
      this._dirty_sorted_vertices = true;
    }
  }

  /**
   * Removes an specific edge attached to the DCEL_Face instance
   * @param  edge Any DCEL_Halfedge
   */
  public removeHalfEdge(halfedge: DCEL_Halfedge){
    // Initialization of some variables
    let origin = halfedge.getOriginCoordinate();
    let hedges = this.getEdgesByOriginCoordinate(origin);
    let index = hedges.indexOf(halfedge);
    // Break condition
    if (index !== -1){
      // Remove the edge from its origin vertice
      hedges.splice(index, 1);
      // Remove the vertice if its not related to any edge anymore
      if (hedges.length === 0) {
        delete this._DCEL_Halfedges[origin.toString()];
        this.removeVertice(halfedge.getOriginVertice());
      }
      // Update the dirtyness flas
      this._dirty_bounds = true;
      this._dirty_polygon = true;
      this._dirty_sorted_vertices = true;
    }
  }

  /**
   * Add a new vertice to the array of DCEL_Vertices
   * @param  vertice Any DCEL_Vertice object
   */
  private addVertice(vertice: DCEL_Vertice){
    if (!this.hasVertice(vertice)){
      this._DCEL_Vertices[vertice.getCoordinate().toString()] = vertice;
    }
  }

  /**
   * Remove a vertice object from the current DCEL_List instance
   * @param  vertice Any coordinate
   */
  private removeVertice(vertice: any){
    delete this._DCEL_Vertices[vertice.getCoordinate()];
  }

  /**
   *  Set a new property with an specific value to the properties object
   * @param  key   key of the property
   * @param  value value of the property
   */
  public setProperty(key: string, value: any){
    this._properties[key] = value;
  }

  /**
   * Update the value of an already existing property. If the property doesn't
   * exists, then throws an error
   * @param  key   key of the property
   * @param  value value of the property
   */
  public updatePropertyValue(key: string, value: any){
    if (!this.hasProperty(key)) { throw new Error("Face doesn't have the property '" + key +"' attached"); }
    this.setProperty(key, value);
  }

// Properties related functions

  /**
   * Check if the current DCEL instance has an specific property
   * @param  key key of the property
   * @return     true if the Face has the given property key. Otherwise, false
   */
  public hasProperty(key: string){
    return this._properties.hasOwnProperty(key);
  }

  /**
   * Check if the current DCEL instance has an specific property with a value
   * equal to the given one. If the property doesn't exists in the instance,
   * then throws an error
   * @param  key   key of the property
   * @param  value comparison value
   * @return       true if the Face has the given property value. Otherwise, false
   */
  public isPropertyEqualTo(key: string, value: any){
    if (!this.hasProperty(key)) { return false; }
    return this._properties[key] === value;
  }

  /**
   * Get the value of an specific property
   * @param  key key of the property
   * @return     value of the property
   */
  public getPropertyValue(key: string): any{
    if (!this.hasProperty(key)) throw new Error("DCEL_Face doesn't have attached the property '" + key + "'");
    return this._properties[key];
  }

  /**
   * Remove a property from the current instance
   * @param  key key of the property
   */
  private removeProperty(key: string){
    delete this._properties[key];
  }

// Dirty related functions

  /** Update the sorted vertices variable and clean its dirtyness **/
  private handleSortedVerticesDirtyness(){
    if (this._dirty_sorted_vertices){
      this.updateSortedVertices();
      this._dirty_sorted_vertices = false;
    }
  }

  /** Update the polygon variable and clean its dirtyness **/
  private handlePolygonDirtyness(){
    if (this._dirty_polygon){
      this.updatePolygon();
      this._dirty_polygon = false;
    }
  }

  /** Update the bounds variable and clean its dirtyness **/
  private handleBoundsDirtyness(){
    if (this._dirty_bounds){
      this._bounds.updateBounds(this.getVertices());
      this._dirty_bounds = false;
    }
  }

// Private functions

  /**  Update the array of sorted vertices **/
  private updateSortedVertices(){
    this._sorted_vertices = [];
    this.getVertices().forEach( v => { this.addToSortedVertices(v) });
  }

  /**
   * Add a vertice to the array that is sorted according to their coordinates,
   * from west to east and from south to north
   * @param  v  Any DCEL_Vertice
   */
  private addToSortedVertices(v:DCEL_Vertice){
    // Initializate start and end index
    let startidx = 0;
    let endidx = this._sorted_vertices.length - 1;
    // Searh for the insertion index
    while(startidx <= endidx){
      let mididx = Math.floor((startidx + endidx)/2);
      let m = this._sorted_vertices[mididx];
      if ( (v.isToTheEastOf(m)) || (v.hasSameLng(m) && v.isToTheNorthOf(m)) ){
        startidx = mididx + 1;
      } else if ( (v.isToTheWestOf(m)) || (v.hasSameLng(m) && v.isToTheSouthOf(m)) ){
        endidx = mididx - 1;
      }
    }
    // Insert the vertice in the sorted array
    this._sorted_vertices.splice(startidx, 0, v);
  }

  /**
   * Rebuilts the GeoJSON Polygon that can be obtained out of the edges of this
   * face intance
   */
  private updatePolygon(){
    let polygonCoordinates = [];
    let edgescpy = this.getAllEdges().slice(0);
    while (edgescpy.length !== 0){
      let starterEdge = edgescpy.splice(0, 1)[0];
      let overlayCoordinates = [starterEdge.getOriginCoordinate()];
      let currentEdge = starterEdge.getNextEdge();
      while( currentEdge && currentEdge !== starterEdge && edgescpy.length !== 0){
        overlayCoordinates.push(currentEdge.getOriginCoordinate());
        edgescpy.splice(edgescpy.indexOf(currentEdge), 1);
        currentEdge = currentEdge.getNextEdge();
      }
      // Ignore if a polygon couldn't be formed out of the group of edges
      if (currentEdge !== starterEdge){
        console.error("Failed to make a ring out of the given starter edge because of lack of an edge connected to the starter edge"); return;
      } else if (overlayCoordinates.length <= 2){
        console.error("Failed to make a ring out of the given starter edge because of lack of edges. 3 or more of them are required"); return;
      }
      // If the edges forms a ring, push their coordinates to the polyon
      overlayCoordinates.push(overlayCoordinates[0]);
      polygonCoordinates.push(overlayCoordinates);
    }
    this._polygon = turf.polygon(polygonCoordinates);
  }

  /** Removes all of the half edges and vertices **/
  public clearFace(){
    this._DCEL_Vertices = {};
    this._DCEL_Halfedges = {};
    this._sorted_vertices = [];
    this._polygon = undefined;
    this._bounds.clearBounds();
    this._dirty_sorted_vertices = true;
    this._dirty_polygon = true;
    this._dirty_bounds = true;
  }


}
