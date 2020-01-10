import { TurfUtilsService } from './../services/turf/turf-utils.service';
import { DCEL_List } from './DCEL_List.model';
import { DCEL_Halfedge } from './DCEL_Halfedge.model';
import { DCEL_Face } from './DCEL_Face.model';
import { DCEL_Vertice } from './DCEL_Vertice.model';

declare var turf: any;

export class DCEL_Trapezoidalizer{

  DCEL_List: DCEL_List;
  DCEL_Face: DCEL_Face;
  roundingPrecision: number;

  constructor(list: DCEL_List, face: DCEL_Face, roundingPrecision?: number){
    this.DCEL_List = list;
    this.DCEL_Face = face;
    this.roundingPrecision = (roundingPrecision)? roundingPrecision : -1;
  }

  public decompose(){
    let trapezoidDecompositionPoints = this.getTrapezoidDecompositionPoints();
    this.splitIntersectedSegments(trapezoidDecompositionPoints);
    this.splitFace(trapezoidDecompositionPoints);
  }

  private splitFace(trapezoidDecompositionPoints: any){
    trapezoidDecompositionPoints.forEach( tdp => {
      tdp.slice(0,-1).forEach( (p, i) => {
        // Retrieve origin and end vertices
        let origin = this.DCEL_List.getVertice(tdp[i].intersectedCoordinate);
        let end = this.DCEL_List.getVertice(tdp[i+1].intersectedCoordinate);
        // Validations
        if (origin.areEqual(end)){
          console.error("Decomposition Line couldn't be created because it starts and end in the same vertice");
          return;
        }
        // Check if the line exists already, and returns if it does
        let edges = this.DCEL_List.getEdgesByOrigin(origin);
        for (let j = 0; j < edges.length; j++){
          if (edges[j].getOriginVertice().areEqual(origin) && edges[j].getEndVertice().areEqual(end)){
            console.error("Decomposition Line already exists");
            return;
          }
        }

        // Retrieve the correct edge that intersects at origin
        let oEdge = undefined;
        let minAngle = 720;
        this.DCEL_List.getEdgesByOrigin(origin).forEach( edge => {
          let A = turf.point(end.getCoordinate());
          let O = turf.point(origin.getCoordinate());
          let B = turf.point(edge.getEndCoordinate());
          let azimuthAO = turf.bearingToAzimuth(turf.rhumbBearing(A,O));
          let azimuthOB = turf.bearingToAzimuth(turf.rhumbBearing(B,O));
          let angle = azimuthAO - azimuthOB;
          angle = (angle < 0 )? (360 + angle) : (angle);
          if (angle < minAngle) {
            oEdge = edge;
            minAngle = angle;
          }
        });
        // Retrieve the correct edge that intersects at end
        let eEdge = undefined
        minAngle = 720;
        this.DCEL_List.getEdgesByOrigin(end).forEach( edge => {
          let A = turf.point(end.getCoordinate());
          let O = turf.point(origin.getCoordinate());
          let B = turf.point(edge.getEndCoordinate());
          let azimuthAO = turf.bearingToAzimuth(turf.rhumbBearing(A,O));
          let azimuthOB = turf.bearingToAzimuth(turf.rhumbBearing(B,O));
          let angle = azimuthAO - azimuthOB;
          angle = (angle < 0 )? (360 + angle) : (angle);
          if (angle < minAngle){
            eEdge = edge;
            minAngle = angle;
          }
        });
        // Cant't split if the edge doesn't intersect the polygon on both extremes
        if (oEdge === undefined || eEdge === undefined){
          console.error("Decomposition Line couldn't be created because it doesn't intersects the polygon in both of its vertices");
          return;
        }
        // Creating new halfedges
        let hf = new DCEL_Halfedge([origin, end]);
        let tf = new DCEL_Halfedge([end, origin]);
        // Setting the twins
        hf.setTwinEdge(tf);
        tf.setTwinEdge(hf);
        // Setting the neighbours of the new halfedges
        hf.setPrevEdge(oEdge.getPrevEdge());
        hf.setNextEdge(eEdge);
        tf.setPrevEdge(eEdge.getPrevEdge());
        tf.setNextEdge(oEdge);
        // Setting the neighbours of the already existing halfedges
        oEdge.getPrevEdge().setNextEdge(hf);
        oEdge.setPrevEdge(tf);
        eEdge.getPrevEdge().setNextEdge(tf);
        eEdge.setPrevEdge(hf);
        // Adding the new halfedges to the DCEL_List
        this.DCEL_List.addHalfEdge(hf);
        this.DCEL_List.addHalfEdge(tf);
      });
    });
    this.DCEL_List.resetAllFaces();
  }


