import { Injectable } from '@angular/core';
import { List } from 'linq-typescript';
import _ from 'lodash'
@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  /// render status field (class and name)
  public renderStatusClass(statusList: any, status: string) {
    const result = new List<any>(statusList).where(w => w.code == status).toArray()[0];
    return result;
  }

  // automation paystatement
  public autoStatement(balance: number, datas: any[]) {
    datas.forEach((item) => {
      if (item.available_number_heal > 0) {
        var _number_heal = Math.floor(balance / item.price); //Lấy số nguyên
        item.number_heal = _number_heal > item.available_number_heal ? item.available_number_heal : _number_heal;
        item.total = item.price * (item.number_heal + item.number_torn + item.number_coin);
        balance -= item.number_heal * item.price;
      }
    });
    return datas;
  }

  public autoStatementProcessBNP(balance: number, datas: any[], moneyFund: any[]) {
    datas.forEach((item, index) => {
      item.number_heal = 0;
      item.number_coin = 0;
      item.number_torn = 0;
      if (moneyFund[index].available_number_heal > 0 && balance > 0) {
        var _number_heal = Math.floor(balance / item.price); 
        if(moneyFund[index].available_number_heal < _number_heal){ //THIEU TIEN
          item.number_heal = moneyFund[index].available_number_heal;
          moneyFund[index].available_number_heal -= item.number_heal;
        }
        if(moneyFund[index].available_number_heal > _number_heal){ //DU TIEN
          item.number_heal = _number_heal > item.available_number_heal ? item.available_number_heal : _number_heal;
          moneyFund[index].available_number_heal -= item.number_heal;
        }

        item.total = item.price * (item.number_heal + item.number_torn + item.number_coin);
        balance -= item.number_heal * item.price;
      }
    });
    return { datas , moneyFund };
  }
}
