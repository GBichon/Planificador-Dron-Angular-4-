import { Injectable } from '@angular/core';
declare var turf: any;

@Injectable({
  providedIn: 'root'
})
export class TurfCoordinatesUtilsService {

  /**
   * Round coordinate's longitude and latitude
   * @param  coordinate        An array that contains a latitude and longitude
   * @param  roundingPrecision Rounding precision
   * @return                   Returns an array that contains the rounded latitude and longitude
   */
  public roundCoordinate(coordinate : number[], roundingPrecision : number ){
    // Validations
    if ( roundingPrecision < 0 || roundingPrecision > 13){
      throw new Error("Parameter 'rounding precision' must be a number between 0 and 13");
    } else if ( roundingPrecision % 1 !== 0){
      throw new Error("Parameter parameter 'rounding precision' must be an integer number");
    }
    // Transform coordinates
    return coordinate.map( c => { return turf.round(c, roundingPrecision)});
  }

  /**
   * Check if two coordinates has the same value
   * @param  coordinateA An array that contains a latitude and longitude
   * @param  coordinateB An array that contains a latitude and longitude
   * @return             true if the two cordinates has the same value. false otherwise
   */
  public areCoordinatesEqual(coordinateA : number[], coordinateB : number[]){
    // Validations
    if (coordinateA.length !== 2 && coordinateB.length !== 2){
      throw new Error("A coordinate must have two values")
    }
    // Main
    let [aLatitude, aLongitude] = coordinateA;
    let [bLatitude, bLongitude] = coordinateB;
    return (aLatitude === bLatitude) && (aLongitude === bLongitude);
  }

  /**
   * Insert a coordinate to an array of coordinates in a sorted manner
   * @param  array        An array that contains coordinates
   * @param  coordinate   An array that contains a latitude and longitude
   * @param  westToEast   A boolean flag. If true, the insertion is done sorted from west to east
   * @param  southToNorth A boolean flag. If true, the insertion is done sorted from south to north
   * @param  distinct     A boolean flag. If true, the insertion will be done only if the coordinate doesn't exists in the array
   */
  public sortedInsertion(array : number[][], coordinate : number[], westToEast : boolean, southToNorth : boolean, distinct? : boolean){
    // Validations
    if (coordinate.length !== 2){
      throw new Error("A coordinate must have two values. A latitude and a longitude");
    }
    // Main script
    if (westToEast && southToNorth){
      this.sortedInsertionWESN(array, coordinate, distinct);
    } else if (westToEast && !southToNorth){
      this.sortedInsertionWENS(array, coordinate, distinct);
    } else if (!westToEast && southToNorth){
      this.sortedInsertionEWSN(array, coordinate, distinct);
    } else if (!westToEast && !southToNorth){
      this.sortedInsertionEWNS(array, coordinate, distinct);
    }
  }

  /**
   * Insert a coordinate to an array of coordinates, sorted from west to east
   * and from south to north
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @param  distinct   A boolean flag. If true, the insertion will be done only if the coordinate doesn't exists in the array
   */
  private sortedInsertionWESN(array : number[][], coordinate : number[], distinct? : boolean){
    // Search for the insertion index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      // If array already has the coordinate inserted in mid index
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        // Do not push if each coordinate in the array must be unique
        if (distinct == true) return;
        // Otherwise, the insertion index is the middle index found
        startIndex = midIndex;
        endIndex = midIndex - 1;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng > midLng) || (cLng == midLng && cLat > midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng < midLng) || (cLng == midLng && cLat < midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    // Insert the coordinate in the array
    array.splice(startIndex, 0, coordinate);
  }

  /**
   * Insert a coordinate to an array of coordinates, sorted from west to east
   * and from north to south
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @param  distinct   A boolean flag. If true, the insertion will be done only if the coordinate doesn't exists in the array
   */
  private sortedInsertionWENS(array : number[][], coordinate : number[], distinct? : boolean){
    // Search for the insertion index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      // If array already has the coordinate inserted in mid index
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        // Do not push if each coordinate in the array must be unique
        if (distinct == true) return;
        // Otherwise, the insertion index is the middle index found
        startIndex = midIndex;
        endIndex = midIndex - 1;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng > midLng) || (cLng == midLng && cLat < midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng < midLng) || (cLng == midLng && cLat > midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    // Insert the coordinate in the array
    array.splice(startIndex, 0, coordinate);
  }