  /**
   * Uses the points in which a segment was intersected by the trapezoidalization
   * and split al of the intersected segments
   * @param  trapezoidDecompositionPoints Array of intersections, an object that contains intersected coordinate and intersected edge
   */
  private splitIntersectedSegments(trapezoidDecompositionPoints: any[]){
    let replacedEdges = {}
    trapezoidDecompositionPoints.forEach( (intersects, i) => {
      intersects.forEach( (intersect, j) => {
        // Get the intersection elements
        let iEdge = intersect.intersectedEdge;
        let iCoord = intersect.intersectedCoordinate;
        if (iEdge && !iEdge.containsCoordinateAsVertice(iCoord)){
          iEdge = (replacedEdges.hasOwnProperty(iEdge.getCoordinates().toString()))? replacedEdges[iEdge.getCoordinates().toString()] : iEdge;
          // Validation
          if (!iEdge.containsCoordinateLongitudeInBetween(iCoord)){
            throw new Error("Edge can't be splitted because the midCoord is not in between the edge vertices");
          } else if(iEdge.containsCoordinateAsVertice(iCoord)){
            return; //  No need to split if the segment was intersected in one of its vertices
          }
          // Check if the intersected coordinate alredy exists as vertice
          const isInList = this.DCEL_List.hasCoordinateAsVertice(iCoord);
          const isInFace = this.DCEL_Face.hasCoordinateAsVertice(iCoord);
          // Get the vertices of the halfedges
          const origin = iEdge.getOriginVertice();
          const end = iEdge.getEndVertice();
          const mid = (isInList) ? this.DCEL_List.getVertice(iCoord) : new DCEL_Vertice(iCoord);
          // Create the new halfedges
          let firstEdge = new DCEL_Halfedge([origin, mid]);
          let secondEdge = new DCEL_Halfedge([mid, end]);
          // Get the data contained by the intersected edge
          let prevIEdge = iEdge.getPrevEdge();
          let nextIEdge = iEdge.getNextEdge();
          let twinIEdge = iEdge.getTwinEdge();
          // Update the DCEL_List and DCEL_Face object
          this.DCEL_List.removeHalfEdge(iEdge);
          this.DCEL_List.addHalfEdge(firstEdge);
          this.DCEL_List.addHalfEdge(secondEdge);
          this.DCEL_Face.addHalfEdge(firstEdge);
          this.DCEL_Face.addHalfEdge(secondEdge);
          // Update the DCEL_Halfedge objects
          firstEdge.setFace(this.DCEL_Face);
          secondEdge.setFace(this.DCEL_Face);
          if (prevIEdge) prevIEdge.setNextEdge(firstEdge);
          firstEdge.setPrevEdge(prevIEdge);
          firstEdge.setNextEdge(secondEdge);
          secondEdge.setPrevEdge(firstEdge);
          secondEdge.setNextEdge(nextIEdge);
          if (nextIEdge) nextIEdge.setPrevEdge(secondEdge);
          // Update the twins of the new edge
          if (twinIEdge){
            // Create the new twins halfedges
            let firstTwin = new DCEL_Halfedge([mid, origin]);
            let secondTwin = new DCEL_Halfedge([end, mid]);
            // Get the data contained by the twin intersected edge
            let prevTEdge = twinIEdge.getPrevEdge();
            let nextTEdge = twinIEdge.getNextEdge();
            let twinTEdge = twinIEdge.getTwinEdge();
            let faceTEdge = twinIEdge.getFace();
            // Update the DCEL_List and DCEL_Face object
            this.DCEL_List.removeHalfEdge(twinIEdge);
            this.DCEL_List.addHalfEdge(firstTwin);
            this.DCEL_List.addHalfEdge(secondTwin);
            faceTEdge.addHalfEdge(firstTwin, true);
            faceTEdge.addHalfEdge(secondTwin, true);
            // Update the DCEL_Halfedge objects
            firstTwin.setFace(faceTEdge);
            secondTwin.setFace(faceTEdge);
            if (prevTEdge) prevTEdge.setNextEdge(firstTwin);
            firstTwin.setPrevEdge(prevTEdge);
            firstTwin.setNextEdge(secondTwin);
            secondTwin.setPrevEdge(firstTwin);
            secondTwin.setNextEdge(twinTEdge);
            if (twinTEdge) twinTEdge.setPrevEdge(secondTwin);
            // Update the twins halfedges
            firstEdge.setTwinEdge(firstTwin);
            firstTwin.setTwinEdge(firstEdge);
            secondEdge.setTwinEdge(secondTwin);
            secondTwin.setTwinEdge(secondEdge);
          }
          // Update the replaced edges object
          if (firstEdge.getMinLongitude() <= secondEdge.getMinLongitude()){
            replacedEdges[intersect.intersectedEdge.getCoordinates().toString()] = secondEdge;
            trapezoidDecompositionPoints[i][j] = this.createIntersectionObject(iCoord, firstEdge);
          } else{
            replacedEdges[intersect.intersectedEdge.getCoordinates().toString()] = firstEdge;
            trapezoidDecompositionPoints[i][j] = this.createIntersectionObject(iCoord, secondEdge);
          }
        }
      })
    })
  }


