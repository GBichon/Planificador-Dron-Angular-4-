import { Integration_GeoJSON_Service } from './../geojson.services/integration.service';
import { DCEL_List } from './../../models/DCEL_List.model';
import { DCEL_Face } from './../../models/DCEL_Face.model';
import { DCEL_Halfedge } from './../../models/DCEL_Halfedge.model';
import { DCEL_Region } from './../../models/DCEL_Region.model';



declare var turf: any;

export class DCEL_Adjacent_Regions_Service {

  PROP_REGION_KEY = "region";
  PROP_VISITED_KEY = "visited";

  constructor(){}

  obtainAdjacentRegions(dcel: DCEL_List, pass_width: number){
    dcel.getFaces().map( (f,idx) => f.setProperty("id", idx ))
    // Create regions
    let regions = dcel.getFaces().map( f => { return new DCEL_Region(pass_width, f); });
    // Start the merge algorith with any face
    let start_face = dcel.getFaces()[0];
    this.mergeBestAdjacentRegion(start_face, null, null, pass_width);
    // Merge faces of same region with same direction
    this.joinFacesOfTheSameRegion(dcel);
    // Return the remaining regions
    let remaining_regions = this.getAllRegions(dcel);
    console.log("regions", remaining_regions)
    return remaining_regions;
  }



  /**
   * Recursive algorithm that helps to merge the faces in a DCEL_List from right to left
   * @param  regionToBeProcessed The DCEL_Face to be processed
   * @param  cameFromRegion      The DCEL_Face that called this function
   * @param  cameFromEdge        The shared edge between the two faces
   * @param  options             Optinal parameters
   */
  private mergeBestAdjacentRegion(regionToBeProcessed: DCEL_Face, cameFromRegion: DCEL_Face, cameFromEdge: DCEL_Halfedge, passWidth: number, options?: any){
    console.log("mergeBestAdjacentRegion: (" + regionToBeProcessed.getPropertyValue("id") + ") Came from:", (cameFromRegion)? ( "(" + cameFromRegion.getPropertyValue("id") + ")") :  "(null)");
    // Mark region to be processed as visited
    regionToBeProcessed.setProperty(this.PROP_VISITED_KEY, true);
    // Initialization of variables
    let leftEdgesToProcessLater= [];
    let startEdge = (cameFromEdge)? cameFromEdge.getTwinEdge() : regionToBeProcessed.getAllEdges()[0];
    let currentEdge = startEdge;
    // Go through every edge, searching for oppossing faces to merge with
    do{
      if (currentEdge.getTwinEdge()){
        // Set the opossing face as secondFace and check if it adjoins the
        // region to be processed on his right side or his left side
        const secondRegion = currentEdge.getTwinEdge().getFace();
        const adjoinsOntheRight = secondRegion.getNorthEastVertice().isToTheEastOf(currentEdge.getOriginVertice());
        const adjoinsOnTheLeft = !adjoinsOntheRight;
        // If secondregion is not equal to cameFromRegion and adjoins on the left
        // Recursively call mergeBestAdjacentRegion and Call mergeTwoRegions
        if (secondRegion !== cameFromRegion && adjoinsOntheRight){
          if(!secondRegion.isPropertyEqualTo(this.PROP_VISITED_KEY, true)){
            this.mergeBestAdjacentRegion(secondRegion, regionToBeProcessed, currentEdge, passWidth);
          }
          this.mergeTwoRegions(regionToBeProcessed, secondRegion, currentEdge, passWidth);

        }
        // If secondRegion is not equal to cameFromRegion and adjoins on the right,
        // add it to the list of left edges for them to be processed after every
        // face at the right has been processed
        else if (secondRegion !== cameFromRegion && adjoinsOnTheLeft){
          leftEdgesToProcessLater.push(currentEdge);
        }
      }
      // Update current edge and start the next loop
      currentEdge = currentEdge.getNextEdge();
    } while( currentEdge !== startEdge );
    // After all of the region at the right has been processed, process the
    // ones that has been encountered on the left
    leftEdgesToProcessLater.forEach( currentEdge => {
      // If secondRegion hasn't been visited already, then recursively call
      // mergeBestAdjacentRegion and Call mergeTwoRegions
      const secondRegion = currentEdge.getTwinEdge().getFace();
      if (!secondRegion.isPropertyEqualTo(this.PROP_VISITED_KEY, true)){
        this.mergeBestAdjacentRegion(secondRegion, regionToBeProcessed, currentEdge, passWidth);
        this.mergeTwoRegions(secondRegion, regionToBeProcessed, currentEdge, passWidth);
      }
    });
    // Return the subregion that was just processed
    return regionToBeProcessed;
  }

