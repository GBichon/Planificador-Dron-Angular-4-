import { DCEL_Vertice } from './DCEL_Vertice.model';
import { DCEL_Halfedge } from './DCEL_Halfedge.model';
import { DCEL_Face } from './DCEL_Face.model';
import { DCEL_Neighbours } from './DCEL_Neighbours.model';
import { DCEL_Bounds } from './DCEL_Bounds.model';
import { DCEL_Face_In_Region_Information } from './DCEL_Face_In_Region_Information.model';
declare var turf: any;



export class DCEL_Region{

  private PROP_REGION_KEY = "region";

  // An array of face that are part of the same region
  private _DCEL_Faces: DCEL_Face[];

  // Value of the pass width used when the optimal direction is calculated
  // for each face in the region
  private _pass_width: number

  // An array of objects that keeps tracks of the merged neighbours in the
  // region and the cost saving of having them merged
  private _DCEL_Neighbours: DCEL_Neighbours[];

  // An array of objects that keeps track of the individual optimal direction
  // of the face and the merged optimal direction inside of the region
  private _DCEL_Faces_In_Region_Information: DCEL_Face_In_Region_Information[];

  // A dictionary that keeps track of any additional property that could be attached to the DCEL instance
  private _properties: any;

  constructor(pass_width: number, face: DCEL_Face){

    // Validation
    if (typeof pass_width !== "number" || isNaN(pass_width) || pass_width <= 0)
      throw new Error("The parameter 'pass_width' must be a positive value");

    if (!face)
      throw new Error("The parameter 'face' is required but " + face + " was received");

    // Assignation
    this._DCEL_Faces = [];
    this._DCEL_Neighbours = [];
    this._DCEL_Faces_In_Region_Information = [];
    this._pass_width = pass_width;
    this.addFaceToRegion(face)
  }

// Get functions

  /**
   * Return all of the DCEL_Face objects attached to this instance
   * @return An array of DCEL_Face objects
   */
  public getFaces(): DCEL_Face[]{
    return this._DCEL_Faces;
  }

  /**
   * Return the pass width given to this region
   * @return A number
   */
  public getPassWidth(): number{
    return this._pass_width;
  }

  /**
   * Returns the shared edge between two faces that are part of the region
   * @param  one     Any DCEL_Face object
   * @param  another Any DCEL_Face object
   * @return         Shared DCEL_Halfedge
   */
  public getSharedEdge(one: DCEL_Face, another: DCEL_Face){
    for (let idx = 0; idx < this._DCEL_Neighbours.length; idx++){
      if (this._DCEL_Neighbours[idx].hasFaces(one, another)){
        return this._DCEL_Neighbours[idx].getSharedEdge();
      }
    }
    return undefined;
  }

  /**
   * Return the neighbours of the given DCEL_Face object
   * @param  face Any DCEL_Face object
   * @return      an Array of neighbours DCEL_Face objects
   */
  public getNeighboursOf(face: DCEL_Face): DCEL_Face[]{
    let neighbours = [];
    this._DCEL_Neighbours.forEach(n => {
      if (n.hasFace(face)){
        neighbours.push(n.getNeighbourOf(face));
      }
    });
    return neighbours;
  }


  /**
   * Return all of the DCEL_Neighbours attached to this instance
   * @return  An array of DCEL_Neighbours
   */
  public getNeighboursList(): DCEL_Neighbours[]{
    return this._DCEL_Neighbours;
  }

  public getNeighboursDataOf(face: DCEL_Face): DCEL_Neighbours[]{
    return this._DCEL_Neighbours.filter( data => {
      return data.hasFace(face);
    })
  }

  public getIndividualFaceInformationList(): DCEL_Face_In_Region_Information[]{
    return this._DCEL_Faces_In_Region_Information;
  }

  /**
   * Returns the individual optimal direction of the given face in its region
   * @param  face Any DCEL_Face object in the region
   * @return      A number. NaN if the face is not part of the region
   */
  public getIndividualOptimalDirectionOf(face: DCEL_Face): number{
    for (let idx = 0; idx < this._DCEL_Faces_In_Region_Information.length; idx++){
      if (this._DCEL_Faces_In_Region_Information[idx].hasFace(face)){
        return this._DCEL_Faces_In_Region_Information[idx].getIndividualDirection();
      }
    }
    return NaN;
  }

