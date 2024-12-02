import { Injectable } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridType } from 'angular-gridster2';

@Injectable({ providedIn: 'root' })
export class GridsterProvider {
  /** 布局设置 */
  readonly gridsterConfig: GridsterConfig = {
    margin: 8,
    gridType: GridType.Fixed,
    fixedColWidth: 230,
    fixedRowHeight: 35 + 25 * 5,
    outerMarginTop: 8,
    outerMarginRight: 8,
    outerMarginBottom: 8,
    outerMarginLeft: 8,
    displayGrid: DisplayGrid.OnDragAndResize,
    draggable: {
      enabled: true,
      ignoreContentClass: 'panel-container',
      ignoreContent: true,
      dragHandleClass: 'panel-header',
    },
    scrollToNewItems: true,
    disableWarnings: true,
    keepFixedHeightInMobile: true,
    keepFixedWidthInMobile: true,
  };
}
