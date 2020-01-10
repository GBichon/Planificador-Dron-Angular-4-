import { Injectable } from '@angular/core';
import { TurfCoordinatesUtilsService } from './turf-coordinates-utils.service';


declare var turf: any;

@Injectable({
  providedIn: 'root'
})
export class TurfUtilsService {

  static instance : TurfUtilsService;

  constructor( private CoordinatesUtils : TurfCoordinatesUtilsService) {
    TurfUtilsService.instance = this;
  }

  /**
   * Rounds all of the polygon's coordinates
   * @param  polygon           Any GeoJSON Polygon
   * @param  roundingPrecision Rounding precision
   * @return                   GeoJson Polygon
   */
  public roundPolygonCoordinates(polygon : any, roundingPrecision: number){
    // Validations
    if (turf.getType(polygon) !== "Polygon"){
      throw new Error("Parameter 'polygon' is not a Turf Polygon Object");
    } else if ( roundingPrecision < 0 || roundingPrecision > 13){
      throw new Error("Parameter 'rounding precision' must be a number between 0 and 13");
    } else if ( roundingPrecision % 1 !== 0){
      throw new Error("Parameter parameter 'rounding precision' must be an integer number");
    }
    // Transform polygon coordinates
    let roundedCoordinates = turf.getCoords(polygon).map(
      overlayCoordinates => { return overlayCoordinates.map(
        coordinate => { return coordinate.map(
          value => { return turf.round(value, roundingPrecision)
        });
      });
    });
    // Return new polygon
    return turf.polygon(roundedCoordinates);
  }

  /**
   * Round coordinate's longitude and latitude
   * @param  coordinate        An array that contains a latitude and a longitude
   * @param  roundingPrecision Rounding precision
   * @return                   Returns an array that contains the rounded latitude and longitude
   */
  public roundCoordinate(coordinate : number[], roundingPrecision : number){
    return this.CoordinatesUtils.roundCoordinate(coordinate, roundingPrecision);
  }

  /**
   * Insert a coordinate into an array of coordinates, sorted from west to
   * east and from south to north
   * @param  array      An array of coordinates
   * @param  coordinate An array that contains a latitude and a longitude
   * @param  options    [options={}]  Optional parameters
   * @param  {boolean}  [options.westToEast]    A boolean flag. If true, the insertion is done sorted from west to east. Otherwise, it's sorted from east to west (default: true)
   * @param  {boolean}  [options.southToNorth]  A boolean flag. If true, the insertion is done sorted from south to north. Otherwise, it's sorted from north to south (default: true)
   * @param  {boolean}  [options.distinct]      A boolean flag. If true, the insertion will be done only if the coordinate doesn't exists in the array (default: false)
   *                    doesn't already exists in the array.
   */
  public insertCoordinateIntoArray(array : number[][], coordinate : number[], options? : any){
    if (options == void 0) { options = {}; }
    // Optional Parameters
    if (options.westToEast){
      if (typeof options.westToEast !== "boolean"){
        throw new Error("Option 'westToEast' must be a boolean value");
      }
    }
    if (options.southToNorth){
      if (typeof options.southToNorth !== "boolean"){
        throw new Error("Option 'southToNorth' must be a boolean value");
      }
    }
    if (options.distinct){
      if (typeof options.distinct !== "boolean"){
        throw new Error("Option 'distinct' must be a boolean value");
      }
    }

    let westToEast = (options.westToEast)? options.westToEast : true;
    let southToNorth = (options.southToNorth)? options.southToNorth : true;
    let distinct = (options.distinct)? options.distinct : false;
    this.CoordinatesUtils.sortedInsertion(array, coordinate, westToEast, southToNorth, distinct);
  }

  /**
   * Search a coordinate an an array of coordinates in a sorted manner
   * @param  array        An array that contains coordinates
   * @param  coordinate   An array that contains a latitude and longitude
   * @param  westToEast   A boolean flag. If true, the searh is done sorted from west to east
   * @param  southToNorth A boolean flag. If true, the searh is done sorted from south to north
   * @return              The index of the coordinate in the array. -1 if it doesn't exists in the array
   */
  public searchCoordinateInSortedArray(array, coordinate : number[], options?: any){
    if (options == void 0) { options = {}; }
    // Optional Parameters
    if (options.westToEast){
      if (typeof options.westToEast !== "boolean"){
        throw new Error("Option 'westToEast' must be a boolean value");
      }
    }
    if (options.southToNorth){
      if (typeof options.southToNorth !== "boolean"){
        throw new Error("Option 'southToNorth' must be a boolean value");
      }
    }
    let westToEast = (options.westToEast)? options.westToEast : true;
    let southToNorth = (options.southToNorth)? options.southToNorth : true;
    return this.CoordinatesUtils.sortedSeach(array, coordinate, westToEast, southToNorth);
  }

  /**
   * Check if two coordinates has the same value
   * @param  coordinateA An array that contains a latitude and longitude
   * @param  coordinateB An array that contains a latitude and longitude
   * @return             true if the two cordinates has the same value. false otherwise
   */
  public areCoordinatesEqual(coordinateA, coordinateB){
    return this.CoordinatesUtils.areCoordinatesEqual(coordinateA, coordinateB);
  }



