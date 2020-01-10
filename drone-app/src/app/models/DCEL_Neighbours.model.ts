import { DCEL_Vertice } from './DCEL_Vertice.model';
import { DCEL_Halfedge } from './DCEL_Halfedge.model';
import { DCEL_Face } from './DCEL_Face.model';
import { DCEL_Face_In_Region_Information } from './DCEL_Face_In_Region_Information.model';
declare var turf: any;

export class DCEL_Neighbours{

  private _first_face: DCEL_Face;
  private _second_face: DCEL_Face;
  private _shared_edge: DCEL_Halfedge;
  private _cost_saving: number;

  constructor(fface: DCEL_Face, sface: DCEL_Face, sharedEdge: DCEL_Halfedge, savings: number){

    // Validations
    if (!fface)
      throw new Error("'fface' is required");

    if (!sface)
      throw new Error("'sface' is required");

    if (!sharedEdge)
      throw new Error("'sharedEdge' is required");

    if (fface === sface)
      throw new Error("'fface' can't be equal to 'sface'");

    if (savings < 0)
      throw new Error("cost savings must be a positive value");

    if ( !((sharedEdge.getFace() === fface && sharedEdge.getOppositeFace() === sface) || (sharedEdge.getFace() === sface && sharedEdge.getOppositeFace() === fface)))
      throw new Error("'sharedEdge' is not related  to both faces");

    // Assignation
    this._first_face = fface;
    this._second_face = sface;
    this._shared_edge = sharedEdge
    this._cost_saving = savings;
  }

  public getFaces(){
    return [this._first_face, this._second_face];
  }

  public getNeighbourOf(other: DCEL_Face): DCEL_Face{
    if (this._first_face === other){
      return this._second_face;
    } else if (this._second_face === other){
      return this._first_face;
    } else{
      throw new Error("'other' face is not part of the this Neighbour object, therefore is no neighbour of anyone here");
    }
  }

  public hasFace(other: DCEL_Face): boolean{
    return this._first_face === other || this._second_face === other;
  }

  public hasFaces(other: DCEL_Face, another: DCEL_Face): boolean{
    return this.hasFace(other) && this.hasFace(another);
  }

  public getSharedEdge(): DCEL_Halfedge{
    return this._shared_edge;
  }

  public getCostSaving(): number{
    return this._cost_saving;
  }

  public clearObject(){
    this._first_face = undefined;
    this._second_face = undefined;
    this._shared_edge = undefined;
    this._cost_saving = NaN;
  }

}