  /**
   * Compute the cost savings of merging two faces and if the result is cost
   * effective, then merge their regions
   * @param  firstFace  Any DCEL_Face
   * @param  secondFace Any DCEL_Face
   * @param  sharedEdge Shared edge between the two faces (that belongs to the firstFace)
   * @param  passWidth  Width of the pass
   * @return            [description]
   */
  private mergeTwoRegions(firstFace: DCEL_Face, secondFace: DCEL_Face, sharedEdge: DCEL_Halfedge, passWidth: number){
    console.log("mergeTwoRegions", "(" + firstFace.getPropertyValue("id") + ")",  "(" + secondFace.getPropertyValue("id") + ")" );
    // Retrieve variables related to the regions
    const firstRegion = firstFace.getPropertyValue(this.PROP_REGION_KEY);
    const secondRegion = secondFace.getPropertyValue(this.PROP_REGION_KEY);
    // Retrieve variables related to the directions
    const firstIndividualOptimalDirection = firstRegion.getIndividualOptimalDirectionOf(firstFace);
    const firstPerpendicularDirection = (firstIndividualOptimalDirection + 90) % 180;
    const firstDirectionWithinRegion = firstRegion.getDirectionInRegion(firstFace)
    const secondIndividualOptimalDirection = secondRegion.getIndividualOptimalDirectionOf(secondFace);
    const secondPerpendicularDirection = (secondIndividualOptimalDirection + 90) % 180;
    const secondDirectionWithinRegion = secondRegion.getDirectionInRegion(secondFace);
    const edgeDirection = sharedEdge.getAngle() % 180;
    // Retrieve boolean variables
    const doTheyIntersectSharedEdge = firstIndividualOptimalDirection !== edgeDirection && secondIndividualOptimalDirection !== edgeDirection;
    const firstFaceIsSubRegion = (firstRegion.getFaces().length > 1);
    const secondFaceIsSubRegion = (secondRegion.getFaces().length > 1);
    // Initialize some variables
    let facesCanBeMerged = false;
    let costSavingsBetweenFaces = NaN;
    let firstMergeDirection = NaN;
    let secondMergeDirection = NaN;
    // If the two regions have the same optimal direction, compute the cost
    // savings of covering the two regions in the direction normal to the
    // previously calculated optimal direction and compare it to the cost
    // of covering the two regions in the previously calculated optimal
    // direction.
    if (firstIndividualOptimalDirection === secondIndividualOptimalDirection){
      const optimalDirection = firstIndividualOptimalDirection;
      const normalDirection = firstPerpendicularDirection;
      const normalCostSavings = this.calculateCostSavings(firstFace, secondFace, sharedEdge, normalDirection, null, passWidth);
      // If cost savings is greater than 0, the regions are merged using the
      // perpendicular direction as new optimal. Store with the merged region
      // the current cost savings for merging
      if (normalCostSavings > 0){
        facesCanBeMerged = true;
        costSavingsBetweenFaces = normalCostSavings;
        firstMergeDirection = normalDirection;
        secondMergeDirection = normalDirection;
      }
      // Otherwise, the regions are merged using the original optimal direction.
      // and store the current cost savings for merging (the amount saved by
      // not needing to turn along the common edge)
      else{
        facesCanBeMerged = true;
        costSavingsBetweenFaces = this.calculateCostSavings(firstFace, secondFace, sharedEdge, optimalDirection, null, passWidth);
        firstMergeDirection = optimalDirection;
        secondMergeDirection = optimalDirection;
      }
    } else{
      // if the optimal paths intersects the shared edge, calculate the cost
      // savings for merging the two edges. If the cost savings is greater than
      // 0, merge the two regions
      if (doTheyIntersectSharedEdge){
        const costSavings = this.calculateCostSavings(firstFace, secondFace, sharedEdge, firstIndividualOptimalDirection, secondIndividualOptimalDirection, passWidth);
        if (costSavings > 0) {
          facesCanBeMerged = true;
          costSavingsBetweenFaces = costSavings;
          firstMergeDirection = firstIndividualOptimalDirection;
          secondMergeDirection = secondIndividualOptimalDirection;
        }
      } else{
      // If the optimal paths do not intersects the shared edge
        // 1) Calculate the cost savings for covering the two regions using the
        // optimal direction for region 1
        // 2) Calculate the cost savings for covering the two regions using the
        // optimal direction for region 2
        // 3) Calculate the cost savings for covering the two regions using the
        // direction perpendicular to the optimal direction for region 1
        // 4) Calculate the cost savings for covering the two regions using the
        // direciton perpendicular to the optimal direction for region 2
        const CS1 = this.calculateCostSavings(firstFace, secondFace, sharedEdge, firstIndividualOptimalDirection, null, passWidth);
        const CS2 = this.calculateCostSavings(firstFace, secondFace, sharedEdge, secondIndividualOptimalDirection, null, passWidth);
        const CS3 = this.calculateCostSavings(firstFace, secondFace, sharedEdge, firstPerpendicularDirection, null, passWidth);
        const CS4 = this.calculateCostSavings(firstFace, secondFace, sharedEdge, secondPerpendicularDirection, null, passWidth);
        // Determine in which of these four options yelds the largest cost savings
        // and if the largest cost savings is greater than 0, merge using the
        // corresponding coverage pattern and store with the current cost savings
        const maxSavings = Math.max(CS1, CS2, CS3, CS4);
        if (maxSavings > 0){
          facesCanBeMerged = true;
          costSavingsBetweenFaces = maxSavings;
          switch (maxSavings) {
            case CS1:
              firstMergeDirection = firstIndividualOptimalDirection;
              secondMergeDirection = firstIndividualOptimalDirection;
              break;
            case CS2:
              firstMergeDirection = secondIndividualOptimalDirection;
              secondMergeDirection = secondIndividualOptimalDirection;
              break;
            case CS3:
              firstMergeDirection = firstPerpendicularDirection;
              secondMergeDirection = firstPerpendicularDirection;
              break;
            case CS4:
              firstMergeDirection = secondPerpendicularDirection;
              secondMergeDirection = secondPerpendicularDirection;
              break;
          }
        }
      }
    }

    // If the regions can be merged, then check if they finally are going to
    // be merged or not and how are they going to be merged
    if (facesCanBeMerged){
      console.log("Faces can be merged");
      let facesWontBeMerged = false;
      let firstFaceWillBeTakenFromItsRegion = false;
      let secondFaceWillBeTakenFromItsRegion = false;
      // If the first face is part of a region, and the directions that it has
      // in the region is different from the one when merged with the second
      // face, then it needs to be decided if the first face stays within the
      // first region or will be removed from it and be merged with the second
      // face.
      if (firstFaceIsSubRegion && firstMergeDirection !== firstDirectionWithinRegion){
        let costSavingsWithinRegion = firstRegion.getTotalCostSavingsOf(firstFace);
        // First face will be taken from region and will be merged with
        // second face
        if (costSavingsBetweenFaces < costSavingsWithinRegion){
          firstFaceWillBeTakenFromItsRegion = true;
        }
        // First face will stay in its region and won't be merged to the
        // second face
        else{
          facesWontBeMerged = true;
        }
      }

      // If the first face can be merged with the second face. But the second
      // face is also part of a region, and the direction it has when merged
      // with the first face is different from the direction it has within its
      // region, then it needs to be decided if the second face stays within
      // the second region or will be removed from it and be merged with the
      // second face
      if (!facesWontBeMerged && secondFaceIsSubRegion && secondMergeDirection !== secondDirectionWithinRegion){
        let costSavingsWithinRegion = secondRegion.getTotalCostSavingsOf(secondFace);
        // Second face will be taken from its region and will be merged with
        // first face
        if (costSavingsBetweenFaces < costSavingsWithinRegion){
          secondFaceWillBeTakenFromItsRegion = true;
        }
        // Second face will stay in its region and won't be merged to the
        // first face
        else{
          facesWontBeMerged = true;
        }
      }

      // Then lets merge if needed
      if (!facesWontBeMerged){
        if (firstFaceWillBeTakenFromItsRegion){ firstRegion.unmergeFaceFromRegion(firstFace); }

        if (secondFaceWillBeTakenFromItsRegion){ secondRegion.unmergeFaceFromRegion(secondFace); }

        firstFace.getPropertyValue(this.PROP_REGION_KEY).mergeFaceToRegion(secondFace, firstFace, secondMergeDirection, sharedEdge, costSavingsBetweenFaces);
        secondFace.getPropertyValue(this.PROP_REGION_KEY).setDirectionInRegion(firstFace, firstMergeDirection);
        console.log("It has been decided they will be merged");
      } else{
        console.log("However it has been decided they won't be merged")
      }
    } else{
      console.log("Faces won't be merged")
    }
  }

