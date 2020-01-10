import { Injectable } from '@angular/core';
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class AGMPolygonUtilsService {

  constructor() { }

  // Returns an array of LatLng objects
  getPolygonVertexes(polygon){
    return polygon.getPaths().j[0].getArray();
  }

  // Return an array of [latitude, longitude], both being numbers
  getPolygonVertexesAsCoordinates(polygon){
    let latLngs = this.getPolygonVertexes(polygon);
    let coordinates = [];
    latLngs.forEach(v => coordinates.push([v.lat(), v.lng()]));
    return coordinates;
  }



  getPolygonSides(polygon){
    let vertices = this.getPolygonVertexes(polygon);
    let sides = [];
    for (let i = 0; i < vertices.length; i++){
      let pointA = vertices[i];
      let pointB = ( i + 1 == vertices.length ) ? vertices[0] : vertices[i+1];
      let side = [pointA, pointB];
      sides.push(side);
    }
    return sides;
  }

  generatePolygon(paths, color){
    let polygon = new google.maps.Polygon({
      paths: paths,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.5
    })
    return polygon;
  }


}
