declare var google: any;

export class GMAP_Coordinates_Service {

  constructor(){}

  /**
   * Returns the coordinates of the given polygon
   * @param  polygon Any google map polygon
   * @return         An array of coordinates
   */
  public getCoords(polygon: any){

      if (polygon == void 0)
        throw new Error("Expected a polygon object but " + polygon + " was received");

      return polygon.getPath().getArray().map( p => { return [p.lat(), p.lng()]; });
  }

  


}