  /**
   * Compute the cost savings of merging two regions
   * @param  firstRegion  Any DCEL_Face object
   * @param  secondRegion Any DCEL_Face object
   * @param  sharedEdge   Any DCEL_Halfedge object. The edge shared by both faces
   * @param  directionA   The coverage direction of the first face
   * @param  directionB   The coverage direction of the second face
   * @param  passWidth    The width of the coverage pass
   * @param  options      Options
   * @return              The amount of cost savings
   */
  private calculateCostSavings(firstRegion: DCEL_Face, secondRegion: DCEL_Face, sharedEdge: DCEL_Halfedge, directionA: number, directionB: number, passWidth: number, options?: any): number{

    const GeoJSON_Services = new Integration_GeoJSON_Service();

    if (options == void 0) { options = {}; }
    // Case: One direction for the entire merged region
    let cost_savings = NaN;
    if (directionB === null || directionB === undefined){
      // Calculate or retrieve the total cost for both regions
      const direction = directionA;
      const TC1 = firstRegion.getPropertyValue(this.PROP_REGION_KEY).getIndividualOptimalCostOf(firstRegion);
      const TC2 = secondRegion.getPropertyValue(this.PROP_REGION_KEY).getIndividualOptimalCostOf(secondRegion);
      const TC1_theta = GeoJSON_Services.computeCostFunctionOnPolygon(firstRegion.getPolygon(), direction, passWidth, options);
      const TC2_theta = GeoJSON_Services.computeCostFunctionOnPolygon(secondRegion.getPolygon(), direction, passWidth, options);
      const TCI_theta = GeoJSON_Services.computeCostFunctionOnEdge(sharedEdge.getCoordinates(), direction, passWidth, options);
      const CSa = TC1 + TC2;
      const CSb = TC1_theta - TCI_theta;
      const CSc = TC2_theta - TCI_theta;
      const CS = CSa - CSb - CSc;
      // Something weird happens when the the TCs are equal and TCI_theta is 0
      cost_savings = (TC1 === TC1_theta && TC2 === TC2_theta && TCI_theta === 0)? (0) : (CS);
    }
    // Case: Two directions for each one of the regions
    else{
      const firstDirection = directionA;
      const secondDirection = directionB;
      const TC1 = GeoJSON_Services.computeCostFunctionOnEdge(sharedEdge.getCoordinates(), firstDirection, passWidth , options);
      const TC2 = GeoJSON_Services.computeCostFunctionOnEdge(sharedEdge.getCoordinates(), secondDirection, passWidth, options);
      const CT = GeoJSON_Services.computeTransitionCost(sharedEdge.getCoordinates(), firstDirection, secondDirection, passWidth);
      cost_savings = TC1 + TC2 - CT;
    }
    return cost_savings
  }


