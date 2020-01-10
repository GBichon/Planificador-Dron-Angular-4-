declare var turf: any;

export class DCEL_Vertice{

  private coordinate: number[]

  constructor(coordinate: number[]){
    this.setCoordinate(coordinate);
  }

  /**
   * Returns the cordinate of the vertice
   * @return A coordinate, an array that contains a latitude and a longitude
   */
  public getCoordinate(): number[]{
    return this.coordinate;
  }

  /**
   * Returns the latitude of the vertice
   * @return A number, the latitude of the vertice
   */
  public getLat(): number{
    return this.coordinate[0];
  }

  /**
   * Returns the longitude of the vertice
   * @return A number, the longitude of the vertice
   */
  public getLng(): number{
    return this.coordinate[1];
  }

  /**
   * Set the coordinate of the vertice
   * @param  coordinate Any coordinate, an array that contains a latitude and a longitude
   */
  public setCoordinate(coordinate: number[]){
    // Validation
    if (!Array.isArray(coordinate)) throw new Error("Coordinate must be an array that contains a Latitude and a Longitude");
    if (coordinate.length !== 2) throw new Error("Coordinate must be an array that contains a Latitude and a Longitude");
    // Assignation
    this.coordinate = coordinate;
  }

  /**
   * Rotate the vertice at an specific angle around a given pivot point
   * @param  angle Angle of rotation in degrees (along the vertical axist),
   * @param  pivot A coordinate of the point around which the rotation will be performed
   * @param  roundingPrecision  Rounding precision for each coordinate
   */
  public rotate(angle: number, pivot: number[], roundingPrecision?: number){
    console.log("angle is " + angle );

    // Validation
    if (!Array.isArray(pivot)) throw new Error("Pivot coordinate must be an array that contains a Latitude and a Longitude");
    if (pivot.length !== 2) throw new Error("Pivot coordinate must be an array that contains a Latitude and a Longitude");
    // Assignation
    let ppoint = turf.point(pivot);
    let cpoint = turf.point(this.coordinate);
    console.log(ppoint, cpoint);
    let initialAngle = turf.rhumbBearing(ppoint, cpoint);

    let finalAngle = initialAngle + angle;
    let distance = turf.rhumbDistance(ppoint, cpoint);
    let newpoint = turf.rhumbDestination(ppoint, distance, finalAngle);
    let newcoord = turf.getCoords(newpoint);
    if (roundingPrecision){
      let newlatitude = turf.round(newcoord[0], roundingPrecision);
      let newlongitude = turf.round(newcoord[1], roundingPrecision);
      newcoord = [newlatitude, newlongitude];
    }
    this.setCoordinate(newcoord);
  }

  /**
   * Check if two vertices have the same coordinates
   * @param  other Any DCEL_Vertice object
   * @return       True if both object shares the same coordinates. False otherwise
   */
  public areEqual(other: DCEL_Vertice): boolean{
    let a = this.getCoordinate();
    let b = other.getCoordinate();
    return (a[0] === b[0] && a[1] === b[1]);
  }

  /**
   * Check if the coordinates of the vertice are the sames as the given coordinate
   * @param  coordA Any coordinate, an array that contains a latitude and a longitude
   * @return       True if both coordinates are the same. False otherwise
   */
  public hasEqualCoordinate(coordA: number[]): boolean{
    // Validation
    if (coordA.length !== 2) throw new Error("Coordinate must be an array that contains a Latitude and a Longitude");
    // Main
    let coordB = this.getCoordinate();
    return (coordA[0] === coordB[0] && coordA[1] === coordB[1]);
  }

  public isToTheWestOf(other: DCEL_Vertice): boolean{
    return this.getLng() < other.getLng();
  }

  public isToTheEastOf(other: DCEL_Vertice): boolean{
    return this.getLng() > other.getLng();
  }

  public hasSameLng(other: DCEL_Vertice): boolean{
    return this.getLng() === other.getLng();
  }

  public isToTheSouthOf(other: DCEL_Vertice): boolean{
    return this.getLat() < other.getLat();
  }

  public isToTheNorthOf(other: DCEL_Vertice): boolean{
    return this.getLat() > other.getLat();
  }

  public hasSameLat(other: DCEL_Vertice): boolean{
    return this.getLat() === other.getLat();
  }

}
