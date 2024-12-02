import { NgOptimizedImage } from '@angular/common';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ImagePlaceholder } from '@ws/constants/image';

@Component({
  selector: 'ws-image',
  templateUrl: './image.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [NgOptimizedImage],
})
export class WsImageComponent {
  /** 图片数据 */
  imagePlaceholder = ImagePlaceholder;

  /** 图片路径 */
  @Input() src: string = '';

  /** 图片名称 */
  @Input() alt: string = '';

  /** 图片宽度 */
  @Input() width: number = 1;

  /** 图片高度 */
  @Input() height: number = 1;
}
