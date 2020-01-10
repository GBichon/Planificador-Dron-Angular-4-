import { DCEL_List } from './../../models/DCEL_List.model';

export class DCEL_Decomposer_Service {

  constructor( ) { }

  /**
   * Takes a DCEL_List and decompose it into many faces, depending on the
   * angle of decomposition
   * @param {DCEL_List} dcel  Any DCEL_List
   * @param {number} angle    Angle of the decomposition
   */
  decompose(dcel: DCEL_List, angle: number): DCEL_List{

    // Transformation
    angle = angle % 180;

    // Rotate the DCEL if necessary
    const rotationPivot = dcel.getCoordinates()[0];
    const rotationAngle =  90 - angle;
    dcel.transformRotate(rotationAngle, rotationPivot);
    // Trapezoidate
    dcel.trapezoidate(); 
    // Rotate the DCEL back
    dcel.transformRotate(- rotationAngle, rotationPivot);

    return dcel;
  }



}
