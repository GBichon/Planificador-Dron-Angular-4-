import { DCEL_Vertice } from './DCEL_Vertice.model';
import { DCEL_Halfedge } from './DCEL_Halfedge.model';
import { DCEL_Face } from './DCEL_Face.model';
import { Integration_GeoJSON_Service } from './../services/geojson.services/integration.service';
declare var turf: any;

export class DCEL_Face_In_Region_Information{

  private _face: DCEL_Face;
  private _individual_optimal_direction: number;
  private _individual_optimal_cost: number;
  private _region_optimal_direction: number;


  constructor(face: DCEL_Face, pass_width: number){

    const start = 0;
    const end = 180;
    const increment = 10;

    // Validations
    if (!face)
      throw new Error("'face' is required");

    if (isNaN(pass_width) || pass_width <= 0)
      throw new Error("'pass_width' must be a number");


    // Calculate the individual optimal direction and cost for the face
    const GeoJSON_Services = new Integration_GeoJSON_Service();
    let coverage = GeoJSON_Services.determineOptimalSweepDirectionFromAngleRange(face.getPolygon(), start, end, increment, pass_width, {'useEdges': true});
    this._face = face
    this._individual_optimal_direction = coverage.optimalAngle;
    this._individual_optimal_cost = coverage.optimalCost;
    this._region_optimal_direction = this._individual_optimal_direction;
  }

  public getIndividualDirection(){
    return this._individual_optimal_direction;
  }

  public getIndividualCost(){
    return this._individual_optimal_cost;
  }

  public getDirectionInRegion(){
    return this._region_optimal_direction;
  }

  public hasFace(face: DCEL_Face){
    return this._face === face;
  }

  public setDirectionInRegion(direction: number){
    if (isNaN(direction))
      throw new Error("A direction was expected");

    direction = direction % 180;
    this._region_optimal_direction = direction;
  }

}
