import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PCD } from './map/points/pcd';
import { PCDHistory } from './map/points/pcdhistory';
@Injectable({
  providedIn: 'root'
})
export class PythonFlaskAPIService{
  private localhost = 'http://localhost:';

  public data_pcd: JSON;
  public pcd: JSON;
  public pcd_history: JSON;

  constructor( private httpClient: HttpClient ) {}

  getAllPCD(){
    this.httpClient.get(this.localhost + '1524/pcd').subscribe(data => {
      this.data_pcd = JSON.parse(JSON.parse(JSON.stringify(data)));
    });
  }

  getPCDById( id: string ){
    this.httpClient.get(this.localhost + "1524/pcd/" + id).subscribe(data => {
      this.pcd = JSON.parse(JSON.stringify(data as JSON));
    });
  }

  getPCDHistoryById( id: string ){
    this.httpClient.get(this.localhost + "1524/pcd/" + id + "/history").subscribe(data => {
      this.pcd_history = JSON.parse(JSON.parse(JSON.stringify(data as JSON)));
    });
  }
}
