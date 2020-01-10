import { Integration_GeoJSON_Service } from './../geojson.services/integration.service';
import { DCEL_List } from './../../models/DCEL_List.model';
declare var turf: any;

export class DCEL_Polygon_Service {

  constructor(){}

  /**
   * Create a DCEL_List object from a given GeoJSON Polygon.
   * @param  polygon Any GeoJSON Polygon
   * @return         A GeoJSON Polygon
   */
  public transformPolygonToDCEL(polygon: any){

    // Services
    const GeoJSONServices = new Integration_GeoJSON_Service();

    // Validations
    if (turf.getType(polygon) !== "Polygon")
      throw new Error("The parameter 'polygon' was expected to be a GeoJson Polygon");

    // Sort polygon counterclockwise
    const sorted_polygon = GeoJSONServices.sortPolygonCounterClockwise(polygon);

    // Create and return the DCEL_List
    return new DCEL_List(sorted_polygon);
  }


}
