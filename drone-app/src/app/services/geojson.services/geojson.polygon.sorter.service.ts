import { GeoJson_Coordinate_Searcher_Service } from './geojson.coordinate.searcher.service';

declare var turf: any;

export class GeoJson_Polygon_Sorter_Service {

  constructor(){}

  SHIFTING_DIRECTIONS : any = { PREVIOUS_POINT : -1, NO_DIRECTION : 0, NEXT_POINT : 1 }

  /**
   * Sort a GeoJSON Polygon so their edges are sorted in a counter clockwise
   * way, using as starter point the coordinate that is further to the west and
   * then further to the south
   * @param  polygon [description]
   * @return         [description]
   */
  public sortCounterClockwise(polygon: any){

    // Services
    const CoordinateService = new GeoJson_Coordinate_Searcher_Service();

    // Validations
    if (turf.getType(polygon) !== "Polygon")
      throw new Error("The parameter 'polygon' was expected to be a GeoJson Polygon");

    return turf.polygon( turf.getCoords(polygon).map( (overlay_coordinates, overlay_index) => {

      overlay_coordinates = overlay_coordinates.slice(0, -1);

      // Get the west south point and its two neighbours
      let west_south_data = CoordinateService.searchWestSouthCoordinate(overlay_coordinates);
      let reference_index = west_south_data.coordinate_index;
      let reference_point = turf.point(west_south_data.coordinate);
      let previous_point  = turf.point(overlay_coordinates[(reference_index - 1 === -1)? (overlay_coordinates.length - 1) : (reference_index - 1)]);
      let next_point = turf.point(overlay_coordinates[(reference_index + 1 === overlay_coordinates.length)? (0) : (reference_index + 1)]);

      // Get the bearing of the reference point with its neighbours
      let previous_bearing = turf.rhumbBearing(reference_point, previous_point);
      let next_bearing = turf.rhumbBearing(reference_point, next_point);

      // Assume that the first overlay is the polygon and the other overlays
      // are obstacles. Only the polygon overlay is sorted counterclockwise.
      // Meanwhile the obstacles are sorted clockwise
      let reference_direction = (overlay_index === 0)?
          this.getCounterclockwiseDirection(previous_bearing, next_bearing):
          this.getClockwiseDirection(previous_bearing, next_bearing);

      // Shift the coordinates and obtain the new sorter coordinates for the
      // polygon overlay
      let new_overlay_coordinates= this.shiftCoordinates(overlay_coordinates, reference_index, reference_direction);
      new_overlay_coordinates.push(new_overlay_coordinates[0]);
      return new_overlay_coordinates;
    }));
  }

  /**
   * Shift the array of coordinates to the left or to the right depending on
   * the given start_index. If the coordinates must be shifted to the left, then
   * its inverse is used. The idea is having the coordinate at the start_index
   * as the new first coordinate in the array
   * @param  coordinates     An array of coordinates|
   * @param  start_index     Index of the coordinate that will become the first
   *                         element in the shifted array
   * @param  direction       Direction in which the shifting must be done
   */
  private shiftCoordinates(coordinates, start_index, direction){

    let shifted_coords = coordinates.slice();
    let shift_counter = -1;

    // Decides how the shifting should be done9
    if (direction === this.SHIFTING_DIRECTIONS.PREVIOUS_POINT){
      shifted_coords.reverse();
      shift_counter = shifted_coords.length - start_index;
    } else if (direction === this.SHIFTING_DIRECTIONS.NEXT_POINT){
      shift_counter = start_index;
    }

    // Remove first elements and push it to the end, until the coordinate
    // at start_index becomes the first element of the new array
    while (shift_counter > 0){
      let removed = shifted_coords.shift();
      shifted_coords.push(removed);
      shift_counter--;
    }

    return shifted_coords;
  }

  /**
   * Using the previous bearing and next bearing obtained by the south west,
   * decide what shifting direction must be used so the coordinates of a
   * polygon are sorted in a counterclockwise way
   */
  private getCounterclockwiseDirection(previous_bearing, next_bearing){
    let direction = this.SHIFTING_DIRECTIONS.NO_DIRECTION;
    if (previous_bearing == next_bearing){
      throw ("Something went wrong. Previous and Next bearing shouldn't be the same");
    } else if (previous_bearing > 90 || next_bearing > 90) {
      throw ("Something went wrong. Previous and/or Next bearing shouldn't be greater than 90 degrees");
    } else if (previous_bearing < -90 || next_bearing < -90) {
      throw ("Something went wrong. Previous and/or Next bearing shouldn't be lesser than 90 degrees");
    } else if (previous_bearing < 0 && next_bearing > 0){
      direction = this.SHIFTING_DIRECTIONS.PREVIOUS_POINT;
    } else if (previous_bearing > 0 && next_bearing < 0){
      direction = this.SHIFTING_DIRECTIONS.NEXT_POINT;
    } else if (previous_bearing >= 0 && next_bearing >= 0){
      direction = (next_bearing < previous_bearing) ? (this.SHIFTING_DIRECTIONS.NEXT_POINT) : (this.SHIFTING_DIRECTIONS.PREVIOUS_POINT);
    } else if (previous_bearing <= 0 && next_bearing <= 0){
      direction = (next_bearing < previous_bearing) ? (this.SHIFTING_DIRECTIONS.NEXT_POINT) : (this.SHIFTING_DIRECTIONS.PREVIOUS_POINT);
    }
    return direction;
  }

  /**
   * Using the previous bearing and next bearing obtained by the south west,
   * decide what shifting direction must be used so the coordinates of a
   * polygon are sorted in a clockwise way
   */
  private getClockwiseDirection(previous_bearing, next_bearing){
    let direction = this.SHIFTING_DIRECTIONS.NO_DIRECTION;
    if (previous_bearing == next_bearing){
      throw new Error("Something went wrong. Previous and Next bearing shouldn't be the same");
    } else if (previous_bearing > 90 || next_bearing > 90) {
      throw new Error("Something went wrong. Previous and/or Next bearing shouldn't be greater than 90 degrees");
    } else if (previous_bearing < -90 || next_bearing < -90) {
      throw new Error("Something went wrong. Previous and/or Next bearing shouldn't be lesser than 90 degrees");
    } else if (previous_bearing < 0 && next_bearing > 0){
      direction = this.SHIFTING_DIRECTIONS.NEXT_POINT;
    } else if (previous_bearing > 0 && next_bearing < 0){
      direction = this.SHIFTING_DIRECTIONS.PREVIOUS_POINT;
    } else if (previous_bearing >= 0 && next_bearing >= 0){
      direction = (next_bearing < previous_bearing) ? (this.SHIFTING_DIRECTIONS.PREVIOUS_POINT) : (this.SHIFTING_DIRECTIONS.NEXT_POINT);
    } else if (previous_bearing <= 0 && next_bearing <= 0){
      direction = (next_bearing < previous_bearing) ? (this.SHIFTING_DIRECTIONS.PREVIOUS_POINT) : (this.SHIFTING_DIRECTIONS.NEXT_POINT);
    }
    return direction;
  }

}
