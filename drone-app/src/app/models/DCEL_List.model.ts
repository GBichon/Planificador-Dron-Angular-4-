import { TurfUtilsService } from './../services/turf/turf-utils.service';
import { DCEL_Vertice } from './DCEL_Vertice.model';
import { DCEL_Halfedge } from './DCEL_Halfedge.model';
import { DCEL_Face } from './DCEL_Face.model';
import { DCEL_Trapezoidalizer } from './DCEL_Trapezoidalizer.model';

declare var turf: any;


export class DCEL_List{

  _DCEL_Halfedges: any;       // A dictionary that lets you access to half edges using their origin coordinate as key. More than one half edge can have the same origin coordinate, therefore a key returns an array of edges.
  _DCEL_Vertices: any;        // A dictionary that lets you access to vertices using their coordinate as key.
  _DCEL_Faces: DCEL_Face[];         // An array of faces

  constructor(polygon?){
    //Initialization
    this._DCEL_Halfedges = {};
    this._DCEL_Vertices = {};
    this._DCEL_Faces = [];
    // Optional property
    if (polygon){
      this.addPolygonToDCEL(polygon);
    }
  }

  /**
   * Returns all of the DCEL_Halfedges stored in the current instance
   * @return An Array of DCEL_Halfedge objects
   */
  public getAllEdges(){
    return [].concat(...Object.values(this._DCEL_Halfedges));
  }

