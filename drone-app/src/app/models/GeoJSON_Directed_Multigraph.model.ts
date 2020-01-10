declare var turf: any;

export class  GeoJSON_Directed_Multigraph{

  _coordinates_collection: any;
  _distance_collection : any;
  _obstacles_array: any;

  constructor(coordinates: any, obstacles: any){

    // Add the obstacles coordinates also as graph coordinates
    obstacles.forEach( obstacle => {
      turf.getCoords(obstacle).forEach( overlay => {
        overlay.forEach( coordinate => {
          if (coordinates.indexOf(coordinate) === -1){
            coordinates.push(coordinate);
          }
        })
      })
    })
    this._coordinates_collection = coordinates;
    this._obstacles_array = obstacles;
    this._distance_collection = {};
    this.initializeDistanceCollection();

  }

  private initializeDistanceCollection(){
    for (let idx = 0; idx < this._coordinates_collection.length; idx++){
      for (let jdx = idx + 1; jdx < this._coordinates_collection.length; jdx++){
        let line = turf.lineString([this._coordinates_collection[idx], this._coordinates_collection[jdx]]);
        let valid = true;
        for (let zdx = 0; valid && zdx < this._obstacles_array.length; zdx++){
          let intersects = turf.lineIntersect(line, this._obstacles_array[zdx]);
          for (let wdx = 0; valid && wdx < intersects.features.length; wdx++){
            let current_intersect = turf.getCoord(intersects.features[wdx]);
            valid = (current_intersect[wdx][0] == this._coordinates_collection);
          }
          valid = turf.lineIntersect(line, this._obstacles_array[zdx]).features.length === 0;
        }
        if (valid){
          let distance = turf.rhumbDistance(turf.point(this._coordinates_collection[idx]), turf.point(this._coordinates_collection[jdx]));
          let idx_key = this._coordinates_collection[idx].toString();
          let jdx_key = this._coordinates_collection[jdx].toString();
          if (!this._distance_collection.hasOwnProperty(idx_key)){ this._distance_collection[idx_key] = {}; }
          if (!this._distance_collection.hasOwnProperty(jdx_key)){ this._distance_collection[jdx_key] = {}; }
          this._distance_collection[idx_key][jdx_key] = distance;
          this._distance_collection[jdx_key][idx_key] = distance;
        }
      }
    }
  }

  public getDistanceBetween(coordA: number[], coordB: number[]): number{
    let a_key = coordA.toString();
    let b_key = coordB.toString();
    if (this._distance_collection.hasOwnProperty(a_key)){
      if (this._distance_collection[a_key].hasOwnProperty(b_key)){
        return this._distance_collection[a_key][b_key];
      }
    }
    return Number.POSITIVE_INFINITY;
  }

  public getDistancesOf(coord: number[]){
    let key = coord.toString();
    if (this._distance_collection.hasOwnProperty(key)){
      return this._distance_collection[key];
    }
    return undefined;
  }

  public addPoint(coord: number[]){
    let key = coord.toString();
    if (!this._distance_collection.hasOwnProperty(key)){
      this._distance_collection[key] = {}
      this._coordinates_collection.forEach( other_coord => {
        let line = turf.lineString([coord, other_coord]);
        let valid = true;
        for (let zdx = 0; valid && zdx < this._obstacles_array.length; zdx++){
          valid = turf.lineIntersect(line, this._obstacles_array[zdx]).features.length === 0;
        }
        if (valid){
          let distance = turf.rhumbDistance(turf.point(coord), turf.point(other_coord));
          let other_key = other_coord.toString();
          this._distance_collection[key][other_key] = distance;
          this._distance_collection[other_key][key] = distance;
        }
      })
    }
  }

  public deletePoint(coord: number[]){
    let key = coord.toString();
    let other_keys = [];
    if (this._distance_collection.hasOwnProperty(key)){
      Object.keys(this._distance_collection[key]).forEach( other_key => {
        delete this._distance_collection[other_key][key];
      })
      delete this._distance_collection[key];
    }

  }

  public findShortestRoute(start: number[], end: number[]){
    // Add the start and end points
    this.addPoint(start);
    this.addPoint(end);
    // Djikstra initialization
    let dist = {}     // dist[coordinate] will hold the distance from src to coordinate
    let sptSet = {}   // sptset[coordinate] will be true if coordinate is included in the shortes path
    let prev = {}     // dist[coordinate] will hold prev(coordinate);

    // Initialize all distance as INFINITE an sptset as false
    this._coordinates_collection.forEach( coordinate => {
      let key = coordinate.toString();
      dist[key] = Number.POSITIVE_INFINITY;
      sptSet[key] = false;
      prev[key] = undefined;
    });
      // Distance of sourte to itself is always 0
    dist[start.toString()] = 0;

    // Find the shortest path for all vertices
    for (let count = 0; count < this._coordinates_collection.length; count++){
      // Pick the minimum distance vertex from the set of vertices not yet processed
      // min_key is always equal to start in the first iteration
      let min_coordinate = undefined;
      let min_distance = Number.POSITIVE_INFINITY;
      for (let v = 0; v < this._coordinates_collection.length; v++){
        let key = this._coordinates_collection[v].toString();
        if (sptSet[key] == false && dist[key] <= min_distance){
          min_distance = dist[key];
          min_coordinate = v;
        }
      }

      if (min_coordinate !== undefined) {

        console.log("I'm in");

        let min_key = min_coordinate.toString();

        // Mark the picked vertice as proccessed
        sptSet[min_key] = true;

        // Update the dist value of the adjacent vertices of the picked vertice
        let ukey = min_key;
        for (let v = 0; v < this._coordinates_collection.length; v++){
          let vkey = this._coordinates_collection[v].toString();
          console.log("aptset", !sptSet[vkey]);
          console.log("hasukey", this._distance_collection.hasOwnProperty(ukey));
          if ( !sptSet[vkey] &&
                this._distance_collection.hasOwnProperty(ukey) &&
                this._distance_collection[ukey].hasOwnProperty(vkey) &&
                dist[ukey] !== Number.POSITIVE_INFINITY &&
                (dist[ukey] + this._distance_collection[ukey][vkey] < dist[vkey])){
            dist[vkey] = dist[ukey] + this._distance_collection[ukey][vkey];
            console.log("min coordinate is: ", min_coordinate);
            prev[vkey] = min_coordinate;
          }
        }
      }
    }

    // Delete the start and end points
    this.deletePoint(start);
    this.deletePoint(end);

    console.log("prev", prev);
    let current = end;
    let path = [];
    while( !(current[0] === start[0] && current[1] === start[1]) ){
      path.push(current);
      current = prev[current.toString()];
    }

    return path;
  }


}
