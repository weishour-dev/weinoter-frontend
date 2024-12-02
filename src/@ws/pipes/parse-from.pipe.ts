import { Pipe, PipeTransform } from '@angular/core';
import type { SafeAny } from '@ws/types';

@Pipe({
  name: 'parseFrom',
  standalone: true,
})
export class ParseFromPipe implements PipeTransform {
  transform(data, identifyKey, options): SafeAny {
    if (Array.isArray(data)) {
      return data.map(item => options.find(op => op[identifyKey] === item) || { identifyKey: item });
    } else {
      return options.find(op => op[identifyKey] === data) || { identifyKey: data };
    }
  }
}
