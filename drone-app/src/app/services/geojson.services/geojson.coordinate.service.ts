declare var turf: any;

export class GeoJson_Coordinate_Service {

  constructor(){}

  /**
   * Round coordinate's longitude and latitude
   * @param  coordinate        An array that contains a latitude and longitude
   * @param  roundingPrecision Rounding precision
   * @return                   Returns an array that contains the rounded latitude and longitude
   */
  public roundCoordinate(coordinate : number[], roundingPrecision : number ){

    // Validations
    if (coordinate.length !== 2)
      throw new Error("Parameter 'coordinate' was expected to be a coordinate");

    if ( roundingPrecision < 0 || roundingPrecision > 13)
      throw new Error("Parameter 'rounding precision' must be a number between 0 and 13");

    if ( roundingPrecision % 1 !== 0)
      throw new Error("Parameter parameter 'rounding precision' must be an integer number");

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
