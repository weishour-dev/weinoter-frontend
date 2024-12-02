import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, OnDestroy } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, animationFrameScheduler, debounceTime, fromEvent, observeOn } from 'rxjs';

@UntilDestroy()
@Directive({
  standalone: true,
})
export class AutoResize extends Subject<void> implements AfterViewInit, OnDestroy {
  width = 0;
  height = 0;

  /**
   * 构造函数
   */
  constructor(
    private eleRef: ElementRef,
    protected cdRef: ChangeDetectorRef,
  ) {
    super();
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  ngAfterViewInit(): void {
    this.updateDomSize();
    this.resizeLintener();

    // 在页面初始化时手动触发一次 resize 事件
    window.dispatchEvent(new Event('resize'));
  }

  ngOnDestroy(): void {
    this.next();
    this.complete();
  }

  onResize() {}

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  private resizeLintener() {
    fromEvent(window, 'resize')
      .pipe(untilDestroyed(this), debounceTime(100), observeOn(animationFrameScheduler))
      .subscribe(this.updateDomSize);
  }

  private updateDomSize = () => {
    const { clientWidth = 0, clientHeight = 0 } = this.eleRef.nativeElement || {};
    if (!this.eleRef) {
      console.warn('Failed to get dom node, component rendering may be abnormal!');
    } else if (!clientWidth || !clientHeight) {
      console.warn('Component width or height is 0px, rendering abnormality may occur!');
    }
    this.width = clientWidth;
    this.height = clientHeight;
    if (this.onResize && typeof this.onResize === 'function') this.onResize();
    this.cdRef.detectChanges();
  };
}
