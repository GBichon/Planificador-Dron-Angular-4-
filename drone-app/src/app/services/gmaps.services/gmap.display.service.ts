declare var google: any;

export class GMAP_Display_Services {

  constructor(){}

  /**
   * Display on the map a polygon that can be created from the given coordinates
   * @param  map                 [description]
   * @param  polygon_coordinates [description]
   * @param  color               [description]
   * @return                     [description]
   */
  public displayPolygon(map: any, polygon_coordinates: number[][][], color?: string){

    // Transformation
    if (color == void 0) { color = "#FF0000"; }

    // Polygon creation
    const polygon = new google.maps.Polygon({
      paths: polygon_coordinates.map( overlay_coordinates => { return overlay_coordinates.map( coordinate => { return {lat: coordinate[0], lng: coordinate[1]}; })}),
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 1
    });

    // Display on map
    polygon.setMap(map);

    return polygon;
  }

  /**
   * Display on the map the polyline that can be created from the given paths
   * coordinates
   * @param  map                A googlemap's map object
   * @param  path_coordinates   An array of coordinates
   * @param  color              Color in hexadecimal
   * @return                    A googlemap's Polyline object
   */
  public displayPolyLine(map: any, path_coordinates: number[][], color?: string){

    // Transformation
    if (color == void 0) { color = "#FF0000"; }

    // Polyline creation
    const polyline = new google.maps.Polyline({
      path: path_coordinates.map( c => { return {lat: c[0], lng: c[1] }}),
      strokeColor: color
    })

    // Display on the map
    polyline.setMap(map);

    return polyline;
  }

  /**
   * Display on the map a dot on the given coordinate
   * @param  map                 A googlemap's map object
   * @param  position_coordinate The coordinate position of the dot
   * @param  label               A label that will be over the dot
   * @param  color               The color of the dot (default: red)
   * @return                     A googlemap's Marker object
   */
  public displayDotMarker(map: any, position_coordinate: number[], label: string, color?: string){

    // Transformation
    if (color == void 0) { color = "#FF0000"; }

    // Dot creation
    const dotmarker = new google.maps.Marker({
      position: {lat: position_coordinate[0], lng: position_coordinate[1]},
      label: label,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: color,
        strokeOpacity: 1,
        strokeWeight: 1,
        scale: 10,
      }
    });

    // Display on the map
    dotmarker.setMap(map);

    return dotmarker;
  }

}
