import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonUtilsService {

  constructor() { }

  areCoordinatesEqual(coordA, coordB){
    return (coordA[0] == coordB[0] && coordA[1] == coordB[1]);
  }



  circularArraySlice(array, start, end){
    if ( start == end ){
      return [array[start]];
    } else if ( start < end ){
      return array.slice(start, end + 1);
    } else if ( end < start) {
      return array.slice(start, array.length).concat(array.slice(0, end + 1));
    }
  }

  spliceSpecificArrayIndexAlongWithTheFollowingOne( array, index : number){
    if ( index < array.length - 1 ){
      array.splice(index, 2)
    } else {
      array.splice(index, 1);
      array.splice(0, 1);
    }
    return array;
  }


  getRandomColor(){
      return '#'+Math.floor(Math.random()*16777215).toString(16);
  }


  getRange(start : number, end : number){
    let range = [];
    for (let i = start; i <= end; i++){
      range.push(i);
    }
    return range;
  }
}
