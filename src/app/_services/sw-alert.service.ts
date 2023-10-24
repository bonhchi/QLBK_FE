import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { LayoutService } from './layout.service';

@Injectable({
  providedIn: 'root'
})
export class SwAlertService {  
  constructor(
    private layoutService: LayoutService
  ) { }
  public warning(title, textLine, isShowCancel?) {
    return Swal.fire({
      icon: 'warning',
      title: title || 'Cảnh báo',
      text: textLine,
      showCancelButton: isShowCancel,
      cancelButtonText: 'Không',
      confirmButtonText: isShowCancel ? 'Có' : 'Đồng ý',
      reverseButtons: true,
      allowOutsideClick: false
    });
  }
  public success(title, textLine, position?) {
    return Swal.fire({
      // position: position || 'top-end',
      icon: 'success',
      title: title || '',
      text: textLine,
      showConfirmButton: false,
      timer: 2000
    });
  }
  public error(title, textLine) {
    return Swal.fire({
      icon: 'error',
      title: title || 'Lỗi',
      text: textLine,
      showCancelButton: false,
      confirmButtonText: 'Đồng ý',
      confirmButtonColor: this.layoutService.config.color.primary_color,
      reverseButtons: true,
      allowOutsideClick: false
    });
  }
  public withConfirmation(title: string, message: string, okFn: () => void, cancelFn: () => void) {
    return Swal.fire({
      title: title,
      html: message,
      // type: 'warning',
      showCancelButton: true,
      confirmButtonColor: this.layoutService.config.color.primary_color,
      cancelButtonColor: this.layoutService.config.color.secondary_color,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Không'
    }).then((result) => {
      if (result.value) {
        okFn();
      }
     if(result.isDismissed){
      cancelFn();
     }
    });
  }
}

/**
 * In component.ts

constructor(public sweetAlertService: SweetAlertService){}
const popupResponse =  this.sweetAlertService.warningAlert('Your meassage', true);

   if (popupResponse.value) {
   // press Yes on popup
    }
   else{// press cancel on popup}
In module.ts

import
providers: [SweetAlertService ]
 */