  /**
   * Get the points were vertical lines, projected from each vertice, intersects
   * with the polygon related to the DCEL_Face object
   * @return An double array of coordinates. Each array of coordinates represents
   *         the points in which a single vertical line intersected the polygon
   */
  private getTrapezoidDecompositionPoints(){
    const polygon = this.DCEL_Face.getPolygon();
    const vertices = this.DCEL_Face.getVertices(true);
    const halfedges = this.DCEL_Face.getAllEdges();
    // Validations
    if (!polygon) throw new Error("Couldn't make a polygon out of the DCEL_Face for some reason");
    // Find the points where the vertical decomposition lines intersect with the edges;
    let decompositionIntersectionsPoints = [];
    for (let index = 0; index < vertices.length; index++){
      let origin = vertices[index].getCoordinate();
      let activeEdges = this.getActiveEdges(origin);
      let intersections = this.getIntersectionsTowardsActiveEdges(activeEdges, origin);
      let [lowerIntersections, upperIntersections] = this.differentiateLowerAndUpperIntersections(intersections, origin);
      this.removeNonVisibleIntersections(polygon, lowerIntersections, origin);
      this.removeNonVisibleIntersections(polygon, upperIntersections, origin);
      if (lowerIntersections.length + upperIntersections.length > 0){
        let originIntersection = this.createIntersectionObject(origin, undefined);
        let allIntersections = lowerIntersections.reverse().concat(originIntersection).concat(upperIntersections);
        decompositionIntersectionsPoints.push(allIntersections);
      }
      // Skip the vertices that were already intersected by the decomposition line
      // projected by the current vertice
      if (upperIntersections.length !== 0){
        let lastIntersection = upperIntersections[upperIntersections.length - 1];
        if (lastIntersection.intersectedEdge.containsCoordinateAsVertice(lastIntersection.intersectedCoordinate)){
          index += upperIntersections.length;
        } else{
          index += upperIntersections.length - 1;
        }
      }
    }
    return decompositionIntersectionsPoints;
  }

  /**
   * Returns the active edges respective to the given origin coordinate. That is,
   * all of the edges whose minimum and maximum longitudes contains in between
   * the longitude of the origin coordinate, all of the edges that doesn't
   * have the given coordinate as one of its vertices and, finally, all of the
   * edges that aren't a vertical line.
   * @param  origin Any coordinate
   * @return        A filtered array of DCEL_Halfedges;
   */
  private getActiveEdges(origin: number[]){
    return this.DCEL_Face.getAllEdges().filter( e => {
      return  !e.containsCoordinateAsVertice(origin) &&  e.containsCoordinateLongitudeInBetween(origin) && (e.getOriginCoordinate()[1] !== e.getEndCoordinate()[1]);
    });
  }

  /**
   * Returns an Array of Intersections that are obtained by projecting a vertical
   * line towards every active edge
   * @param  activeEdges       An array of 'active' DCEL_Halfedges
   * @param  origin            The origin coordinate from where the vertical line will be projected
   * @return                   An array of Intersection objects
   */
  private getIntersectionsTowardsActiveEdges(activeEdges: DCEL_Halfedge[], origin: number[]){
    return activeEdges.map( e => {
      return this.getIntersectionTowardsEdge(e, origin);
    });
  }

