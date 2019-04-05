import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

import { FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Imports PrimeFaceNg Components
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import {ProgressBarModule} from 'primeng/progressbar';
import {InputSwitchModule} from 'primeng/inputswitch';
import {SliderModule} from 'primeng/slider';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {SidebarModule} from 'primeng/sidebar';
import {ChartModule} from 'primeng/chart';
import {CalendarModule} from 'primeng/calendar';
import {InputTextModule} from 'primeng/inputtext';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    RadioButtonModule,
    CheckboxModule,
    ProgressBarModule,
    InputSwitchModule,
    SliderModule,
    ButtonModule,
    DialogModule,
    SidebarModule,
    ChartModule,
    CalendarModule,
    InputTextModule,
    ProgressSpinnerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
