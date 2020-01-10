import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule , DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';
import { AgmCoreModule } from '@agm/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AgmOverlays } from "agm-overlays"

import { AppComponent } from './app.component';
import { AppGlobals } from './app.globals'
import { AppConfigs } from './app.configs';
import { AppHelpers } from './app.helpers'
import { AppRoutingModule } from './app-routing.module';
import { ImageModalContent } from './app.image-modal-content.component';







import { AGMPolygonUtilsService } from './services/agm-polygon-utils.service';
import { AgmUtilsService } from './services/agm-utils.service';

import { CommonUtilsService } from './services/common-utils.service';
import { TurfUtilsService } from './services/turf/turf-utils.service';
import { TurfCoordinatesUtilsService } from './services/turf/turf-coordinates-utils.service';
import { TestingService } from './services/testing.service';

@NgModule({
  declarations: [
    AppComponent,
    ImageModalContent
  ],
  entryComponents: [
    ImageModalContent
  ],
  imports: [
    BrowserModule,
    AgmOverlays,
    NgbModule,
    FormsModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCcKenHSclpqbiSV6DLm23pVwd-ZaNrzYs',
      libraries: ['drawing']
    }),
    AngularFontAwesomeModule
  ],
  providers: [
    AppGlobals,
    AppConfigs,
    AppHelpers,
    TestingService,
    CommonUtilsService,
    AGMPolygonUtilsService,
    AgmUtilsService,
    TurfUtilsService,
    TurfCoordinatesUtilsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
