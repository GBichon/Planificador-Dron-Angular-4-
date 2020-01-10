declare var turf: any;

export class GeoJson_Coordinate_Searcher_Service {

  constructor(){}

  /**
   * Search for the coordinate that is further to the west and further to the
   * south from the given array of coordinates
   * @param  coordinates  An array of coordinates
   * @return  [ return = {} ]
   *          [ return.coordinate = number[]] Value of the found coordinate
   *          [ return.coordinate_index = number] Index of the coordinate in the array
   */
  public searchWestSouthCoordinate(coordinates: number[][]): any{

    // Validations
    coordinates.forEach( coordinate => {
      if (coordinate.length !== 2)
        throw new Error("Expected a coordinate in every element of 'coordinates'");
    });

    // Search for coordinate
    let west_south_coordinate = undefined;
    let west_south_coordinate_index = -1;
    coordinates.forEach( (coordinate, coordinate_index) => {

      let replace_current_coordinate = (west_south_coordinate === undefined) ||
                                      (coordinate[1] <  west_south_coordinate[1]) ||
                                      (coordinate[1] === west_south_coordinate[1] && coordinate[0] < west_south_coordinate[0]);

      if (replace_current_coordinate){
        west_south_coordinate = coordinate;
        west_south_coordinate_index = coordinate_index;
      }
    })

    return { coordinate: west_south_coordinate, coordinate_index: west_south_coordinate_index };
  }


}