  /**
   * Insert a coordinate to an array of coordinates, sorted from east to west
   * and from south to north
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @param  distinct   A boolean flag. If true, the insertion will be done only if the coordinate doesn't exists in the array
   */
  private sortedInsertionEWSN(array : number[][], coordinate : number[], distinct? : boolean){
    // Search for the insertion index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      // If array already has the coordinate inserted in mid index
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        // Do not push if each coordinate in the array must be unique
        if (distinct == true) return;
        // Otherwise, the insertion index is the middle index found
        startIndex = midIndex;
        endIndex = midIndex - 1;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng < midLng) || (cLng == midLng && cLat > midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng > midLng) || (cLng == midLng && cLat < midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    // Insert the coordinate in the array
    array.splice(startIndex, 0, coordinate);
  }

  /**
   * Insert a coordinate to an array of coordinates, sorted from east to west
   * and from north to south
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @param  distinct   A boolean flag. If true, the insertion will be done only if the coordinate doesn't exists in the array
   */
  private sortedInsertionEWNS(array : number[][], coordinate : number[], distinct? : boolean){
    // Search for the insertion index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      // If array already has the coordinate inserted in mid index
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        // Do not push if each coordinate in the array must be unique
        if (distinct == true) return;
        // Otherwise, the insertion index is the middle index found
        startIndex = midIndex;
        endIndex = midIndex - 1;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng < midLng) || (cLng == midLng && cLat < midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng > midLng) || (cLng == midLng && cLat > midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    // Insert the coordinate in the array
    array.splice(startIndex, 0, coordinate);
  }

  /**
   * Search a coordinate an an array of coordinates in a sorted manner
   * @param  array        An array that contains coordinates
   * @param  coordinate   An array that contains a latitude and longitude
   * @param  westToEast   A boolean flag. If true, the searh is done sorted from west to east
   * @param  southToNorth A boolean flag. If true, the searh is done sorted from south to north
   * @return              The index of the coordinate in the array. -1 if it doesn't exists in the array
   */
  public sortedSeach(array : number[][], coordinate : number[], westToEast : boolean, southToNorth : boolean){
    // Validations
    if (coordinate.length !== 2){
      throw new Error("A coordinate must have two values. A latitude and a longitude");
    }
    // Main script
    if (westToEast && southToNorth){
      return this.sortedSearchWESN(array, coordinate);
    } else if (westToEast && !southToNorth){
      return this.sortedSearchWENS(array, coordinate);
    } else if (!westToEast && southToNorth){
      return this.sortedSearchEWSN(array, coordinate);
    } else if (!westToEast && !southToNorth){
      return this.sortedSearchEWNS(array, coordinate);
    }
  }

  /**
   * Search a coordinate on an array of coordinates, sorted from west to east
   * and from south to north
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @return            The index of the coordinate in the array. -1 if it doesn't exists in the array
   */
  private sortedSearchWESN(array, coordinate){
    // Search for the coordinate index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        return midIndex;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng > midLng) || (cLng == midLng && cLat > midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng < midLng) || (cLng == midLng && cLat < midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    return -1;
  }


  /**
   * Search a coordinate on an array of coordinates, sorted from west to east
   * and from north to south
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @return            The index of the coordinate in the array. -1 if it doesn't exists in the array
   */
  private sortedSearchWENS(array : number[][], coordinate : number[], distinct? : boolean){
    // Search for the coordinate index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        return midIndex;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng > midLng) || (cLng == midLng && cLat < midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng < midLng) || (cLng == midLng && cLat > midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    return -1;
  }

  /**
   * Search a coordinate on an array of coordinates, sorted from east to west
   * and from south to north
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @return            The index of the coordinate in the array. -1 if it doesn't exists in the array
   */
  private sortedSearchEWSN(array : number[][], coordinate : number[], distinct? : boolean){
    // Search for the coordinate index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        return midIndex;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng < midLng) || (cLng == midLng && cLat > midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng > midLng) || (cLng == midLng && cLat < midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    return -1;
  }

  /**
   * Search a coordinate on an array of coordinates, sorted from east to west
   * and from north to south
   * @param  array      An array that contains coordinates
   * @param  coordinate An array that contains a latitude and longitude
   * @return            The index of the coordinate in the array. -1 if it doesn't exists in the array
   */
  private sortedSearchEWNS(array : number[][], coordinate : number[], distinct? : boolean){
    // Search for the coordinate index
    let [cLat, cLng] = coordinate;
    let startIndex = 0;
    let endIndex = array.length - 1;
    while (startIndex <= endIndex){
      let midIndex = Math.floor((startIndex + endIndex)/2);
      if (this.areCoordinatesEqual(coordinate, array[midIndex])){
        return midIndex;
      } else{
        // Update the start index and end index
        let [midLat, midLng] = array[midIndex];
        if ( (cLng < midLng) || (cLng == midLng && cLat < midLat )){
          startIndex = midIndex + 1;
        } else if ( (cLng > midLng) || (cLng == midLng && cLat > midLat )){
          endIndex = midIndex - 1;
        }
      }
    }
    return -1;
  }

}
