declare var turf: any;

export class GeoJson_Sweep_Cost_Service {

  constructor(){}

  /**
   * Compute the coverage cost of a GeoJSON polygon
   * @param  polygon    Any GeoJSON polygon
   * @param  pass_angle  Angle of the pass
   * @param  pass_width  Width of the pass
   * @param  options    [options = {}]
   *                    [options.cost1] = cost of the first part of the cost function
   *                    [options.cost2] = cost of the second part of the cost function
   *                    [options.cost3] = cost of the third part of the cost function
   * @return            Coverage cost
   */
  public computeCostFunctionOnPolygon(polygon: any, pass_angle: number, pass_width: number, options: any): number{

    // Validations
    if (turf.getType(polygon) !== "Polygon")
      throw new Error("A GeoJSON Polygon object is required")

    // Compute coverage cost
    let totalCost = 0;
    turf.getCoords(polygon).forEach(overlayCoordinates => {
      overlayCoordinates.slice(0, -1).forEach((c, i) => {
        let start = overlayCoordinates[i];
        let end = overlayCoordinates[(i === overlayCoordinates.length - 2)? (0) : (i+1)]
        totalCost += this.computeCostFunctionOnEdge([start, end], pass_angle, pass_width, options);
      })
    })
    return totalCost;
  }

  /**
   * Compute the coverage cost of an edge
   * @param  polygonEdge  An array that contains the two vertice coordinates of an edge
   * @param  pass_angle    Angle of the pass
   * @param  pass_width   Width of the pass
   * @param  options      [options = {}]
   *                      [options.cost1] = cost of the first part of the cost function
   *                      [options.cost2] = cost of the second part of the cost function
   *                      [options.cost3] = cost of the third part of the cost function
   * @return              Coverage cost
   */
  public computeCostFunctionOnEdge(edge: number[][], pass_angle: number, pass_width: number , options : any): number{

    // Optional parameters, default values handling
    if (options == void 0) { options = {}; }
    if (!options.hasOwnProperty("cost1")) { options.cost1 = 1; }
    if (!options.hasOwnProperty("cost2")) { options.cost2 = 1; }
    if (!options.hasOwnProperty("cost3")) { options.cost3 = 1; }

    // Validations
    if (edge.length !== 2)
      throw new Error("Parameter 'edge' must have be composed of two coordinates");

    if (edge[0].length !== 2 || edge[1].length !== 2)
      throw new Error("Parameter 'edge' must have be composed of two coordinates");

    if (typeof options.cost1 != "number")
      throw new Error("Optional parameter 'cost1' must be a number");

    if (typeof options.cost2 != "number")
      throw new Error("Optional parameter 'cost2' must be a number");

    if (typeof options.cost3 != "number")
      throw new Error("Optional parameter 'cost3' must be a number");

    if (options.cost1 <= 0)
      throw new Error("Optional parameter 'cost1' must be a positive value");

    if (options.cost2 <= 0)
      throw new Error("Optional parameter 'cost2' must be a positive value");

    if (options.cost3 <= 0)
      throw new Error("Optional parameter 'cost3' must be a positive value");

    if (pass_width <= 0)
      throw new Error("The parameter 'passwidth' must be a positive value") ;

    // Get some variables
    let A = turf.point(edge[0]);
    let B = turf.point(edge[1]);
    let W = pass_width;
    let Li = turf.rhumbDistance(A, B);
    let Bi = (turf.bearingToAzimuth(turf.rhumbBearing(A, B)) % 180) * Math.PI / 180;
    let Theta = pass_angle * Math.PI / 180;
    let Ni = Li * Math.sin(Math.abs(Theta - Bi)) / (2 * W);

    // Especial condition: no turns were made
    if (Ni === 0) return 0;

    // Calculate the distane cost
    let distancePart1 = Li * Math.abs(Math.cos(Math.abs(Theta - Bi))) / 2;
    let distancePart2 = Li * Math.abs(Math.cos(Math.abs(Theta - Bi))) / 2;
    let distancePart3 = Math.PI * Li * Math.sin(Math.abs(Theta - Bi)) / 4;

    // Compute and return the cost
    return distancePart1 * ((options.cost1) ? options.cost1 : 1 ) +
           distancePart2 * ((options.cost2) ? options.cost2 : 1 ) +
           distancePart3 * ((options.cost3) ? options.cost3 : 1 );
  }


  /**
   * Compute the transition cost of two pass angles against a shared edge
   * @param  sharedEdge An array that contains the two vertice coordinates of an edge
   * @param  passAngleA Angle of a pass
   * @param  passAngleB Angle of a pass
   * @param  passWidth  Width of the pass
   * @return            Returns the transition cost
   */
  public computeTransitionCost(sharedEdge: number[][], passAngleA: number, passAngleB: number, passWidth: number) : number{

    // Validations
    if (sharedEdge.length !== 2)
      throw new Error("Parameter 'sharedEdge' must have be composed of two coordinates");

    if (sharedEdge[0].length !== 2 || sharedEdge[1].length !== 2)
      throw new Error("Parameter 'sharedEdge' must have be composed of two coordinates");

    if (passAngleA < 0 || passAngleA >= 180)
      throw new Error("'passAngleA' must be a value between 0 and 180, not including the last one");

    if (passAngleB < 0 || passAngleB >= 180)
      throw new Error("'passAngleB' must be a value between 0 and 180, not including the last one");

    if (passWidth <= 0)
      throw new Error("The parameter 'passwidth' must be a positive value");

    // Compute transition cost
    const A = turf.point(sharedEdge[0]);
    const B = turf.point(sharedEdge[1]);
    const W = passWidth;
    const R = W/2;
    const Li = turf.rhumbDistance(A, B);
    const Bi = (turf.bearingToAzimuth(turf.rhumbBearing(A, B)) % 180) * Math.PI / 180;
    const Theta_1 = (passAngleA % 180) * Math.PI / 180;
    const Theta_2 = (passAngleB % 180) * Math.PI / 180;

    // As a condition, both angles must intersect the edge angle
    if (Theta_1 - Bi === 0 || Theta_2 - Bi === 0 )
      throw new Error("The transition cost can only be calculated if the pass angles are not parallel to the angle of the edge");

    // Continue with the computation of the transition cost
    const N_1 = Li * Math.sin(Math.abs(Theta_1 - Bi)) / (2 * W);
    const N_2 = Li * Math.sin(Math.abs(Theta_2 - Bi)) / (2 * W);
    const Ni = Math.min(N_1, N_2);
    const Theta_i = (N_1 < N_2)? Theta_2 : Theta_1;
    const Ci = (Theta_i - Bi === 0) ? (0) : (( 2 * W / Math.abs(Math.tan(Math.abs(Theta_i - Bi))) + Math.PI * R ) * (Math.abs(N_1 - N_2)));
    const CT = ( Math.abs(Theta_1 - Theta_2)) * Ni * ( R + W * Ni) / 2 + Ci;
    return CT;
  }


}
