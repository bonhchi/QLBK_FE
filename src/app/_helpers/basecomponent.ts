import { AfterContentInit, Injectable, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import * as moment from 'moment';

@Injectable()
export class BaseComponent implements OnInit, OnDestroy, AfterContentInit {
  private _componentName: string = "BaseComponent";

  ngOnDestroy(): void {
  }
  ngAfterContentInit(): void {
  }
  ngOnInit(): void {
    try {
      this._componentName = (<any>this).constructor.name
      // if (!_.isUndefined(this.opt) && this.opt.enableHotKey){
      //     this._shortcut.load((<any>this).constructor.name);
      //     this._subHotKey = this._shortcut.events.subscribe(c => this._accessFunction(c));
      // }

    } catch (error) {
      console.log(error)
    }
  }

  showValidationForm(frm: FormGroup): boolean {
    if (!frm)
      return false
    Object.keys(frm.controls).forEach(name => {
      let formcontrol = frm.controls[name]
      if (!formcontrol.valid) {
        formcontrol.markAsDirty()
      }
    })
    return frm.valid
  }

  convertToLocalDate(val: string): any {
    try {
      let parsedDate = moment(val, "YYYY-MM-DD").date().toString();
      return parsedDate;
    } catch (error) {
      return val;
    }
  }

}