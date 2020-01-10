declare var turf: any;

export class GeoJson_Polygon_Service {

  constructor(){}


  /**
   * Create and returns a GeoJSON Polygon created from the given coordinates
   * @param  coordinates An array of polygon coordinates
   * @return             A GeoJSON Polygon
   */
  public transformToGeoJsonPolygon(overlay_coordinates: number[][][]){

    return turf.polygon(overlay_coordinates.map( coordinates => {

      if (coordinates.length < 3)
        throw new Error("The parameter 'overlay_coordinates' must have at least 3 coordinates in an overlay but " + coordinates.length + " were received in one of them");

      if (coordinates.length === 3 && coordinates[0][0] === coordinates[2][0] && coordinates[0][1] === coordinates[2][1])
        throw new Error("The parameter 'overlay_coordinates' must have at least 3 coordinates in an overlay but 2 were received in one of them");

      // If the last element is not the same as the first one, then push it
      let start = coordinates[0];
      let end = coordinates[coordinates.length - 1];
      let cpy = coordinates.slice();
      if (start[0] !== end[0] || start[1] !== end[1]){ cpy.push(start); }
      return cpy;
    }));

  }

  /**
   * Returns the angles of every edge in the polygon, with no repetition
   * @param  polygon            Any GeoJSON Polygon
   * @param  roundingPrecision  [Optional] Rounding precision of the angles
   * @return          An array of angles that goes from 0 to 180, non including
   *                  the last one
   */
  public getAngles(polygon: any, roundingPrecision?: number): number[]{

    // Validation
    if (turf.getType(polygon) !== "Polygon")
      throw new Error("The parameter 'polygon' was expected to be a GeoJson Polygon");

    // Get Angles
    let angles = [];
    turf.getCoords(polygon).forEach(overlayCoordinates => {
      overlayCoordinates.slice(0, -1).forEach((c, i) => {
        let start = turf.point(overlayCoordinates[i]);
        let end = turf.point(overlayCoordinates[ (i == overlayCoordinates.length - 2)? (0) : (i+1) ]);
        let angle = turf.bearingToAzimuth(turf.rhumbBearing(start, end)) % 180;
        if (roundingPrecision !== void 0) angle = turf.round(angle, roundingPrecision);
        if (angles.indexOf(angle) === -1) angles.push(angle);
      });
    });
    return angles;
  }

}