  // Get the angles formed by the intersection of the edgeA and edgeB
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



  private getIndexOfPointFurtherToTheWestAndSouth(overlayCoords){
    let minLongitude = undefined;
    let minLatitude = undefined;
    let pointIndex = -1;
    overlayCoords.forEach( (overlayPoint, currentPointIndex) => {
      let currentLatitude = overlayPoint[0];
      let currentLongitude = overlayPoint[1];
      let updateWestSouthPoint = false;
      if (currentLongitude < minLongitude || minLongitude == undefined){
        updateWestSouthPoint = true;
      } else if ( currentLongitude == minLatitude && currentLatitude < minLatitude ){
        updateWestSouthPoint = true;
      }

      if (updateWestSouthPoint){
        minLatitude = currentLatitude;
        minLongitude = currentLongitude;
        pointIndex = currentPointIndex;
      }
    });
    return pointIndex;
  }

  private getIndexOfPointFurtherTotheEastAndSouth(coordinates){
    let maxLongitude = -1;
    let minLatitude = -1;
    let pointIndex = undefined;
    for (let i = 0; i < coordinates.length; i++){
      let pointLongitude = coordinates[i][1];
      let pointLatitude = coordinates[i][0];
      if ( pointLongitude > maxLongitude || pointIndex == undefined){
        maxLongitude = pointLongitude;
        minLatitude = pointLatitude;
        pointIndex = i;
      } else if ( pointLongitude == maxLongitude){
        if (pointLatitude < minLatitude){
          minLatitude = pointLatitude;
          pointIndex = i;
        }
      }
    }
    return pointIndex;
  }






  private getPolygonEdges(polygon){
    let polygonEdges = [];
    let polygonCoords = turf.getCoords(polygon);
    for (let i = 0; i < polygonCoords.length; i++){
      let currentCoords = polygonCoords[i];
      let currentEdges = [];
      for (let j = 0; j < currentCoords.length - 1; j++){
        let edge = turf.lineString([currentCoords[j], currentCoords[j+1]]);
        currentEdges.push(edge);
      }
      polygonEdges.push(currentEdges);
    }
    return polygonEdges;
  }






  getSidesLineString(polygon){
    let polygonCoords = turf.getCoords(polygon);
    let polygonLines = [];
    for (let i = 0; i < polygonCoords.length; i++){
      let lines = [];
      for (let j = 0; j < polygonCoords[i].length - 1; j++){
        let pointA = polygonCoords[i][j];
        let pointB = polygonCoords[i][j+1];
        let lineAB = turf.lineString([pointA, pointB]);
        lines.push(lineAB);
      }
      polygonLines.push(lines);
    }
    return polygonLines;
  }

  convertLineStringArrayToPolygon(lineStringArr){
    let coords = lineStringArr.map( ls => { return turf.getCoords(ls)[0] });
    coords.push(coords[0]);
    let polygon = turf.polygon([coords]);
    return polygon;
  }



  transformArrayOfLineStringToPolygon(lineStringArr){
    let coords = [];
    for (let i = 0; i < lineStringArr.length; i++){
      coords.push(turf.getCoords(lineStringArr[i])[0]);
    }
    let polygonLineString = turf.lineString(coords);
    let polygon = turf.lineToPolygon(polygonLineString);
    return polygon;
  }




  getLineStringBearing(line){
    let coords = turf.getCoords(line);
    let pointA = turf.point(coords[0]);
    let pointB = turf.point(coords[1]);
    let bearing = turf.bearing(pointA, pointB);
    if ( bearing < 0 ) bearing += 360;
    return bearing;
  }

  addAngleToBearing(bearing, angle){
    let newBearing = bearing + angle;
    if ( newBearing < 0 ) newBearing += 360;
    if ( newBearing > 360 ) newBearing -= 360;
    return newBearing;
  }

  pointArrayToTurfLineString(pointArr){
    let coordinates = []
    for (let i = 0; i < pointArr.length; i++){
      let coords = pointArr[i].geometry.coordinates;
      coordinates.push(coords);
    }
    return turf.lineString(coordinates);
  }

  pointArrayToTurfPolygon(pointArr){
    let lineString = this.pointArrayToTurfLineString(pointArr);
    return turf.lineToPolygon(lineString);
  }

  getIndexOfLineStringInArrayOfLineStrings(array, linestring){
    for (let currentIndex = 0; currentIndex < array.length; currentIndex++){
      if (array[currentIndex] == linestring){
        return currentIndex;
      }
    }
    return -1;
  }

  // Get an array that contains the position of each vertex of a polygon
  getPolygonVertexes(polygon){
    return turf.getCoords(polygon)[0].slice(-1);
  }







  convertLineStringtoMultiLineString(array){
    let lineMultiCoords = array.map( l => { return turf.getCoords(l) });
    return turf.multiLineString(lineMultiCoords);
  }

}
