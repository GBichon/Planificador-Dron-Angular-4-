import { Injectable } from '@angular/core';
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class AgmUtilsService {

  constructor() { }

  transformPolygonToPointsArray(polygon, map){
    let polygonLatLngs = polygon.getPath().getArray();
    let polygonPoints = []
    for (let i = 0; i < polygonLatLngs.length; i++ ){
      let points = map.getProjection().fromLatLngToPoint(polygonLatLngs[i]);
      polygonPoints.push({ x: points.x, y:points.y});
    }
    return polygonPoints;
  }

  tranformPointArrayToLatLngs(points, map){
    let polygonLatLngs = [];
    for (let i = 0; i < points.length; i++){
      polygonLatLngs.push(map.getProjection().fromPointToLatLng(points[i]));
    }
    return polygonLatLngs;
  }

  generatePolygonsFromLatLngsArray(latLngsArray){
    let polygons = [];
    for (let i = 0; i < latLngsArray.length; i++){
      let randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      let latLngs = latLngsArray[i];
      polygons.push(this.generatePolygonFromLatLngs(latLngs, randomColor));
    }
    return polygons;
  }

  generatePolygonFromLatLngs(latLngs, color){
    let polygon = new google.maps.Polygon({
      paths: latLngs,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35
    })
    return polygon;
  }

  generateDotMarker(map, position, color, label){
    let marker = new google.maps.Marker({
      position: position,
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
    return marker;
  }

  showPolygonsInMap(map, polygons, color){
    for (let i = 0; i < polygons.length; i++){
      this.showPolygonInMap(map, polygons[i], color);
    }
    return polygons;
  }

  showPolygonInMap(map, polygon, color){
    polygon.setOptions({
      strokeColor: color,
      fillColor: color
    });
    polygon.setMap(map);
    return polygon;
  }

  showMarkerInMap(marker, map){
    marker.setMap(map);
    return map;
  }

  hidePolygonsInMap(polygons, map){
    for (let i = 0; i < polygons.length; i++){
      this.hidePolygonsInMap(polygons[i],map);
    }
    return polygons;
  }

  hidePolygonInMap(polygon, map){
    polygon.setMap(null);
    return polygon;
  }

  hideMarkerInMap(marker, map){
    marker.setMap(null);
    return marker;
  }



}
