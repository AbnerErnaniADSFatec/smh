import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pcd } from './map/points/pcd';
import { PcdHistory } from './map/points/pcd-history';
import { Geotiff } from './map/rasters/geotiff';
import { AnaliseGeotiff } from './map/rasters/analise-geotiff';
import { CityByState } from './map/entities/city-by-state';
import { State } from './map/entities/state';
import { StateUnique } from './map/entities/state-unique';
import { CityByStateUnique } from './map/entities/city-by-state-unique';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PythonFlaskAPIService{
  private localhost = 'http://localhost:4863';

  public data_pcd: JSON;
  public pcd: JSON;
  public pcd_history: JSON;

  constructor( private httpClient: HttpClient ) {}

  getAllPCD(){
    return this.httpClient.get<Pcd>(this.localhost + '/pcd');
  }

  getPCDById(id: string): Observable<Pcd> {
    return this.httpClient.get<Pcd>(this.localhost + '/pcd/' + id);
  }

  getPCDHistoryById( id: string ){
    return this.httpClient.get<PcdHistory>(this.localhost + '/pcd/' + id + '/history');
  }

  getMergeDailyByDate( date: string ){
    return this.httpClient.get<Geotiff>(this.localhost + '/merge_daily/' + date);
  }

  /*
  async getMergeMonthlyByMonth( month: string ){
    return await this.httpClient.get<Geotiff>(this.localhost + '/merge_monthly/' + month).toPromise();
  }
  */

  getMergeMonthlyByMonth( month: string ){
    return this.httpClient.get<Geotiff>(this.localhost + '/merge_monthly/' + month);
  }

  getMergeYearlyByYear( year: string ){
    return this.httpClient.get<Geotiff>(this.localhost + '/merge_yearly/' + year);
  }

  getMergeMonthlyMean(){
    return this.httpClient.get(this.localhost + '/merge_monthly_mean');
  }

  getMergeYearlyMean(){
    return this.httpClient.get(this.localhost + '/merge_yearly_mean');
  }

  getMergeMonthlyMaxMean(geocodigo: string){
    return this.httpClient.get<AnaliseGeotiff>(this.localhost + '/an_merge_monthly/' + geocodigo);
  }

  getCities(uf: string){
    return this.httpClient.get<CityByState>(this.localhost + '/cities/' + uf);
  }

  getStates(){
    return this.httpClient.get<State>(this.localhost + '/states');
  }

  convertToArray(obj: Object){
    let vetor = [];
    for( let i = 0; obj[i] != null; i++ ){ vetor[i] = obj[i]; }
    return vetor;
  }

  convertToCityAPI(nome1: string[], geocodigo: string[] ){
    let cities: CityByStateUnique[] = [];
    for( let i in nome1 ){ cities[i] = { nome1 : nome1[i], geocodigo : geocodigo[i] }; }
    return cities;
  }

  convertToStateAPI(estado: string[], uf: string[]){
    let states: StateUnique[] = [];
    for( let i in estado ){ states[i] = { estado : estado[i], uf : uf[i] }; }
    return states;
  }
}