  /**
   * Returns the cost of following the individual optimal direction of the given face in its region
   * @param  face Any DCEL_Face object in the region
   * @return      A number. NaN if the face is not part of the region
   */
  public getIndividualOptimalCostOf(face: DCEL_Face): number{
    for (let idx = 0; idx < this._DCEL_Faces_In_Region_Information.length; idx++){
      if (this._DCEL_Faces_In_Region_Information[idx].hasFace(face)){
        return this._DCEL_Faces_In_Region_Information[idx].getIndividualCost();
      }
    }
    return NaN;
  }


  /**
   * Returns the merged optimal direction of the given face in its region
   * @param  face Any DCEL_Face object in the region
   * @return      A number. NaN if the face is not part of the region
   */
  public getDirectionInRegion(face: DCEL_Face){
    for (let idx = 0; idx < this._DCEL_Faces_In_Region_Information.length; idx++){
      if (this._DCEL_Faces_In_Region_Information[idx].hasFace(face)){
        return this._DCEL_Faces_In_Region_Information[idx].getDirectionInRegion();
      }
    }
    return NaN;
  }


  public setDirectionInRegion(face: DCEL_Face, direction: number){
    for (let idx = 0; idx < this._DCEL_Faces_In_Region_Information.length; idx++){
      if (this._DCEL_Faces_In_Region_Information[idx].hasFace(face)){
        this._DCEL_Faces_In_Region_Information[idx].setDirectionInRegion(direction);
        break;
      }
    }
  }
  /**
   * Return the sum of the cost savings of the having the region of merged faces
   * instead of having all of the faces individually
   * @return the amount of cost savings
   */
  public getTotalCostSavings(): number{
    let cost_saving = 0;
    for (let idx = 0; idx < this._DCEL_Neighbours.length; idx++ ){
      cost_saving += this._DCEL_Neighbours[idx].getCostSaving();
    }
    return cost_saving;
  }

  /**
   * Returns the sum of hte cost savings of having the given face being merged
   * with others in the same region.
   * @param  face Any DCEL_Face object that is part of the region
   * @return      The amount of cost savings of the given Face in the region
   */
  public getTotalCostSavingsOf(face: DCEL_Face): number{
    // Validation
    if (!this.hasFace(face)) { throw new Error("Region doesn't contains the given face object"); }
    // Main
    let cost_saving = 0;
    for (let idx = 0; idx < this._DCEL_Neighbours.length; idx++ ){
      if (this._DCEL_Neighbours[idx].hasFace(face)){
        cost_saving += this._DCEL_Neighbours[idx].getCostSaving();
      }
    }
    return cost_saving;
  }

  /**
   * Return all of vertices that are in each extreme of the region
   * @return An array of vertices
   */
  public getRegionBoundVertices(): DCEL_Vertice[]{
    let bounds = new DCEL_Bounds();
    this._DCEL_Faces.forEach( face => {
      bounds.updateBounds(face.getBoundsVertices());
    });
    return bounds.getDistinctVertices();
  }

// Boolean functions

  /**
   * Return true or false depending if this instance has the given Face attached
   * @param  other Any DCEL_Face object
   * @return       true if the instance has the Face. Otherwise, false
   */
  public hasFace(other: DCEL_Face): boolean{
    return this._DCEL_Faces.indexOf(other) !== -1;
  }

// Aggregator functions

  /**
   * Push a Face to the region, and relevant information to it
   * @param  face Any DCEL_Face object
   */
  public addFaceToRegion(face: DCEL_Face){

    // Validations
    if (this.hasFace(face)){
      throw new Error("Region already has the given face added");
    }

    // Main
    this._DCEL_Faces.push(face);
    this._DCEL_Faces_In_Region_Information.push( new DCEL_Face_In_Region_Information(face, this._pass_width));
    face.setProperty(this.PROP_REGION_KEY, this);
  }

