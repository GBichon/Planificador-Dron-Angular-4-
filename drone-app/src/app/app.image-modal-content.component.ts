import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Load Image</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="modal-body">
      <img [src]="image_url" style="margin-left:25%; margin-right:25%; width:50%" (click)="image.click()">
      <input #image type="file" name="pic" accept="image/*" (change)="onImageChange($event)">

      <div class="input-group input-group-sm mb-3" style="margin-top: 15px;">
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon1">South West Lat/Lng</span>
        </div>
        <input [(ngModel)]="south_west_coordinate_latitude" type="number" class="form-control" aria-label="Latitude" aria-describedby="basic-addon1" step="0.0000000000001">
        <input [(ngModel)]="south_west_coordinate_longitude" type="number" class="form-control" aria-label="Latitude" aria-describedby="basic-addon1" step="0.0000000000001">
      </div>

      <div class="input-group input-group-sm mb-3" style="margin-top: 15px;">
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon2">North East Lat/Lng</span>
        </div>
        <input [(ngModel)]="north_east_coordinate_latitude" type="number" class="form-control" aria-label="Latitude" aria-describedby="basic-addon2" step="0.0000000000001">
        <input [(ngModel)]="north_east_coordinate_longitude" type="number" class="form-control" aria-label="Latitude" aria-describedby="basic-addon2" step="0.0000000000001">
      </div>

    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-success">Upload</button>
    </div>
  `
})
export class ImageModalContent {
  @Input() image_url: any;
  @Input() south_west_coordinate_latitude: number;
  @Input() south_west_coordinate_longitude: number;
  @Input() north_east_coordinate_latitude: number;
  @Input() north_east_coordinate_longitude: number;

  constructor(public activeModal: NgbActiveModal,
    private sanitizer:DomSanitizer,
  ) {}

  onImageChange($event) {
  let target = event.currentTarget as HTMLInputElement;
  if (target.files && target.files[0]){
    var reader = new FileReader();
    reader.onload = (event: ProgressEvent) => { this.image_url = (<FileReader> event.target).result; }
    reader.readAsDataURL(target.files[0]);
  } else {
    console.log("No File Uploaded");
  }
  }

}