  /**
   * Get all different regions in the given DCEL LIST
   * @param  dcel Any DCEL_List object
   * @return      An Array of DCEL_Region
   */
  private getAllRegions(dcel: DCEL_List){
    let regions = [];
    dcel.getFaces().forEach( f => {
      let r = f.getPropertyValue(this.PROP_REGION_KEY);
      if (regions.indexOf(r) === -1){ regions.push(r); }
    });
    return regions;
  }

  private joinFacesOfTheSameRegion(dcel: DCEL_List){
    console.log("JOIIN")
    let regions = this.getAllRegions(dcel);

    regions.forEach( region => {

      let faces = region.getFaces().slice();

      while(faces.length !== 0){

        let face = faces.shift();
        let face_direction = region.getDirectionInRegion(face);
        let face_neighbours_data = region.getNeighboursDataOf(face).slice();

        while (face_neighbours_data.length !== 0){

          let neighbour_data = face_neighbours_data.shift();
          let neighbour = neighbour_data.getNeighbourOf(face);
          let neighbour_direction = region.getDirectionInRegion(neighbour);

          // If directions are equal
          if (turf.round(neighbour_direction,4) === turf.round(face_direction,4)){

            let neighbour_neighbours_data = region.getNeighboursDataOf(neighbour).slice();

            console.log(region.getSharedEdge(face, neighbour), neighbour_data, face === neighbour);

            let merged_face = dcel.mergeFaces(region.getSharedEdge(face, neighbour));

            // Remove the face from the list of faces
            region.removeFace(face);
            region.removeFace(neighbour);

            // Add merged face to region
            region.addFaceToRegion(merged_face);
            region.setDirectionInRegion(merged_face, face_direction)




            // Add the neighbour data from face to merged
            face_neighbours_data.forEach(data => {
              if (!data.hasFaces(face, neighbour)){
                region.mergeFaceToRegion(merged_face, data.getNeighbourOf(face), face_direction, data.getSharedEdge(), data.getCostSaving());
              }
            });

            // Add the neighbour data from neighbour to mergedg
            neighbour_neighbours_data.forEach(data => {
              if (!data.hasFaces(face, neighbour)){
                region.mergeFaceToRegion(merged_face, data.getNeighbourOf(neighbour), face_direction, data.getSharedEdge(), data.getCostSaving());
              }
            })

            // Remove merged neighbour
            faces.splice(faces.indexOf(neighbour), 1);
            faces.push(merged_face);
            break;
          }
        }
      }
    });
    console.log("dcel", dcel);
    console.log("END JOIN");
  }


}
