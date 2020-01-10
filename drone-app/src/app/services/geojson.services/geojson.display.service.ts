import {Integration_GMAP_Service} from './../gmaps.services/integration.service';
declare var turf: any;

export class GeoJson_Display_Service {

  constructor(){}

  /**
   * Display any GeoJSON Feature on the map
   * @param  feature  Any GeoJSON Feature
   * @param  map      A Googlemaps's map
   * @param  color    An hexadecimal color (default: red)
   * @return          Feature created in Google map's format
   */
  public displayFeature(map: any, feature: any, color?: string){

    if (turf.getType(feature) == "MultiPolygon")
      return this.displayMultiPolygon(map, feature, color);

    else if (turf.getType(feature) == "Polygon")
      return this.displayPolygon(map, feature, color);

    else if (turf.getType(feature) == "MultiLineString")
      return this.displayMultiLineString(map, feature, color);

    else if (turf.getType(feature) == "LineString")
      return this.displayLineString(map, feature, color);

  }

  /**
   * Display a number that identify each given GeoJSON multifeature
   * @param  map      A Googlemap's map
   * @param  feature  A GeoJSON multifeature
   * @param  color    An hexadecimal color (default: red)
   * @return          An arry of Googlemap's markers
   */
  public displayFeatureIDs(map: any, feature: any, color?: string){

    if (turf.getType(feature) == "MultiPoint")
      this.displayMultiPointIDs(map, feature, color)

   else if (turf.getType(feature) == "MultiLineString")
      this.displayMultiLineStringIDs(map, feature, color);

  }

  /**
   * Display a polygon on the map
   * @param  map     A Googlemap's map object
   * @param  polygon A GeoJSON polygon
   * @param  color   An hexadecimal color (default: red)
   * @return         A Googlemap's polygon
   */
  private displayPolygon(map: any, polygon: any, color?: string){
    return (new Integration_GMAP_Service()).displayPolygon(map, turf.getCoords(polygon), color);
  }

  /**
   * Display a linestring on the map
   * @param  map        A Googlemap's map object
   * @param  linestring A GeoJSON linestring
   * @param  color      An hexadecimal color (default: red)
   * @return            A Googlemap's polyline
   */
  private displayLineString(map: any, linestring: any, color?: string){
    return (new Integration_GMAP_Service()).displayPolyLine(map, turf.getCoords(linestring), color);
  }

  /**
   * Display a multipolygon on the map
   * @param  map          A Googlemap's map object
   * @param  multiPolygon A GeoJSON multipolygon
   * @param  color        An hexadecimal color (default: red)
   * @return              An array of Googlemap's polygons
   */
  private displayMultiPolygon(map: any, multiPolygon: any, color?: string){
    return turf.getCoords(multiPolygon).map( p => {
      return this.displayPolygon(map, turf.polygon(p), color);
    });
  }

  /**
   * Display a multilinestring on the map
   * @param  map             A Googlemap's map object
   * @param  multiLineString A GeoJSON multilinestring
   * @param  color           An hexadecimal color (default: red)
   * @return                 An array of Googlemap's polylines
   */
  private displayMultiLineString(map, multiLineString, color){
    return multiLineString.geometry.coordinates.map( line_coordinates => {
      return (new Integration_GMAP_Service()).displayPolyLine(map, line_coordinates, color);
    });
  }

  /**
   * Display numbers that identify each point in the GeoJSON multipoint
   * @param  multiPoint A GeoJSON Multipoint
   * @param  map        A Googlemap's map
   * @param  color      An hexadecimal color (default: red)
   * @return            An array of Googlemap's markers
   */
  private displayMultiPointIDs(map, multiPoint, color){
    return turf.getCoords(multiPoint).map( (coordinate, index) => {
      return (new Integration_GMAP_Service()).displayDotMarker(map, coordinate, index.toString(), color);
    });
  }

  /**
   * Display numbers that identify each linestring in the GeoJSON multilinestring
   * @param  multiLineString  A GeoJSON Multilinestring
   * @param  map        A Googlemap's map
   * @param  color      An hexadecimal color (default: red)
   * @return            An array of Googlemap's markers
   */
  private displayMultiLineStringIDs(map, multiLineString, color){
    return multiLineString.geometry.coordinates.map( (line_coordinates, index) => {
      let A = turf.point(line_coordinates[0]);
      let B = turf.point(line_coordinates[1]);
      return (new Integration_GMAP_Service()).displayDotMarker(map, turf.getCoord(turf.midpoint(A,B)), index.toString(), color);
    });
  }
}