  /**
   * Merge a Face. along with his entire region, with an specific Face that
   * is part of the curreng Region instance.
   * @param  faceToBeMerged             Any DCEL_Face
   * @param  regionFaceToBeMergedWith   Any DCEL_Face that is part of the Region
   * @param  sharedEdge                 The Edge that is common between both faces
   * @param  costSavings                The savings that results from merging both faces
   */
  public mergeFaceToRegion(faceToBeMerged: DCEL_Face, regionFaceToBeMergedWith: DCEL_Face, faceToBeMergedDirection: number, sharedEdge: DCEL_Halfedge, cost_saving: number){
    // Validationsl
    if (!faceToBeMerged)
      throw new Error("The parameter 'faceToBeMerged' is required but " + faceToBeMerged + " was received");

    if (!regionFaceToBeMergedWith)
      throw new Error("The parameter 'regionFaceToBeMergedWith' is required but " + regionFaceToBeMergedWith + " was received");

    if (isNaN(faceToBeMergedDirection))
      throw new Error("The parameter 'faceToBeMergedDirection' must be a number");

    if (!sharedEdge)
      throw new Error("The parameter 'sharedEdge' is required but " + sharedEdge + " was received");

    if (isNaN(cost_saving) || cost_saving < 0)
      throw new Error("the parameter 'cost_saving' must be a positive number");

    if (!this.hasFace(regionFaceToBeMergedWith))
      throw new Error("'regionFaceToBeMergedWith' is not part of the region")

    if (faceToBeMerged === regionFaceToBeMergedWith)
      throw new Error("'faceToBeMerged' and 'regionFaceToBeMergedWith' must not be the same");

    // Transformation
    faceToBeMergedDirection = faceToBeMergedDirection % 180;

    // If the face already exists in the region, then only a _DCEL_Neighbours
    // must be created
    if (this.hasFace(faceToBeMerged)){
      // If the face direction is different from the one it has when currently
      // merged with the faces of the region, then unmerge them
      if (this.getDirectionInRegion(faceToBeMerged) !== faceToBeMergedDirection){

        // Remove his neighbours from the list of neighbours
        for (let idx = 0; idx < this._DCEL_Neighbours.length; ){
          (this._DCEL_Neighbours[idx].hasFace(faceToBeMerged))? this._DCEL_Neighbours.splice(idx, 1) : idx++;
        }
        // Update face in region information
        for (let idx = 0; idx < this._DCEL_Faces_In_Region_Information.length; idx++){
          if (this._DCEL_Faces_In_Region_Information[idx].hasFace(faceToBeMerged)){
            this._DCEL_Faces_In_Region_Information[idx].setDirectionInRegion(faceToBeMergedDirection);
            break;
          }
        }
      }
      // Create new neighbours
      this._DCEL_Neighbours.push( new DCEL_Neighbours(faceToBeMerged, regionFaceToBeMergedWith, sharedEdge, cost_saving));
    }

    // If the face is not in the region
    else{
      let regionToBeMerged = faceToBeMerged.hasProperty(this.PROP_REGION_KEY)? faceToBeMerged.getPropertyValue(this.PROP_REGION_KEY) : null;
      // If the face to be merged has its own region, then merge its data to the
      // current one
      if (regionToBeMerged){
        // Update the region of the face to be merged if necessary
        if (regionToBeMerged.getDirectionInRegion(faceToBeMerged) !== faceToBeMergedDirection){
          regionToBeMerged = regionToBeMerged.unmergeFaceFromRegion(faceToBeMerged);
          // Update list of face information in region of that face
          for (let idx = 0; idx < regionToBeMerged.getIndividualFaceInformationList().length; idx++){
            let current_element = regionToBeMerged.getIndividualFaceInformationList()[idx];
            if (current_element.hasFace(faceToBeMerged)){
              current_element.setDirectionInRegion(faceToBeMergedDirection)
            }
          }
        }
        // Update list of  faces
        this._DCEL_Faces = this._DCEL_Faces.concat(regionToBeMerged.getFaces());
        // Update list of neighbours
        this._DCEL_Neighbours = this._DCEL_Neighbours.concat(regionToBeMerged.getNeighboursList());
        //  Update list of face in region information
        this._DCEL_Faces_In_Region_Information = this._DCEL_Faces_In_Region_Information.concat(regionToBeMerged.getIndividualFaceInformationList());
        // Update regions attached as property in each region to be merged face
        regionToBeMerged.getFaces().forEach( f => {f.updatePropertyValue(this.PROP_REGION_KEY, this); });
        // Clear region to be merged since it won't be of use anymore
        regionToBeMerged.clearObject();
        regionToBeMerged = undefined;
      }
      // If the face doesn't have a region, then just attach it to the new region
      else{
        this.addFaceToRegion(faceToBeMerged);
      }
      // Create new neighbours
      this._DCEL_Neighbours.push( new DCEL_Neighbours(faceToBeMerged, regionFaceToBeMergedWith, sharedEdge, cost_saving));
    }
  }