  /**
   * Returns the DCEL_Halfedges that has the given vertice as its origin
   * @param  origin Any coordinate
   * @return        An array of DCEL_Halfedge objects
   */
  public getEdgesByOriginCoordinate(origin: number[]){
    let key = (origin).toString()
    return (this._DCEL_Halfedges.hasOwnProperty(key)) ? this._DCEL_Halfedges[key] : [];
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
   * Returns true or false depending if the list instace has the given edge or not
   * @param  edge Any DCEL_Halfedge object
   * @return      true if the edge is present in the instance. Otherwise, false
   */
    public hasEdge(edge: DCEL_Halfedge): boolean{
    return this.getAllEdges().indexOf(edge) !== -1;
  }

  /**
   * Returns all of the DCEL_Vertices stored in the current DCEL instance
   * @return An array of DCEL_Vertices objects
   */
  public getVertices():DCEL_Vertice[]{
    return Object.values(this._DCEL_Vertices);
  }

  /**
   * Returns the DCEL_Vertice that contains the given coordinate
   * @param  coordinate Any coordinate
   * @return            A DCEL_Vertice object. Undefined if it doesn't exists in the DCEL instance
   */
  public getVertice(coordinate: number[]):DCEL_Vertice{
    return this._DCEL_Vertices[coordinate.toString()];
  }

  // Returns true if the DCEL instance contains the given vertice
  public hasVertice(vertice: DCEL_Vertice){
    return this.hasCoordinateAsVertice(vertice.getCoordinate());
  }

  /**
   * Returns true if the DCEL instance contains the coodinate as one of their vertices
   * @param  coordinate Any coordinate
   * @return            True if the coordinate of the vertice is already in the instance
   */
  public hasCoordinateAsVertice(coordinate: number[]):DCEL_Vertice{
    return this._DCEL_Vertices.hasOwnProperty(coordinate.toString());
  }

  /**
   * Returns all of the DCEL_Vertices stored in the current DCEL instance, sorted
   * from west to east and from south to north
   * @return An array of sorted DCEL_Vertices objects
   */
  public getSortedVertices(){
    let sorted = [];
    this.getVertices().forEach( v => {
      // Search for the insertion index
      const [vlat, vlng] = v.getCoordinate();
      let startidx = 0;
      let endidx = sorted.length - 1;
      while (startidx <= endidx){
        let mididx = Math.floor((startidx + endidx)/2);
        // Update the start index and end index
        let [midlat, midlng] = sorted[mididx].getCoordinate();
        if ( (vlng > midlng) || (vlng == midlng && vlat > midlat )){
          startidx = mididx + 1;
        } else if ( (vlng < midlng) || (vlng == midlng && vlat < midlat )){
          endidx = mididx - 1;
        }
      }
      // Insert the coordinate in the array
      sorted.splice(startidx, 0, v);
    });
    return sorted;
  }

  /**
   * Returns all of the veritces sotred in the current DCEL instance as an array of coordinates
   * @return An array of coordinates
   */
  public getCoordinates(){
    return this.getVertices().map( v => { return v.getCoordinate() });
  }

  /**
   * Returns all of the vertices coordinates stored in the current DCEL instance,
   * sorted from west to east and from south to north
   */
  public getSortedCoordinates(){
    return this.getSortedVertices().map( v => { return v.getCoordinate() });
  }

  /**
   * Returns all of the DCEL_Faces stored in the current instance
   * @return An array of DCEL_Face ibhects
   */
  public getFaces(){
    return this._DCEL_Faces;
  }

  /**
   * Add new DCEL_Halfedge to the array of half edges of the current DCEL instance
   * @param  edge Any DCEL_Halfedge object
   * @param  addVertice A flat. If True, it also adds the origin vertice to the array of vertices of this DCEL instance
   */
  public addHalfEdge(edge: DCEL_Halfedge){
    const origin = edge.getOriginCoordinate();
    let hedges = this.getEdgesByOriginCoordinate(origin);
    // Error condition. Don't add if it already exists
    if (hedges.indexOf(edge) === -1) {
      // Attach the edge to the list instance
      if (hedges.length === 0) this._DCEL_Halfedges[origin.toString()] = [];
      this._DCEL_Halfedges[origin.toString()].push(edge);
      // Attach the origin vertice to the edge instance
      this.addVertice(edge.getOriginVertice());
    }
  }

  /**
   * Add a new vertice to the array of DCEL_Vertices
   * @param  vertice Any DCEL_Vertice object
   */
  private addVertice(vertice: DCEL_Vertice){
    if (!this._DCEL_Vertices.hasOwnProperty(vertice.getCoordinate())){
      this._DCEL_Vertices[vertice.getCoordinate().toString()] = vertice;
    }
  }

  /**
   * Add new DCEL_Face to the array of faces
   * @param  face Any DCEL_Face object
   */
  private addFace(face: DCEL_Face){
    if (this.getFaces().indexOf(face) === -1) { this._DCEL_Faces.push(face) };
  }

  /**
   * Adds any GeoJSON Polygon to the current instance of ConnectedEdges
   * @param  polygon           any GeoJSON Polygon
   */
  public addPolygonToDCEL(polygon){
    // Validation
    if (turf.getType(polygon) !== "Polygon") throw new Error("Given object must be a GeoJSON Polygon");
    // Addition of Vertices and Edges
    let polygonHalfEdges = turf.getCoords(polygon).map( overlayCoordinates => {
      let overlayEdges = []
      overlayCoordinates.slice(0,-1).map( (coordinate, idx) => {
        const aCoordinate = coordinate;
        const bCoordinate = overlayCoordinates[idx + 1]
        const [alat, alng] = aCoordinate;
        const [blat, blng] = bCoordinate;
        let equalCoordinates = (alat === blat) && (alng === blng);
        if (equalCoordinates) return;
        // Create or retrieve the vertices
        const aWasCreated = this._DCEL_Vertices.hasOwnProperty(aCoordinate);
        const bWasCreated = this._DCEL_Vertices.hasOwnProperty(bCoordinate);
        let aVertice = (aWasCreated) ? this._DCEL_Vertices[aCoordinate.toString()] : new DCEL_Vertice(aCoordinate);
        let bVertice = (bWasCreated) ? this._DCEL_Vertices[bCoordinate.toString()] : new DCEL_Vertice(bCoordinate);
        if (!aWasCreated) this.addVertice(aVertice);
        if (!bWasCreated) this.addVertice(bVertice);
        // Create the edge
        let halfedge = new DCEL_Halfedge([aVertice, bVertice]);
        this.addHalfEdge(halfedge);
        overlayEdges.push(halfedge);
      })
      return overlayEdges;
    })
    // Addition of Face
    let face = new DCEL_Face(polygonHalfEdges.flat());
    this.addFace(face);
    // Attach neighbours and face properties to each halfedge
    polygonHalfEdges.forEach( overlayHalfedges  => {
      overlayHalfedges.forEach( (halfedge, i) => {
        // Set the face
        halfedge.setFace(face);
        // Set the neighbours
        let prev = (i === 0) ? overlayHalfedges[overlayHalfedges.length - 1] : overlayHalfedges[i-1];
        let next = (i === (overlayHalfedges.length - 1)) ? overlayHalfedges[0] : overlayHalfedges[i+1];
        halfedge.setPrevEdge(prev);
        halfedge.setNextEdge(next);
      })
    })
  }

  /**
   * Remove a halfedge object from the current DCEL_List instance
   * @param  halfedge Any DCEL_Halfedge object
   */
  public removeHalfEdge(halfedge: DCEL_Halfedge){
    // Update the prev, next and twin halfedges
    if (halfedge.getNextEdge() && halfedge.getNextEdge().getPrevEdge() === halfedge) halfedge.getNextEdge().clearPrevEdge();
    if (halfedge.getPrevEdge() && halfedge.getPrevEdge().getNextEdge() === halfedge) halfedge.getPrevEdge().clearNextEdge();
    if (halfedge.getTwinEdge() && halfedge.getTwinEdge().getTwinEdge() === halfedge) halfedge.getTwinEdge().clearTwinEdge();
    // Update the list of halfedges
    const origin = halfedge.getOriginVertice();
    const key = (origin.getCoordinate()).toString();
    // Remove from the list of edges
    let hedges = this._DCEL_Halfedges[key];
    let idx = hedges.indexOf(halfedge);
    if (idx !== -1){
      hedges.splice(idx, 1);
      // Remove vertice if necessary
      if (hedges.length === 0){
        this.removeVertice(origin);
      }
      // Reemove face if necessary
      let face = halfedge.getFace();
      face.removeHalfEdge(halfedge);
      if (face.getEdgeCount() === 0){
        this.removeFace(face);
      }
   }
  }

  /**
   * Remove a vertice object from the current DCEL_List instance
   * @param  vertice Any vertice
   */
  private removeVertice(vertice: DCEL_Vertice){
    let key = (vertice.getCoordinate()).toString();
    delete this._DCEL_Vertices[key];
    delete this._DCEL_Halfedges[key];
  }

  /**
   * Remove a face object stored in the current instance
   * @param  face Any DCEL_Face object
   */
  private removeFace(face: DCEL_Face){
    let index = this._DCEL_Faces.indexOf(face);
    if (index !== -1) this._DCEL_Faces.splice(index, 1);
  }

  /**
   * Remove the shared edge and merge the related faces
   * @param  sharedEdge Any DCEL_HalfEdge object
   * @return            The new merged Face
   */
  public mergeFaces(sharedEdge: DCEL_Halfedge): DCEL_Face{
    // Validations
    if (!this.hasEdge(sharedEdge)){ throw new Error("'sharedEdge' is not present in the DCEL_List object"); }
    if (!sharedEdge.getTwinEdge()){ throw new Error("'sharedEdge' is not shared by two faces "); }
    // Main
    const twin = sharedEdge.getTwinEdge();
    const faceA = sharedEdge.getFace();
    const faceB = twin.getFace();
    // Get data related to the shared half edge
    const nextA = sharedEdge.getNextEdge();
    const prevA = sharedEdge.getPrevEdge();
    const nextB = twin.getNextEdge();
    const prevB = twin.getPrevEdge();
    // Remove the shared edges from the list and face
    this.removeHalfEdge(sharedEdge);
    this.removeHalfEdge(twin);
    // Update the neighbours of the affected edges
    nextA.setPrevEdge(prevB);
    prevB.setNextEdge(nextA);
    nextB.setPrevEdge(prevA);
    prevA.setNextEdge(nextB);
    // Create a new face object out of the edges from both faces
    const edgesA = faceA.getAllEdges();
    const edgesB = faceB.getAllEdges();
    const newFace = new DCEL_Face(edgesA.concat(edgesB));
    // Remove both faces and add the new one
    this.removeFace(faceA);
    this.removeFace(faceB);
    this.addFace(newFace);
    return newFace;
  }

  public resetAllFaces(){
    // Make a copy of the halfedges
    let hfcopy = {};
    Object.keys(this._DCEL_Halfedges).forEach( k => {
      hfcopy[k] = this._DCEL_Halfedges[k].slice();
    })
    // Search for the new faces
    let facesArray = [];
    this.getSortedCoordinates().forEach( origin => {
      hfcopy[origin.toString()].forEach( edge => {
        // Remove edge from the half edges list
        let hfes = hfcopy[origin.toString()];
        if (hfes === undefined){ return; }
        let idx  = hfes.indexOf(edge);
        hfes.splice(idx, 1);
        // Initializa values
        let edgesArray = [edge];
        let startEdge = edge;
        let currentEdge = edge.getNextEdge();
        // Search for connected edges
        while( currentEdge !== undefined && startEdge !== currentEdge){
          // Remove edge form the half edges list
          hfes = hfcopy[currentEdge.getOriginCoordinate()];
          idx = hfes.indexOf(currentEdge);
          if (idx !== -1){ hfes.splice(idx, 1) }
          // Add edge to the list
          edgesArray.push(currentEdge);
          currentEdge = currentEdge.getNextEdge();
        }
        // Create the new face
        if (currentEdge !== startEdge  || edgesArray.length < 3){
          console.error("Failed to build a Face of a group of DCEL edges");
          edgesArray.forEach( e => { this.removeHalfEdge(e)} );
        }
        let face = new DCEL_Face(edgesArray);
        edgesArray.forEach( e => { e.setFace(face); });
        facesArray.push(face);
      });
    });
    this._DCEL_Faces = facesArray;

  }

  /**
   * Rotates the elements of the DCEL instance at a specified angle around a given pivot point
   * @param  angle Angle of rotation in degrees (along the vertical axist),
   * @param  pivot A coordinate of the point around which the rotation will be performed
   * @param  roundingPrecision  Rounding precision for each coordinate
   */
  public transformRotate(angle: number, pivot: number[], roundingPrecision?: number){
    // Backup of the variables
    let vertices = this.getVertices();
    let edges = this.getAllEdges();
    let faces = this.getFaces();
    // Reset the variables
    this._DCEL_Vertices = {};
    this._DCEL_Halfedges = {};
    // Rotate and update vertices
    vertices.forEach( v => { v.rotate(angle, pivot, roundingPrecision); });
    // Add every halfedge again
    edges.forEach( edge => { this.addHalfEdge(edge); });
    // Update every face
    faces.forEach( face => {
      let fedges = face.getAllEdges();
      face.clearFace();
      fedges.forEach( edge => { face.addHalfEdge(edge); });
    });
  }

  public trapezoidate(roundingPrecision?: number){
    this._DCEL_Faces.forEach( face => {
      let trapezoidalizer = new DCEL_Trapezoidalizer(this, face, roundingPrecision);
      trapezoidalizer.decompose();
    })
  }


}
