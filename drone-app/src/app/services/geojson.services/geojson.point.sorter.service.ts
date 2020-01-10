declare var turf: any;

export class GeoJson_Point_Sorter_Service {

  constructor(){ }

  /**
   * Sort an array of points from south to north
   * @param  points   An array of GeoJSON points
   * @param  options  [options = {}] Optional parameters
   *                  [options.disctinct = boolean] If the sorted array must have
   *                  unique points or not (default: false)
   *                  [options.mutate = boolean] If the original array will be
   *                  mutated or not (default: false);
   * @return          An array of sorted GeoJSON points
   */
  public sortPointsFromSouthToNorth(points: any[], options?: any): any[]{

    // Validations
    if (!points)
      throw new Error("Expected an array of GeoJSON points but " + points + " was received");

    points.forEach( point => {
      if (turf.getType(point) !== "Point")
        throw new Error("All of the points in the array must be a GeoJSON Point");
    });

    if (options && options.hasOwnProperty("distinct")){
      if (typeof options.distinct !== "boolean")
        throw new Error("A boolean was expected in the optional parameters 'distinct'");
    }

    if (options && options.hasOwnProperty("mutate")){
      if (typeof options.mutate !== "boolean")
        throw new Error("A boolean was expected in the optional parameters 'mutate'");
    }

    // Parameters transformation
    if (options == void 0) { options = {}; }
    const distinct = (options.hasOwnProperty("distinct"))? options.distinct : false;
    const mutate = (options.hasOwnProperty("mutate"))? options.mutate : false;

    // Main Script
    let sorted_points = [];
    points.forEach( point => {

      // Initialize loop variables
      let insertion_index = 0;
      let loop_ready = insertion_index < points.length;
      let insertion_should_be_done = true;

      // Loop and find the insertion index
      const [latitude, longitude] = turf.getCoord(point);
      while (insertion_index < points.length && !loop_ready){
        const [other_latitude, other_longitude] = turf.getCoord(points[insertion_index])[0];
        (latitude <= other_latitude)? (loop_ready = true) : (insertion_index++);
        if (distinct === true && latitude === other_latitude && longitude === other_longitude){
          insertion_should_be_done = false;
        }
      }

      // Insert the point if necessary
      if (insertion_should_be_done){ sorted_points.splice(insertion_index, 0, point); }

    });

    // Mutate original if necessary
    if (mutate){
      points.splice(0, points.length).splice(0, 0, ...sorted_points);
    }

    return sorted_points;
  }

}
