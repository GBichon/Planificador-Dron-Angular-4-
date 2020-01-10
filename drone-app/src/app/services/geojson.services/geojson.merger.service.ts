declare var turf: any;

export class GeoJson_Merger_Service {

  constructor(){}

  /**
   * Merge the GeoJSON polygons whose areas are overlapping each other
   * @param  polygons An array of GeoJSON Polygons
   * @return          An array of GeoJSON Polygons
   */
  public mergeOverlappingPolygons(polygons: any[]){

    // Valdations
    polygons.forEach( p => { if (turf.getType(p) !== "Polygon"){
      throw new Error("All of the elements in the parameter 'polygons' must be a GeoJSON Polygon type");
    }});

    // Merge the polygons
    let new_polygons = polygons.slice();
    for (let i = 0; i < new_polygons.length; i++){
      let polygonI = new_polygons[i];
      for (let j = 0; j < new_polygons.length; j++){
        if ( (i != j) && (!turf.booleanDisjoint(polygonI, new_polygons[j]) || turf.lineIntersect(polygonI,  new_polygons[j]).features.length > 0 )){
          polygonI = turf.union(polygonI, new_polygons[j]);
          new_polygons.splice(j, 1);
          j = -1;
        }
      }
      new_polygons[i] = polygonI;
    }

    return new_polygons;
  }

  /**
   * Remove the overlapping areas of the B-Polygons over the A-Polygons
   * @param  base_polygons   An array of GeoJSON Polygons
   * @param  other_polygons  An array of GeoJSON Polygons
   * @return                 An array of GeoJSON Polygons
   */
  public removeOverlapingPolygons(base_polygons : any[], other_polygons : any[]): any[] {

    // Validations
    base_polygons.forEach( p => { if (turf.getType(p) !== "Polygon"){
      throw new Error("All of the elements in the parameter 'base_polygons' must be a GeoJSON Polygon type");
    }});

    other_polygons.forEach( p => { if (turf.getType(p) !== "Polygon"){
      throw new Error("All of the elements in the parameter 'base_polygons' must be a GeoJSON Polygon type");
    }});


    // Especial case in which there is no need to do anything
    if (!other_polygons || other_polygons.length == 0)
      return base_polygons;

    // Remove overlapping areas
    let new_base_polygons = [];
    base_polygons.forEach( base_polygon => {

      // Remove the overlapping areas on base_polygon
      for (let i = 0; i < other_polygons.length && base_polygon != null; i++){
        base_polygon = turf.difference(base_polygon, other_polygons[i]);
      }

      // Check if more polygons were made out of the overlapping area removal
      if (turf.getType(base_polygon) === "Polygon"){
        new_base_polygons.push(base_polygon);
      } else if (turf.getType(base_polygon) === "MultiPolygon"){
        turf.getCoords(base_polygon).forEach( coords => { new_base_polygons.push(turf.polygon(coords)); });
      }

    });
    return new_base_polygons;
  }

}