  /**
   * Take away a Face from the Region. Face ends up with his own Region
   * @param  faceToBeUnmerged Any DCEL_Face that is part of the Region instance
   * @return  The region that has been created for the unmerged face
   */
  public unmergeFaceFromRegion(faceToBeUnmerged: DCEL_Face): DCEL_Region{

    // Validation
    if (!faceToBeUnmerged)
      throw new Error("The parameter 'faceToBeUnmerged' is required but " + faceToBeUnmerged + " was received");

    if (!this.hasFace(faceToBeUnmerged))
      throw new Error("'faceToBeUnmerged' is not part of the current region, therefore it can't be unmerged from it");

    // is not necessary to unmerge a Region with a single Face
    if (this._DCEL_Faces.length !== 1) {
      // Remove the face from the list of faces
      this._DCEL_Faces.splice(this._DCEL_Faces.indexOf(faceToBeUnmerged), 1);
      // Remove his neighbours from the list of neighbours
      for (let idx = 0; idx < this._DCEL_Neighbours.length; ){
        (this._DCEL_Neighbours[idx].hasFace(faceToBeUnmerged))? this._DCEL_Neighbours.splice(idx, 1) : idx++;
      }
      // Remove the information of the face in the region
      for (let idx = 0; idx < this._DCEL_Faces_In_Region_Information.length; idx++){
        if (this._DCEL_Faces_In_Region_Information[idx].hasFace(faceToBeUnmerged)){
          this._DCEL_Faces_In_Region_Information.splice(idx, 1);
          break;
        }
      }
      // Create a new region for the unmerged face only
      let pass_width = this._pass_width;
      let new_region = new DCEL_Region(pass_width, faceToBeUnmerged);
      return new_region
    }
    return this;
  }

  public removeFace(faceToBeUnmerged: DCEL_Face){

    // Validation
    if (!faceToBeUnmerged)
      throw new Error("The parameter 'faceToBeUnmerged' is required but " + faceToBeUnmerged + " was received");

    if (!this.hasFace(faceToBeUnmerged))
      throw new Error("'faceToBeUnmerged' is not part of the current region, therefore it can't be unmerged from it");

    // Remove the face from the list of faces
    this._DCEL_Faces.splice(this._DCEL_Faces.indexOf(faceToBeUnmerged), 1);
    // Remove his neighbours from the list of neighbours
    for (let idx = 0; idx < this._DCEL_Neighbours.length; ){
      (this._DCEL_Neighbours[idx].hasFace(faceToBeUnmerged))? this._DCEL_Neighbours.splice(idx, 1) : idx++;
    }
    // Remove the information of the face in the region
    for (let idx = 0; idx < this._DCEL_Faces_In_Region_Information.length; idx++){
      if (this._DCEL_Faces_In_Region_Information[idx].hasFace(faceToBeUnmerged)){
        this._DCEL_Faces_In_Region_Information.splice(idx, 1);
        break;
      }
    }
  }


  /**
   * Set the instance variables as undefined
   */
  public clearObject(){
    this._DCEL_Faces = undefined;
    this._DCEL_Neighbours = undefined;
    this._DCEL_Faces_In_Region_Information = undefined;
    this._pass_width = NaN;
  }


  /**
   *  Set a new property with an specific value to the properties object
   * @param  key   key of the property
   * @param  value value of the property
   */
  public setProperty(key: string, value: any){
    this._properties[key] = value;
  }

  /**
   * Update the value of an already existing property. If the property doesn't
   * exists, then throws an error
   * @param  key   key of the property
   * @param  value value of the property
   */
  public updatePropertyValue(key: string, value: any){
    if (!this.hasProperty(key)) { throw new Error("Face doesn't have the property '" + key +"' attached"); }
    this.setProperty(key, value);
  }

// Properties related functions

  /**
   * Check if the current DCEL instance has an specific property
   * @param  key key of the property
   * @return     true if the Face has the given property key. Otherwise, false
   */
  public hasProperty(key: string){
    return this._properties.hasOwnProperty(key);
  }

  /**
   * Check if the current DCEL instance has an specific property with a value
   * equal to the given one. If the property doesn't exists in the instance,
   * then throws an error
   * @param  key   key of the property
   * @param  value comparison value
   * @return       true if the Face has the given property value. Otherwise, false
   */
  public isPropertyEqualTo(key: string, value: any){
    if (!this.hasProperty(key)) { return false; }
    return this._properties[key] === value;
  }

  /**
   * Get the value of an specific property
   * @param  key key of the property
   * @return     value of the property
   */
  public getPropertyValue(key: string): any{
    if (!this.hasProperty(key)) throw new Error("DCEL_Face doesn't have attached the property '" + key + "'");
    return this._properties[key];
  }

  /**
   * Remove a property from the current instance
   * @param  key key of the property
   */
  private removeProperty(key: string){
    delete this._properties[key];
  }



}
