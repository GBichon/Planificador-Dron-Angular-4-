declare var turf: any;
import { GeoJson_Coordinate_Searcher_Service } from './geojson.coordinate.searcher.service';
import { GeoJson_Point_Sorter_Service } from './geojson.point.sorter.service';

export class GeoJson_SweepPlane_Service {


  constructor(){}

  /**
   * Return the maximum number of passes in an edge that can be done in a polygon
   * @param  polygon     Any GeoJSON polygon
   * @param  scan_width  Separation distance of each sweep line (in kilometers)
   * @param  scan_angle  Angle of each sweep line (in degrees)
   * @return             A multiLineString object
   */
   public sweepPlane(polygon: any, scan_width: number, scan_angle: number, scan_origin?: number[]){

    // Parameters validation
    if (!polygon)
      throw new Error("Expected a GeoJSON Polygon but " + polygon + " was received");

    if (isNaN(scan_width))
      throw new Error("Expected a number in 'scan_width' but NaN was received");

    if (scan_width <= 0)
      throw new Error("'scan_width' must be a positive value'");

    if (isNaN(scan_angle))
      throw new Error("Expected a number in 'scan_angle' but NaN was received");

    // Services declaration
    const CoordinateService = new GeoJson_Coordinate_Searcher_Service();
    const PointService = new GeoJson_Point_Sorter_Service();

    // Transformation
    scan_angle = scan_angle % 180;

    // Get the rotation pivot point
    const polygon_bbox = turf.bbox(polygon);
    const pivotLat = polygon_bbox[0];
    const pivotLng = polygon_bbox[1];
    const pivot_point = [pivotLat, pivotLng];

    // Rotate polygon so the sweeplines can be done vertically
    const rotation_angle = 90 - scan_angle;
    const rotated_polygon = turf.transformRotate(polygon, rotation_angle, {pivot: pivot_point });

    // Get the bounds of the rotated polygon
    const rotated_polygon_bbox = turf.bbox(rotated_polygon);
    const minLat = rotated_polygon_bbox[0];
    const minLng = rotated_polygon_bbox[1];
    const maxLat = rotated_polygon_bbox[2];
    const maxLng = rotated_polygon_bbox[3];

    // Search for the point that is further to the west and south and use it as starting point
    const ws_point = CoordinateService.searchWestSouthCoordinate(turf.getCoords(rotated_polygon).flat()).coordinate;
    let start_longitude = turf.getCoord(turf.rhumbDestination(turf.point(ws_point), scan_width/2, 0))[1];
    if (start_longitude > maxLng) { start_longitude = minLng + Math.abs(minLng-maxLng)/2 }

    // Create the vertical sweeplines from step to step to the east
    let sweep_line_points = [];
    for (let currentLng = start_longitude; currentLng < maxLng; ){

      // Create the vertical line
      let A = [minLat, currentLng];
      let B = [maxLat, currentLng];
      let Line = turf.lineString([A, B]);

      // Get the intersection points with the polygon
      let IntersectionPoints = turf.lineIntersect(Line, rotated_polygon).features;
      if (IntersectionPoints.length > 1){
        // Sort intersections from distance from A to the intersection
        let sorted_intersections = []
        IntersectionPoints.forEach( ip => {
          let idx = 0;
          let ip_distance = turf.distance(turf.point(A), ip);
          while (idx < sorted_intersections.length ){
            let other_distance = turf.distance(turf.point(A), sorted_intersections[idx]);
            if (ip_distance < other_distance){
              break;
            } else{
              idx++;
            }
          }
          sorted_intersections.splice(idx,0,ip);
        })

        // Build the sweeplines out of each pair of intersection points
        for( let idx = 0; idx < sorted_intersections.length; idx += 2){
          if (idx + 1 < sorted_intersections.length){
            let A = sorted_intersections[idx];
            let B = sorted_intersections[idx+1];
            sweep_line_points.push([A, B]);
          }
        }
      }

      let distanceToMax = turf.distance(turf.point([minLat, currentLng]), turf.point([minLat, maxLng]));
      if ( distanceToMax > (scan_width/2) && distanceToMax <= scan_width){
        currentLng = maxLng;
      } else{
        currentLng = turf.getCoord(turf.rhumbDestination(turf.point([minLat, currentLng]), scan_width, 0))[1]
      }
    }

    // Rotate the points
    let sweep_line_coordinates = sweep_line_points.map( points => {
      let A = turf.getCoord(turf.transformRotate(points[0], - rotation_angle, {pivot: pivot_point}));
      let B = turf.getCoord(turf.transformRotate(points[1], - rotation_angle, {pivot: pivot_point}));
      return [A, B];
    });

    // Build the sweep line object
    return turf.multiLineString(sweep_line_coordinates);
  }


  /**
  * Check if a polygon can do a single sweep line (start_longitude not greater than max longitude)
   * @param  polygon     Any geojson polygon
   * @param  scan_width  width of the scan
   * @param  scan_number scan number
   */
  public canPolygonDoAtLeastASingleSweep(polygon: any, scan_width: number, scan_angle: number){

        // Parameters validation
        if (!polygon)
          throw new Error("Expected a GeoJSON Polygon but " + polygon + " was received");

        if (isNaN(scan_width))
          throw new Error("Expected a number in 'scan_width' but NaN was received");

        if (scan_width <= 0)
          throw new Error("'scan_width' must be a positive value'");

        if (isNaN(scan_angle))
          throw new Error("Expected a number in 'scan_angle' but NaN was received");

        // Services declaration
        const CoordinateService = new GeoJson_Coordinate_Searcher_Service();
        const PointService = new GeoJson_Point_Sorter_Service();

        // Transformation
        scan_angle = scan_angle % 180;

        // Get the rotation pivot point
        const polygon_bbox = turf.bbox(polygon);
        const pivotLat = polygon_bbox[0];
        const pivotLng = polygon_bbox[1];
        const pivot_point = [pivotLat, pivotLng];

        // Rotate polygon so the sweeplines can be done vertically
        const rotation_angle = 90 - scan_angle;
        const rotated_polygon = turf.transformRotate(polygon, rotation_angle, {pivot: pivot_point });

        // Get the bounds of the rotated polygon
        const rotated_polygon_bbox = turf.bbox(rotated_polygon);
        const minLat = rotated_polygon_bbox[0];
        const minLng = rotated_polygon_bbox[1];
        const maxLat = rotated_polygon_bbox[2];
        const maxLng = rotated_polygon_bbox[3];

        // Search for the point that is further to the west and south and use it as starting point
        const ws_point = CoordinateService.searchWestSouthCoordinate(turf.getCoords(rotated_polygon).flat()).coordinate;
        let start_longitude = turf.getCoord(turf.rhumbDestination(turf.point(ws_point), scan_width/2, 0))[1];
        return start_longitude > maxLng;
  }

}
