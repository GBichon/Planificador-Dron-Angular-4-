import { DCEL_Polygon_Service } from './dcel.polygon.service';
import { DCEL_Decomposer_Service } from './dcel.decomposer.service';
import { DCEL_Adjacent_Regions_Service } from './dcel.adjacent-regions.service';
import { DCEL_Adjacent_Waypoints_Service } from './dcel.adjacent-waypoints.service';
import { DCEL_List } from './../../models/DCEL_List.model';
import { DCEL_Region } from './../../models/DCEL_Region.model';

export class Integration_DCEL_Service {

  constructor() { }

  public transformPolygonToDCEL(polygon: any){
    return (new DCEL_Polygon_Service()).transformPolygonToDCEL(polygon);
  }

  public decompose(dcel: any, angle: number){
    return (new DCEL_Decomposer_Service()).decompose(dcel, angle);
  }

  public obtainAdjacentRegions(dcel: DCEL_List, passWidth: number){
    return (new DCEL_Adjacent_Regions_Service()).obtainAdjacentRegions(dcel, passWidth);
  }

  public  getWaypointsFromRegions(start_coordinate: number[], end_coordinate: number[], regions: DCEL_Region[], obstacles: any){
    return (new DCEL_Adjacent_Waypoints_Service()).getWaypointsFromRegions(start_coordinate, end_coordinate, regions, obstacles);
  }

}