  /**
   * Returns an Intersection obtained by projecting a vertical line towards the
   * given edge
   * @param  edge              Any DCEL_Halfedge object
   * @param  origin            The origin coordinate from where the vertical line will be projected
   * @return                   An Intersection object
   */
  private getIntersectionTowardsEdge(edge : DCEL_Halfedge, origin : number[]){
    let [oLat, oLng] = origin;
    let [minLat, maxLat] = edge.getMinimumAndMaximumLatitude();
    let furtherLatDifference = Math.max(Math.abs(oLat - minLat), Math.abs(oLat - maxLat));
    let decompLineOrigin = [oLat - furtherLatDifference * 2, oLng];
    let decompLineEnd = [oLat + furtherLatDifference * 2, oLng];
    let decompLine = turf.lineString([decompLineOrigin, decompLineEnd]);
    let decompLineIntersect = turf.lineIntersect(edge.getLineString(), decompLine);
    if (decompLineIntersect.features.length !== 1){
      throw new Error("Happened " + decompLineIntersect.features.length + " intersections in an active edge");
    }
    let intersectedCoord = turf.getCoord(decompLineIntersect.features[0]);
    intersectedCoord = (this.roundingPrecision !== -1) ? TurfUtilsService.instance.roundCoordinate(intersectedCoord, this.roundingPrecision) : intersectedCoord;
    return this.createIntersectionObject(intersectedCoord, edge);
  }

  /**
   * Create an Intersection Object
   * @param  intersectedCoordinate Intersected coordinate
   * @param  intersectedEdge       Intersected edge
   * @return                       An Intersection object
   */
  private createIntersectionObject(intersectedCoordinate: number[], intersectedEdge: DCEL_Halfedge){
    return {intersectedCoordinate: intersectedCoordinate, intersectedEdge: intersectedEdge};
  }

  /**
   * Returns two arrays of coordinates. The first array containing the lower
   * intersections. In other words, the intersections that were obtained by
   * projecting a vertical line from the origin vertice to the south; On the
   * other hand, the second array contains the upper intersections. That means,
   * the intersections that were obtained by projecting a vertical line from the
   * origin vertice to the north.
   * @param  intersections  An array of Intersection objects
   * @param  origin         The origin coordinate from where the vertical line was projected
   * @return                [Array of lower intersection coordinates, Array of upper intersection coordinates]
   */
  private differentiateLowerAndUpperIntersections(intersections: any[], origin: number[]){
    const [oLat, oLng] = origin;
    let lowerIntersections = [], upperIntersections = [];
    intersections.forEach( i => {
      let [iLat, iLng] = i.intersectedCoordinate;
      if (iLat > oLat){
        this.pushIntersectionFromSouthToNorth(upperIntersections, i);
      } else if (iLat < oLat){
        this.pushIntersectionFromNorthToSouth(lowerIntersections, i);
      } else{ // Ignore
        //throw new Error("There shouldn't be an intersection with the same coordinate as the origin");
      }
    });
    return [lowerIntersections, upperIntersections];
  }

  /**
   * Push the Intersection object into the given array, keeping the elements sorted
   * from north to south in terms of the coordinates of the intersected
   * point
   * @param  array          An array of Intersection objects
   * @param  intersection   An Intersection object
   */
  private pushIntersectionFromNorthToSouth(array: any[], intersection: any){
    const oLatitude = intersection.intersectedCoordinate[0];
    let insertionIndex = 0;
    while (insertionIndex < array.length){
      let iLatitude = array[insertionIndex].intersectedCoordinate[0];
      if (oLatitude > iLatitude){
        break;
      }
      insertionIndex++;
    }
    array.splice(insertionIndex, 0, intersection);
  }

  /**
   * Insert the Intersection into the given array, keeping the elements sorted
   * from south to north in terms of the coordinates of the intersected
   * point
   * @param  array          An array of Intersection objects
   * @param  intersection   An Intersection object
   */
  private pushIntersectionFromSouthToNorth(array: any[], intersection: any){
    const oLatitude = intersection.intersectedCoordinate[0];
    let insertionIndex = 0;
    while (insertionIndex < array.length){
      let iLatitude = array[insertionIndex].intersectedCoordinate[0];
      if (oLatitude < iLatitude){
        break;
      }
      insertionIndex++;
    }
    array.splice(insertionIndex, 0, intersection);
  }

