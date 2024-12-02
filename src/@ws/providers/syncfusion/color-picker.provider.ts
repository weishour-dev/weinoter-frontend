import { Injectable } from '@angular/core';
import { PaletteTileEventArgs } from '@syncfusion/ej2-angular-inputs';
import { addClass } from '@syncfusion/ej2-base';

@Injectable({ providedIn: 'root' })
export class ColorPickerProvider {
  /** 上限字段默认背景色 */
  readonly upperBg = '#f44336ff';
  readonly lowerBg = '#2196F3ff';

  /** 调色盘自定义配置 */
  readonly paletteColors: { [key: string]: string[] } = {
    custom: [
      '#f44336ff',
      '#e91e63ff',
      '#9c27b0ff',
      '#673ab7ff',
      '#3f51b5ff',
      '#2196F3ff',
      '#4caf50ff',
      '#ffeb3bff',
      '#ff9800ff',
    ],
  };

  /**
   * 颜色(预设)渲染处理
   *
   * @param args
   */
  circleTileRender(args: PaletteTileEventArgs): void {
    addClass([args.element], ['e-icons', 'e-custom-circle']);
  }
}
