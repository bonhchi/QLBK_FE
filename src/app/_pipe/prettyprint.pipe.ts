import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyprint'
})
export class PrettyprintPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    return JSON.stringify(value, null, 2)
      .replace(/ /g, '&nbsp;') // note the usage of `/ /g` instead of `' '` in order to replace all occurences
      .replace(/\n/g, '<br/>'); // same here
  }

}
