import { Integration_GeoJSON_Service } from './../geojson.services/integration.service';
import { DCEL_List } from './../../models/DCEL_List.model';
import { DCEL_Face } from './../../models/DCEL_Face.model';
import { DCEL_Halfedge } from './../../models/DCEL_Halfedge.model';
import { DCEL_Region } from './../../models/DCEL_Region.model';



declare var turf: any;


export class DCEL_Adjacent_Waypoints_Service {

  public getWaypointsFromRegions(start_coordinate: number[], end_coordinate: number[], regions: DCEL_Region[], obstacles: any){



    /** comment
    // Obtain all of the coordinates
    let coordinate_collection = {};
    coordinate_collection[start_coordinate.toString()] = start_coordinate;
    coordinate_collection[end_coordinate.toString()] = end_coordinate;
    regions.forEach( r => {r.getFaces().forEach(f => { f.getCoordinates().forEach( c => { coordinate_collection[c.toString()] = c; }) }) })
    obstacles.forEach( o => { turf.getCoords(o).forEach( overlay => { overlay.forEach( c => { coordinate_collection[c.toString()] = c; }) }) })
    let coordinate_list = Object.values(coordinate_collection);

    // Create Multigraph from the coordinates
    let graph = new GeoJSON_Directed_Multigraph(coordinate_list, obstacles);
    **/
    const GeoJSONServices = new Integration_GeoJSON_Service();

    // Initialize
    let waypoints = [start_coordinate];

    let non_visited_regions = regions.slice();

    let region_lines = [];

    // Get the nearest region from start_coordinate
    let nearest = this.searchNearestRegion(start_coordinate, non_visited_regions);

    // A Loop to visit every region
    let current_region = nearest.region
    let current_coordinate = nearest.vertice.getCoordinate();
    while (non_visited_regions.length !== 0){

      // Remove current region from the non visited list
      non_visited_regions.splice(non_visited_regions.indexOf(current_region), 1);

      // Generate all of the sweep lines of the region
      let sweeplines = [];
      current_region.getFaces().forEach( face => {
        let direction = current_region.getDirectionInRegion(face);
        let pass_width = current_region.getPassWidth();
        let polygon = face.getPolygon();
        let multilines = GeoJSONServices.sweepPlane(polygon, pass_width, direction)
        let lines = turf.getCoords(multilines).map( l => { return turf.lineString(l) });
        sweeplines = sweeplines.concat(lines);
      });

      // A loop to visit every sweepline created
      while(sweeplines.length !== 0){

        // Find the nearest sweepline to the last added waypoint
        let nearest = this.searchNearestLine(current_coordinate, sweeplines);

        // Remove the nearest sweepline from the list
        sweeplines.splice(sweeplines.indexOf(nearest.line), 1);

        // Create variables
        let point_A = waypoints[waypoints.length - 1];
        let point_B = nearest.first_coordinate;
        let point_C = nearest.second_coordinate;

        // Connect the last added waypoint to the first vertice of the line
        if (this.compareCoordinates(point_A, point_B)){
          waypoints.push(point_C);
          current_coordinate = point_C;
        } else{
          // Check if between A and B there is an obstacle
          if (this.pathCollidesWithObstacle(point_A, point_B, obstacles)){
            // Find a way around the obstacle
            let coordinates = turf.getCoords(turf.shortestPath(point_A, point_B, { obstacles: turf.featureCollection(obstacles)}));
            for (let i = 1; i < coordinates.length; i++){
              waypoints.push(coordinates[i]);
            }
          } else{
            waypoints.push(point_B);
          }
          waypoints.push(point_C);
          current_coordinate = point_C;
        }

      }

      current_region = this.searchNearestRegion(current_coordinate, non_visited_regions).region;
    }

    // Trace a line from the last coordinate to the end coordinate
    if (!this.compareCoordinates(current_coordinate, end_coordinate)){
      let point_A = current_coordinate;
      let point_B = end_coordinate;
      // Check if between point A and B there is an obstacle
      if (this.pathCollidesWithObstacle(point_A, point_B, obstacles)){
        // Find a way around the obstacle
        let coordinates = turf.getCoords(turf.shortestPath(point_A, point_B, { obstacles: turf.featureCollection(obstacles)}));
        for (let i = 1; i < coordinates.length; i++){
          waypoints.push(coordinates[i]);
        }
      } else{
        console.log("Wwewewe?!");

        waypoints.push(point_B);
      }
    }

    return waypoints;

  }

  private compareCoordinates(coordA: number[], coordB: number[]): boolean{
    let aLat = turf.round(coordA[0], 6);
    let aLng = turf.round(coordA[1], 6);
    let bLat = turf.round(coordB[0], 6);
    let bLng = turf.round(coordB[1], 6);
    return (aLat === bLat) && (aLng === bLng);
  }

  private pathCollidesWithObstacle(start: number[], end: number[], obstacles: any[]){
    let line = turf.lineString([start, end]);
    for (let i = 0; i < obstacles.length; i++ ){
      if (turf.lineIntersect(line, obstacles[i]).features.length >= 1){
        return true;
      }
    }
    return false;
  }

  private searchNearestRegion(origin: number[], regions: DCEL_Region[]){
    const origin_point = turf.point(origin);
    let nearest_regions = [];
    let nearest_vertice = undefined;
    let distance_to_nearest = Number.POSITIVE_INFINITY;
    // Get the nearest regions
    regions.forEach( region => {
      region.getRegionBoundVertices().forEach( vertice => {
        if (nearest_vertice === vertice){
          nearest_vertice = vertice;
          nearest_regions.push(region);
        } else{
          let distance = turf.distance(origin_point, turf.point(vertice.getCoordinate()));
          if (distance < distance_to_nearest){
            distance_to_nearest = distance;
            nearest_vertice = vertice;
            nearest_regions = [region];
          }
        }
      })
    });
    // Use the region whose found face has less neighbours
    let selected_region = undefined;
    let min_neighbours = Number.POSITIVE_INFINITY;
    nearest_regions.forEach( region => {
      region.getFaces().filter(face =>
        { return face.hasVertice(nearest_vertice)
      }).forEach( face => {
        let count_neighbours = region.getNeighboursOf(face).length;
        if (count_neighbours < min_neighbours){
          selected_region = region;
          min_neighbours = count_neighbours;
        }
      })
    })

    return { region: selected_region, vertice: nearest_vertice };
  }

  private searchNearestLine(coordinate: number[], lines: any[]){
    let min_distance = Number.POSITIVE_INFINITY;
    let first_coordinate = undefined;
    let second_coordinate = undefined;
    let min_line = undefined;
    lines.forEach( line => {
      let A = turf.getCoords(line)[0];
      let B = turf.getCoords(line)[1];
      let A_distance = turf.rhumbDistance(turf.point(coordinate), turf.point(A));
      let B_distance = turf.rhumbDistance(turf.point(coordinate), turf.point(B));
      if (A_distance < min_distance){
        min_distance = A_distance;
        first_coordinate = A;
        second_coordinate = B;
        min_line = line;
      }
      if (B_distance < min_distance){
        min_distance = B_distance;
        first_coordinate = B;
        second_coordinate = A;
        min_line = line;
      }
    });
    return { line: min_line, first_coordinate: first_coordinate, second_coordinate: second_coordinate };
  }

}
