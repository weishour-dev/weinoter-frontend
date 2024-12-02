import { Pipe, PipeTransform } from '@angular/core';
import type { SafeAny } from '@ws/types';

@Pipe({
  name: 'mapTo',
  standalone: true,
})
export class MapToPipe implements PipeTransform {
  transform(data, identifyKey): SafeAny {
    if (!data) {
      return data;
    }
    if (Array.isArray(data)) {
      return data.map(item => item[identifyKey]);
    } else {
      return data[identifyKey];
    }
  }
}
