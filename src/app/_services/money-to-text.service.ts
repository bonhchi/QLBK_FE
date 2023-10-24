import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MoneyToTextService {
  constructor() { }
  separator = '.';
  mangso = [
    'không',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín',
  ];
  dochangchuc(so, daydu) {
    var chuoi = '';
    let chuc = Math.floor(so / 10);
    let donvi = so % 10;
    if (chuc > 1) {
      chuoi = ' ' + this.mangso[chuc] + ' mươi';
      if (donvi == 1) {
        chuoi += ' mốt';
      }
    } else if (chuc == 1) {
      chuoi = ' mười';
      if (donvi == 1) {
        chuoi += ' một';
      }
    } else if (daydu && donvi > 0) {
      chuoi = ' lẻ';
    }
    if (donvi == 5 && chuc > 1) {
      chuoi += ' lăm';
    } else if (donvi > 1 || (donvi == 1 && chuc == 0)) {
      chuoi += ' ' + this.mangso[donvi];
    }
    return chuoi;
  }
  docblock(so, daydu) {
    var chuoi = '';
    let tram = Math.floor(so / 100);
    so = so % 100;
    if (daydu || tram > 0) {
      chuoi = ' ' + this.mangso[tram] + ' trăm ';
      chuoi += this.dochangchuc(so, true);
    } else {
      chuoi = this.dochangchuc(so, false);
    }
    return chuoi;
  }
  dochangtrieu(so, daydu) {
    var chuoi = '';
    let trieu = Math.floor(so / 1000000);
    so = so % 1000000;
    if (trieu > 0) {
      chuoi = this.docblock(trieu, daydu) + ' triệu ';
      daydu = true;
    }
    let nghin = Math.floor(so / 1000);
    so = so % 1000;
    if (nghin > 0) {
      chuoi += this.docblock(nghin, daydu) + ' nghìn ';
      daydu = true;
    }
    if (so > 0) {
      chuoi += this.docblock(so, daydu);
    }
    return chuoi;
  }
  DocSo(so, l) {
    let currency_name = "", fractional_name = "cent";
    let words = '';
    if (typeof so === 'undefined') return '';
    if (Number(so) == 0) return this.capitalizeFirstLetter(this.mangso[0]);
    if (l == 'VND' && so.toString().split(this.separator).length > 1) return 'Không hợp lệ';
    // let number = this.toFixed(so);
    let number = so;
    const split = number.toString().split(this.separator);
    const isFloat = this.isFloat(this.toFixed(number));
    
    switch (l?.substring(0, 3)) {
      case "VND":
        currency_name = "đồng";
        fractional_name = "";
        break;
      case "USD":
        currency_name = "đô la Mỹ";
        break;
      case "XAU":
        currency_name = "chỉ vàng SJC ";
        fractional_name = "phân";
        break;
      case "EUR":
        currency_name = "euro";
        break;
      case "NZD":
        currency_name = "đô la New Zealand";
        break;
      case "GBP":
        currency_name = "bảng Anh";
        break;
      case "AUD":
        currency_name = "đô la Úc";
        break;
      case "THB":
        currency_name = "baht Thái";
        break;
      case "CAD":
        currency_name = "đô la Canada";
        break;
      case "HKD":
        currency_name = "đô la Hongkong";
        break;
      case "JPY":
        currency_name = "yên Nhật";
        break;
      case "SGD":
        currency_name = "đô la Singapore";
        break;
      case "CNY":
        currency_name = "nhân dân tệ";
        break;
      case "AAA":
        currency_name = "chỉ vàng AAA";
        break;
      case "TWD":
        currency_name = "tân đài tệ";
        break;
      case "CHF":
        currency_name = "franc Thụy Sĩ";
        break;
      case "WON":
        currency_name = "won Hàn Quốc";
        break;
      case "NOK":
        currency_name = "krone Na Uy";
        break;
      case "SEK":
        currency_name = "krona Thụy Điển";
        break;
      default:
        currency_name = "";
        break;
    }
    if(Number(split[0]) != 0)
      words = `${this.convertInternal(Number(split[0]))}`;
    words = words?.length > 0 ? `${words} ${currency_name}` : '';
    if (isFloat) {
      words += words?.length > 0 && l?.substring(0, 3) !== "XAU" ? ' và ' : '';      
      words += `${this.convertInternal(Number(split[1]))} ${fractional_name}`;
    }

    words = words.trim();
    if (words.length > 0) words = this.capitalizeFirstLetter(words);

    return `${words}./.`;
  }

  protected convertInternal(number: number): string {
    let words: string = "", hauto: string = "";
    do {
      let ty = number % 1000000000;
      number = Math.floor(number / 1000000000);
      if (number > 0) {
        words = this.dochangtrieu(ty, true) + hauto + words;
      } else {
        words = this.dochangtrieu(ty, false) + hauto + words;
      }
      hauto = ' tỷ ';
    } while (number > 0);
    return words;
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  formatCurrency(n, separate = '.', decimalMarker = ',') {
    if (n == null || n == "" || n == undefined)
      return 0;
    var parts = n.toString().split(separate);
    var regex = /\B(?=(\d{3})+(?!\d))/g;
    var ret = parts[0].replace(regex, separate) + (parts[1] ? decimalMarker + parts[1] : "");
    return ret;
  }

  removeAccents(str) {
    var AccentsMap = [
      "aàảãáạăằẳẵắặâầẩẫấậ",
      "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
      "dđ", "DĐ",
      "eèẻẽéẹêềểễếệ",
      "EÈẺẼÉẸÊỀỂỄẾỆ",
      "iìỉĩíị",
      "IÌỈĨÍỊ",
      "oòỏõóọôồổỗốộơờởỡớợ",
      "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
      "uùủũúụưừửữứự",
      "UÙỦŨÚỤƯỪỬỮỨỰ",
      "yỳỷỹýỵ",
      "YỲỶỸÝỴ"
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
      var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
      var char = AccentsMap[i][0];
      str = str.replace(re, char);
    }
    return str;
  }

  public isFloat(number: number | string): boolean {
    return Number(number) === number && number % 1 !== 0;
  }

  public toFixed(number: number, precision = 2): number {
    return Number(Number(number).toFixed(precision));
  }

}
