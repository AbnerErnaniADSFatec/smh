import { Component, OnInit } from '@angular/core';
import { toArray } from 'rxjs/operators';
import Map from 'ol/Map';
import {defaults as defaultControls, ScaleLine} from 'ol/control.js';
import MousePosition from 'ol/control/MousePosition.js';
import {createStringXY} from 'ol/coordinate.js';
import View from 'ol/View';
import FullScreen from 'ol/control/FullScreen';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import DragAndDrop from 'ol/interaction/DragAndDrop';
import GeoJSON from 'ol/format/GeoJSON';
import * as olProj from 'ol/proj';

// Classes criadas
import { BaseLayers } from './base-layers/base-layers';
import { Layer } from './tile-layers/layer';

// Serviços Criados
import { MapService } from 'src/app/map.service';
import { PythonFlaskAPIService } from 'src/app/python-flask-api.service';

// Interfaces Criadas
import { Pcd } from './points/pcd';
import { PcdHistory } from './points/pcd-history';
import { Geotiff } from './rasters/geotiff';
import { AnaliseGeotiff } from './rasters/analise-geotiff';
import { City } from './entities/city';
import { async } from '@angular/core/testing';
import { CityByState } from './entities/city-by-state';
import { CityByStateUnique } from './entities/city-by-state-unique';
import { State } from './entities/state';
import { StateUnique } from './entities/state-unique';
import { initDomAdapter } from '@angular/platform-browser/src/browser';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  private geoserverTerraMaLocal = 'http://localhost:8080/geoserver/wms?';
  private geoserverCemaden = 'http://200.133.244.148:8080/geoserver/cemaden_dev/wms';
  private geoserverQueimada = 'http://queimadas.dgi.inpe.br/queimadas/geoserver/wms?';
  private geoserver20Chuva = 'http://www.terrama2.dpi.inpe.br/chuva/geoserver/wms?';

  private map;
  private baseLayers = new BaseLayers();
  private layers = []
  private features = []

  private busca_PCD_id;

  private cities: City[];
  private selectedCity: City;

  private dataGrafico: any;

  // Busca de cidades via codigo no python API
  private citySelectedAPI: CityByStateUnique;
  private ufSelectedAPI: StateUnique;
  private ufsAPI: StateUnique[] = [ { estado : 'São Paulo', uf : 'SP' }, { estado : 'Bahia', uf : 'BA' } ];
  /** RS || 4301602 => Bagé */
  private citiesAPI: CityByStateUnique[] = [ 
    { nome1 : "São José dos Campos SP", geocodigo : "3549904" }, 
    { nome1 : "Santa Branca", geocodigo : "3546009" },
    { nome1 : "Baixa Grande do Ribeiro PI", geocodigo : "2201150" },
    { nome1 : "Manaus AM", geocodigo : "1302603" },
    { nome1 : "Recife PE", geocodigo : "2611606" },
    { nome1 : "Bagé RS", geocodigo : "4301602" }
  ];

  value: number = 0;
  testep: boolean = false;
  setMap: string = 'osm';
  mergeDailyDate: number = 1;
  mergeMonthlyDate: number = 1;
  mergeYearlyDate: number = 1998;

  minDate: Date;
  maxDate: Date;
  invalidDates: Array<Date>;

  // Banco de dados
  private cartoDBNum: number;

  private media = 0;

  constructor(private mapService: MapService, private apiFlask: PythonFlaskAPIService) { }

  ngOnInit() {
    // this.initDadosGrafico();
    this.initDate();
    this.initLayers();
    this.initCity();
    this.initState();
    this.initilizeJson();
    this.initilizeMap();
  }

  initDadosGrafico() {
    /*
    this.apiFlask.getMergeMonthlyMean().subscribe( data => {
      let values = [];
      for ( let i = 0; i < 12; i++ ){
        values[i] = data[i + 1];
      }
      console.log(values);
      this.dataGrafico = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','December'],
        datasets: [
          {
            label: 'Média Acumulado Mensal',
            backgroundColor:'#f8da86',
            borderColor: '#f8b802',
            data: values
          }
        ]
      }
    });
    this.apiFlask.getMergeYearlyMean().subscribe( data => {
      let values = [];
      let years = [];
      for ( let i = 0; i <= 20; i++ ){
        years[i] = (1998 + i).toString();
        values[i] = data[1998 + i];
      }
      console.log(values);
      this.dataGrafico = {
        labels: years,
        datasets: [
          {
            label: 'Média Acumulado Anual',
            backgroundColor:'#f8da86',
            borderColor: '#f8b802',
            data: values
          }
        ]
      }
    });
    this.dataGrafico = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor:'#f8da86',
          borderColor: '#f8b802',
          data: [0.98, 0.5, 0.2, 0.3, 0.4, 0.6, 0.6]
        },
        {
          label: 'My Second dataset',
          backgroundColor: '#f0b97b',
          borderColor: '#f07f00',
          data: [0.1, 0.9, 0.67, 0.89, 0.78, 0.545, 0.9]
        }
      ]
    }*/
    console.log(this.citySelectedAPI);
    this.apiFlask.getMergeMonthlyMaxMean(this.citySelectedAPI.geocodigo).subscribe( (data: AnaliseGeotiff) => {
      this.dataGrafico = {
        labels: this.apiFlask.convertToArray(data.mes),
        datasets: [
          {
            label: 'Média Acumulado Mensal da Cidade de ' + this.apiFlask.convertToArray(data.nome_municipio)[0].toString(),
            backgroundColor:'#f8da86',
            borderColor: '#f8b802',
            data: this.apiFlask.convertToArray(data.media)
          },
          {
            label: 'Máxima Acumulado Mensal da Cidade de ' + this.apiFlask.convertToArray(data.nome_municipio)[0].toString(),
            backgroundColor: '#f0b97b',
            borderColor: '#f07f00',
            data: this.apiFlask.convertToArray(data.maxima)
          }
        ]
      };
    });
  }

  initDate() {
    let today = new Date();
    this.minDate = new Date();
    this.minDate.setDate(2);
    this.minDate.setMonth(0);
    this.minDate.setFullYear(1998);
    this.maxDate = new Date();
    this.maxDate.setDate(31);
    this.maxDate.setMonth(0);
    this.maxDate.setFullYear(2019);
    this.invalidDates = [this.minDate, today];
  }

  initLayers() {
    this.layers = [
      new Layer(6, "Estados Brasil Político", "OBT DPI", 'terrama2_10:view10', '4674', this.geoserver20Chuva),
      new Layer(7, "Preciptação", "OBT DPI", 'terrama2_3:view3','4326', this.geoserver20Chuva),
      new Layer(8, "PCD's", "Local", 'terrama2_3:view3', '4326', this.geoserverTerraMaLocal),
      new Layer(9, "Divisão dos Estados", "Cemaden", 'cemaden_dev:br_estados', '4326', this.geoserverCemaden),
      new Layer(10, "Queimadas", "BD Queimadas", 'bdqueimadas:focos', '4326', this.geoserverQueimada),
      new Layer(11, "Análise", "OBT DPI", 'terrama2_11:view11', '4326', this.geoserver20Chuva),
      new Layer(12, "Prec4km Merge Daily", "Local", 'terrama2_46:view46', '4326', this.geoserverTerraMaLocal),
      new Layer(13, "Prec4km Merge Monthy", "Local", 'terrama2_23:view23', '4326', this.geoserverTerraMaLocal),
      new Layer(14, "Prec4km Merge Yearly", "Local", 'terrama2_26:view26', '4326', this.geoserverTerraMaLocal)
    ];
  }

  initCity() {
    this.cities = [
      {name: 'Lorena', code: '1230', lat:-45.146517200, long:-22.7309943000},
      {name: 'Guara', code: '2142', lat:-22.792237, long:-45.2387576},
      {name: 'SJC', code: '4582', lat:-45.9332243, long:-23.1894907},
      {name: 'PINDA', code: '896', lat:321321, long:46546},
      {name: 'SEILA', code: '3444', lat:321321, long:46546}
    ]
  }

  initState(){
    this.apiFlask.getStates().subscribe( (data:State) => {
      this.ufsAPI = this.apiFlask.convertToStateAPI(this.apiFlask.convertToArray(data.estado),this.apiFlask.convertToArray(data.uf));
    });
    console.log(this.ufsAPI);
  }

  initilizeMap() {
    let interval = setInterval(() => {
      this.value = this.value + Math.floor(Math.random() * 10) + 1;
      if (this.value >= 100) {
        this.value = 100;
        this.testep = true;
        // this.messageService.add({severity: 'info', summary: 'Success', detail: 'Process Completed'});
        clearInterval(interval);
      } else if (this.value >= 10) {
        // this.map.addLayer(this.pcd);
      } else if (this.value >= 5) {
        // this.map.addLayer(this.prec4km);
      } else if (this.value >= 2) {
        // this.map.addLayer(this.estado);
        // this.map.addLayer(this.baciashidrografica);
      }
    }, 2000);

    var mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: 'EPSG:4326', /** 3857 */
      className: 'custom-mouse-position',
      target: document.getElementById('mouse-position'),
      undefinedHTML: '&nbsp;'
    });

    var viewMap = new View({
      center: [-6124801.2015823, -1780692.0106836],
      zoom: 4
    });

    this.map = new Map({
      controls: defaultControls().extend([mousePositionControl, new FullScreen(), new DragRotateAndZoom(), new DragAndDrop()], new ScaleLine({units: 'degrees'})),
      layers: this.features /**  baseLayers.getBaseLayers() */,
      target: 'map',
      view: viewMap
    });

    /**
    this.map.updateSize();
    let evt = this.map;
    window.onresize = function(){ evt.updateSize(); }
    */

    this.map.on('click', function(event){
      this.mouseCoordinate = olProj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      console.log("4326 Lat: " + this.mouseCoordinate[0] + " Long: " + this.mouseCoordinate[1]);
    });

    var layersWMS = this.layers;
    this.map.on('singleclick', function(event){
      document.getElementById('info').innerHTML = '';
      var viewResolution = viewMap.getResolution();
      var viewProjection = viewMap.getProjection();
      for( let layer of layersWMS ){
        if( layer.checked ){
          var url = layer.getTileLayer().getSource().getGetFeatureInfoUrl(
            event.coordinate, viewResolution, viewProjection,
            "EPSG:4326",
            { 'INFO_FORMAT' : 'text/javascript', 'propertyName' : 'formal_en' }
          );
        }
      }
      if(url){
        console.log(url);
        document.getElementById('info').innerHTML = '<iframe id = "infoFrame" seamless src = "' + url + '"></iframe>';
      }
    });

    var mapAuxiliar = this.map;
    this.map.on('pointermove', function(event){
      if( event.dragging ){
        return true;
      }
      var pixel = mapAuxiliar.getEventPixel(event.originalEvent);
      var hit = mapAuxiliar.forEachLayerAtPixel(pixel, function(){
        return true;
      });
      mapAuxiliar.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    function changeMap() {
      console.log('name');
    }
    this.baseLayers.setBaseLayers(this.setMap);
  }

  initilizeJson() {
    var tileLayers = []
    for( let ind in this.layers ){ tileLayers[ind] = this.layers[ind].getTileLayer() }
    this.features = this.baseLayers.getBaseLayers().concat(tileLayers);
  }

  private setLayerType(){
    for ( let layer of this.layers ){
      layer.getTileLayer().setVisible(layer.checked);
      layer.getTileLayer().setOpacity(layer.opacidade/100);
    }
  }

  private setLayerTime(){
    for ( let layer of this.layers ){
      var day = layer.date.getDate();
      var month = layer.date.getMonth() + 1;
      var year = layer.date.getFullYear();
      layer.getTileLayer().getSource().updateParams({'TIME': year + '-' + month + '-' + day}); /** '2019-01-05'}); */
    }
    this.apiFlask.getMergeYearlyByYear(this.mergeYearlyDate.toString()).subscribe( (data: Geotiff) => {
      console.log(data);
    });
  }

  private setLayerMergeTime(index:number){
    if (index === 7) {
      this.layers[7].getTileLayer().getSource().updateParams({'TIME' : '1998-' + this.mergeMonthlyDate.toString() + '-02'});
      this.apiFlask.getMergeMonthlyByMonth(this.mergeMonthlyDate.toString()).subscribe( (data: Geotiff) => {
        console.log(data);
      })
    } else {
      this.layers[8].getTileLayer().getSource().updateParams({'TIME': this.mergeYearlyDate.toString() + '-01-02'});
      this.apiFlask.getMergeYearlyByYear(this.mergeYearlyDate.toString()).subscribe( (data: Geotiff) => {
        console.log(data);
      });
    }
  }

  private setLayerDataDB(){
    this.baseLayers.setSQLCartoDB('SELECT * FROM european_countries_e WHERE area >' + this.cartoDBNum);
  }

  private setMapType() {
    this.baseLayers.setBaseLayers(this.setMap);
  }

  private legenda(featuresLayer, featuresGeoserver){
    var url = featuresGeoserver + "REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=forceLabels:on&LAYER={{LAYER_NAME}}&STYLE={{STYLE_NAME}}"
    url = url.replace('{{LAYER_NAME}}', featuresLayer);
    url = url.replace('{{STYLE_NAME}}', featuresLayer + '_style');
    if(url){
      var parser = new GeoJSON();
      document.getElementById('legenda').innerHTML = '<iframe allowfullscreen height = "800" src = ' + url + '></iframe>';
    }
  }

  private salvar(){
    var group = this.map.getLayerGroup();
    var gruplayers = group.getLayers();
    var layers = this.map.getLayers().getArray();
    for (var i = 5; i < layers.length; i++) {
      var element = gruplayers.item(i);
      // this.map.removeLayer(element);
      var name = element.get('title');
      // console.log(element);
      console.log(name);
    }
  }

  private getPCD(){
    /**
    this.apiFlask.getPCDById(this.busca_PCD_id).subscribe((data: Pcd ) => {
      console.log(data);
    });
    */
    this.apiFlask.getAllPCD().subscribe( (data: Pcd) => {
      console.log(data);
    });
    /**
    this.apiFlask.getPCDHistoryById(this.busca_PCD_id).subscribe((data: PcdHistory) => {
      console.log(data);
    }); */
  }

  private setViewMap() {
    this.map.setView(new View({
      // center: [-6124801.2015823, -1780692.0106836], zoom: 9
      center: [this.selectedCity.lat, this.selectedCity.long], zoom: 11, projection: 'EPSG:4326'
      //  center: [this.selectedCity.lat, this.selectedCity.long], zoom: 11
    }));
  }

  private configSelectDataGrafico(){
    console.log(this.ufSelectedAPI.uf);
    this.citiesAPI = [];
    this.apiFlask.getCities(this.ufSelectedAPI.uf).subscribe( (data: CityByState) => {
      this.citiesAPI = this.apiFlask.convertToCityAPI(this.apiFlask.convertToArray(data.nome1),this.apiFlask.convertToArray(data.geocodigo));
    });
    console.log(this.citiesAPI);
  }

  private buscaDataGrafico(){
    console.log(this.citiesAPI);
  }

  activeLayer(index){
    for( let feature of this.features ){ feature.setZIndex(0); }
    this.features[index].setZIndex(1);
  }

  dellLayer(){
    for ( let layer of this.layers ){
      this.map.removeLayer(layer);
    }
  }
}