  /**
  * Remove the intersections objects, from the given array, that are not visible
  * from the point of view of the origin coordinate
  * @param  polygon       A GeoJSON Polygon
  * @param  intersections An array of Intersection objects obtained by the projection of a decomposition line
  * @param  origin        A coordinate from where the decomposition line was projected
  */
  private removeNonVisibleIntersections(polygon, intersections: any[], origin: number[]){

    for (let i = 0; i < intersections.length; i++){
      let oCoord = (i == 0) ? origin : intersections[i-1].intersectedCoordinate;
      let iCoord = intersections[i].intersectedCoordinate;

      // Check if the middle point obtained from both coordinates falls
      // outside of the polygon. If so, then that means that the decomposition
      // line that goes from oCoord to iCoord goes through outside of the
      // polygon
      if (this.isMiddlePointOutsidePolygon(polygon, oCoord, iCoord)){
        intersections.splice(i, intersections.length);
        return;
      }

      // Get the intersections that share the same intersection coordinate and
      // keep only the one whose intersected edge forms the smaller angle with
      // the vertical line of decomposition.
      let sharedIntersections = [intersections[i]];
      let [minSharedLng, maxSharedLng] = intersections[i].intersectedEdge.getMinimumAndMaximumLongitude();
      for (let j = i + 1; j < intersections.length; j++){
        if (!this.areCoordinatesEqual(intersections[i].intersectedCoordinate, intersections[j].intersectedCoordinate)){
          break; // Break condition
        }
        let [minLng, maxLng] = intersections[j].intersectedEdge.getMinimumAndMaximumLongitude();
        minSharedLng = (minLng < minSharedLng) ? minLng : minSharedLng;
        maxSharedLng = (maxLng > maxSharedLng) ? maxLng : maxSharedLng;
        sharedIntersections.push(intersections[j]);
      }
      let verticalEdgeCoords = [oCoord, iCoord];
      let smallerAngle = 360;
      let smallerAngleIntersection = undefined;
      for (let j = 0; j < sharedIntersections.length; j++){
        let intersectedEdge = sharedIntersections[j].intersectedEdge;
        let angle = 360;
        if (this.areCoordinatesEqual(iCoord, intersectedEdge.getOriginCoordinate())){
          angle = this.getAngleBetweenEdges(verticalEdgeCoords, intersectedEdge.getCoordinates());
        } else if (this.areCoordinatesEqual(iCoord, intersectedEdge.getEndCoordinate())){
          angle = this.getAngleBetweenEdges(verticalEdgeCoords, intersectedEdge.getCoordinates().slice().reverse());
        } else{
          angle = this.getAngleBetweenEdges(verticalEdgeCoords, [iCoord, intersectedEdge.getEndCoordinate()]);
          angle = (angle > 90) ? (angle - 180) : (angle);
        }
        if (angle < smallerAngle){
          smallerAngle = angle;
          smallerAngleIntersection = sharedIntersections[j];
        }
      }

      // Check if the shared intersections forms a wall that blocks the visibility
      // from the points of view of the origin coordinate.
      let wallEncountered =  minSharedLng < iCoord[1] && iCoord[1] < maxSharedLng;

      // Keep only one of the shared intersections. IF a wall is encountered,
      // then the algorithm doesn't continues
      if (wallEncountered){
        intersections.splice(i, intersections.length, smallerAngleIntersection);
        return;
      } else{
        intersections.splice(i, sharedIntersections.length, smallerAngleIntersection);
      }
    }
  }

  private isMiddlePointOutsidePolygon(polygon, coordA, coordB){
    let pointA = turf.point(coordA);
    let pointB = turf.point(coordB);
    let midPoint = turf.midpoint(pointA, pointB);
    return !turf.booleanWithin(midPoint, polygon);
  }

  public getAngleBetweenEdges(edgeA, edgeB){
    // Validations
    if (edgeA.length != 2){
      throw new Error("EdgeA must have two values. A latitude and a longitude");
    }
    if (edgeB.length != 2){
      throw new Error("EdgeB must have two values. A latitude and a longitude");
    }
    if (!this.areCoordinatesEqual(edgeA[1], edgeB[0])){
      throw new Error("EdgeA and EdgeB are not connected by a middle point");
    }
    //Main
    let A = turf.point(edgeA[0]);
    let O = turf.point(edgeA[1]);
    let B = turf.point(edgeB[1]);
    let azimuthAO = turf.bearingToAzimuth(turf.rhumbBearing(A,O));
    let azimuthOB = turf.bearingToAzimuth(turf.rhumbBearing(B,O));
    let angle = Math.abs(azimuthAO - azimuthOB);
    //console.log("AO: " + azimuthAO, "OB: " + azimuthOB, "angle: " + angle);
    return angle;
  }

  /**
   * Check if two coordinates has the same value
   * @param  coordinateA An array that contains a latitude and longitude
   * @param  coordinateB An array that contains a latitude and longitude
   * @return             true if the two cordinates has the same value. false otherwise
   */
  public areCoordinatesEqual(coordinateA : number[], coordinateB : number[]){

    // Validations
    if (coordinateA.length !== 2)
      throw new Error("Parameter 'coordinateA' was expected to be a coordinate");

    if (coordinateB.length !== 2)
      throw new Error("Parameter 'coordinateB' was expected to be a coordinate");

    // Comparison
    let [aLatitude, aLongitude] = coordinateA;
    let [bLatitude, bLongitude] = coordinateB;
    return (aLatitude === bLatitude) && (aLongitude === bLongitude);
  }



}
