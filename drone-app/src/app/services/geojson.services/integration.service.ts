import { GeoJson_Display_Service } from './geojson.display.service';
import { GeoJson_Polygon_Service } from './geojson.polygon.service';
import { GeoJson_Polygon_Sorter_Service } from './geojson.polygon.sorter.service';
import { GeoJson_Point_Sorter_Service } from './geojson.point.sorter.service';
import { GeoJson_Coordinate_Service } from './geojson.coordinate.service';
import { GeoJson_Coordinate_Searcher_Service } from './geojson.coordinate.searcher.service';
import { GeoJson_Merger_Service }  from './geojson.merger.service';
import { GeoJson_Sweep_Cost_Service } from './geojson.sweep.cost.service';
import { GeoJson_Sweep_Direction_Service } from './geojson.sweep.direction.service';
import { GeoJson_SweepPlane_Service } from './geojson.sweep.plane.service';


export class Integration_GeoJSON_Service {

  constructor( ) { }

  public displayFeature(map: any, feature: any, color?: string){
    return (new GeoJson_Display_Service()).displayFeature(map, feature, color);
  }

  public displayFeatureIDs(map: any, feature: any, color?: string){
    return (new GeoJson_Display_Service()).displayFeatureIDs(map, feature, color);
  }

  public transformToGeoJsonPolygon(overlay_coordinates: number[][][]){
    return (new GeoJson_Polygon_Service()).transformToGeoJsonPolygon(overlay_coordinates);
  }

  public sortPolygonCounterClockwise(polygon: any): any{
    return (new GeoJson_Polygon_Sorter_Service()).sortCounterClockwise(polygon);
  }

  public getAngles(polygon: any){
    return (new GeoJson_Polygon_Service()).getAngles(polygon);
  }

  public sortPointsFromSouthToNorth(points: any[], options?: any): any[]{
    return (new GeoJson_Point_Sorter_Service()).sortPointsFromSouthToNorth(points, options);
  }

  public roundCoordinate(coordinate : number[], roundingPrecision : number ){
    return (new GeoJson_Coordinate_Service()).roundCoordinate(coordinate, roundingPrecision);
  }

  public areCoordinatesEqual(coordinateA : number[], coordinateB : number[]){
    return (new GeoJson_Coordinate_Service()).areCoordinatesEqual(coordinateA, coordinateB);
  }

  public searchWestSouthCoordinate(polygon: any): number[]{
    return (new GeoJson_Coordinate_Searcher_Service()).searchWestSouthCoordinate(polygon);
  }

  public mergeOverlappingPolygons(polygons: any[]){
    return (new GeoJson_Merger_Service()).mergeOverlappingPolygons(polygons);
  }

  public removeOverlapingPolygons(base_polygons : any[], other_polygons : any[]){
    return (new GeoJson_Merger_Service()).removeOverlapingPolygons(base_polygons, other_polygons);
  }

  public computeCostFunctionOnPolygon(polygon: any, pass_angle: number, pass_width: number, options: any){
    return (new GeoJson_Sweep_Cost_Service()).computeCostFunctionOnPolygon(polygon, pass_angle, pass_width, options);
  }

  public computeCostFunctionOnEdge(edge: number[][], pass_angle: number, pass_width: number , options : any){
    return (new GeoJson_Sweep_Cost_Service()).computeCostFunctionOnEdge(edge, pass_angle, pass_width, options);
  }

  public computeTransitionCost(sharedEdge: number[][], passAngleA: number, passAngleB: number, passWidth: number) : number{
    return (new GeoJson_Sweep_Cost_Service()).computeTransitionCost(sharedEdge, passAngleA, passAngleB, passWidth);
  }

  public determineOptimalSweepDirectionFromAngleRange(polygon: any, start: number, end: number, increment: number, passWidth: number, options?: any ){
    return (new GeoJson_Sweep_Direction_Service()).determineOptimalSweepDirectionFromAngleRange(polygon, start, end, increment, passWidth, options);
  }

  public determineOptimalSweepDirection(polygon: any, passWidth: number, options?: any){
    return (new GeoJson_Sweep_Direction_Service()).determineOptimalSweepDirection(polygon, passWidth, options);
  }

  public sweepPlane(polygon: any, scan_width: number, scan_angle: number){
    return (new GeoJson_SweepPlane_Service()).sweepPlane(polygon, scan_width, scan_angle);
  }

  public canPolygonDoAtLeastASingleSweep(polygon: any, scan_width: number, scan_angle: number){
    return (new GeoJson_SweepPlane_Service()).canPolygonDoAtLeastASingleSweep(polygon, scan_width, scan_angle);
  }


}
