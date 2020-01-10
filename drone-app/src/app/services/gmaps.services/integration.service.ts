import { GMAP_Coordinates_Service } from './gmap.coordinates.service';
import { GMAP_Display_Services } from './gmap.display.service'

export class Integration_GMAP_Service {

  constructor( ) { }

  public getCoords(polygon: any): any[]{
    return (new GMAP_Coordinates_Service()).getCoords(polygon);
  }

  public displayPolygon(map, polygon_coordinates, color){
    return (new GMAP_Display_Services()). displayPolygon(map, polygon_coordinates, color);
  }

  public displayPolyLine(map: any, path_coordinates: number[][], color?: string){
    return (new GMAP_Display_Services()).displayPolyLine(map, path_coordinates, color);
  }

  public displayDotMarker(map: any, position_coordinate: number[], label: string, color?: string){
    return (new GMAP_Display_Services()).displayDotMarker(map, position_coordinate, label, color);
  }



}
