import { Injectable } from '@angular/core';
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class TestingService {

  constructor( ) { }

 public getCase(map:any, case_number?: number){
   switch(case_number){
     case 0:
      return this.getCaseZero(map);
     default:
      return this.getCaseZero(map);
   }
 }

  /**
   * Return the case 0 of the test polygons
   * @param  map Google Map's object
   * @return     [description]
   */
  public getCaseZero(map:any){
    const center = map.getBounds().getCenter();
    const ne =  map.getBounds().getNorthEast();
    const sw =  map.getBounds().getSouthWest();
    const multiplier = 0.10;
    const latdiff = Math.abs(ne.lat() - sw.lat());
    const lngdiff = Math.abs(ne.lng() - sw.lng());
    let coverage_coordinates = [
      [ne.lat(),  center.lng()],
      [center.lat(), ne.lng()],
      [sw.lat(), (center.lng() + ne.lng()) / 2],
      [(center.lat() +  sw.lat()) / 2, sw.lng()],
      [center.lat(), sw.lng()],
      [center.lat(),(center.lng() + sw.lng()) / 2],
      [(center.lat() + ne.lat()) / 2, sw.lng()],
      [ne.lat(), center.lng()]
    ]
    let obstacles = []
    let obstacle_coordinates = [
      [center.lat() + latdiff * multiplier, center.lng()],
      [center.lat() - latdiff * multiplier, center.lng() + lngdiff * multiplier],
      [center.lat() - latdiff * multiplier, center.lng() - lngdiff * multiplier]
    ]
    obstacles.push(obstacle_coordinates);
  
    return {coverages: [coverage_coordinates], obstacles: obstacles };
  }


}
