import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { Doc } from '@blocksuite/store';
import { wsAnimations } from '@ws/animations';
import { Subscription } from 'rxjs';
import { EditorProviderService } from './editor-provider.service';

@Component({
  selector: 'basedata-demo',
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: wsAnimations,
  standalone: true,
  imports: [MatRippleModule, MatIconModule, MatButtonModule, MatDividerModule],
})
export class BasedataDemoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorContainerRef', { static: true }) editorContainerRef!: ElementRef;

  docs: Doc[] = [];
  private subscription = new Subscription();

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    public editorProvider: EditorProviderService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    this.subscription.add(
      this.editorProvider.docUpdated$.subscribe(docs => {
        this.docs = docs;
        this._changeDetectorRef.detectChanges();
      }),
    );
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit() {
    const editor = this.editorProvider.getEditor();
    if (this.editorContainerRef.nativeElement && editor) {
      this.editorContainerRef.nativeElement.appendChild(editor);
    }

    const collection = this.editorProvider.getCollection();
    const docs = [...collection.docs.values()].map(blocks => blocks.getDoc());
    this.docs = docs;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * 组件销毁
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  selectDoc(doc: Doc) {
    const editor = this.editorProvider.getEditor();
    editor.doc = doc;
  }
}
