import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, DOCUMENT, NgClass, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WsScrollbarDirective } from '@ws/directives/scrollbar';
import type { SafeAny } from '@ws/types';
import { Chat, QuickChatService } from 'app/layout/common/quick-chat';

@UntilDestroy()
@Component({
  selector: 'quick-chat',
  templateUrl: './quick-chat.component.html',
  styleUrls: ['./quick-chat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'quickChat',
  standalone: true,
  imports: [
    NgClass,
    NgTemplateOutlet,
    DatePipe,
    TextFieldModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    WsScrollbarDirective,
  ],
})
export class QuickChatComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('messageInput') messageInput: ElementRef;
  chat: Chat;
  chats: Chat[];
  opened: boolean = false;
  selectedChat: Chat;

  private _mutationObserver: MutationObserver;
  private _scrollStrategy: ScrollStrategy = this._scrollStrategyOptions.block();
  private _overlay: HTMLElement;

  /**
   * 构造函数
   */
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _elementRef: ElementRef,
    private _renderer2: Renderer2,
    private _ngZone: NgZone,
    private _quickChatService: QuickChatService,
    private _scrollStrategyOptions: ScrollStrategyOptions,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 装饰方法
  // ----------------------------------------------------------------------------

  /**
   * 组件类的HostBinding
   */
  @HostBinding('class') get classList(): SafeAny {
    return {
      'quick-chat-opened': this.opened,
    };
  }

  /**
   * 调整'input'和'ngModelChange'事件的大小
   *
   * @private
   */
  @HostListener('input')
  @HostListener('ngModelChange')
  private _resizeMessageInput(): void {
    // 这并不需要触发Angular自己的变更检测
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        // 将高度设置为'auto'，这样我们就能正确读取scrollHeight
        this.messageInput.nativeElement.style.height = 'auto';

        // 获得滚动高度并减去垂直填充
        this.messageInput.nativeElement.style.height = `${this.messageInput.nativeElement.scrollHeight}px`;
      });
    });
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 单个聊天
    this._quickChatService.chat$.pipe(untilDestroyed(this)).subscribe((chat: Chat) => {
      this.chat = chat;
    });

    // 多个聊天
    this._quickChatService.chats$.pipe(untilDestroyed(this)).subscribe((chats: Chat[]) => {
      this.chats = chats;
    });

    // 删除聊天
    this._quickChatService.chat$.pipe(untilDestroyed(this)).subscribe((chat: Chat) => {
      this.selectedChat = chat;
    });
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // 针对Firefox的修复。
    // 因为'position: sticky'在'position: fixed'的父元素中不能正确工作、
    // 在html元素中添加'.cdk-global-scrollblock'会破坏导航的位置。
    // 这个问题的解决方法是从html元素中读取'top'值，并将其作为一个
    // marginTop'加入到导航本身。
    this._mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        const mutationTarget = mutation.target as HTMLElement;
        if (mutation.attributeName === 'class') {
          if (mutationTarget.classList.contains('cdk-global-scrollblock')) {
            const top = parseInt(mutationTarget.style.top);
            this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', `${Math.abs(top)}px`);
          } else {
            this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', null);
          }
        }
      });
    });
    this._mutationObserver.observe(this._document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  /**
   * 组件销毁
   */
  ngOnDestroy(): void {
    // 断开突变观察者
    this._mutationObserver.disconnect();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 打开面板
   */
  open(): void {
    // 如果面板已经打开，则返回
    if (this.opened) {
      return;
    }

    // 打开面板
    this._toggleOpened(true);
  }

  /**
   * 关闭面板
   */
  close(): void {
    // 如果面板已经关闭，则返回
    if (!this.opened) {
      return;
    }

    // 关闭面板
    this._toggleOpened(false);
  }

  /**
   * 切换面板
   */
  toggle(): void {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * 选择聊天
   *
   * @param id
   */
  selectChat(id: string): void {
    // 打开面板
    this._toggleOpened(true);

    // 获取聊天数据
    this._quickChatService.getChatById(id).subscribe();
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 显示遮罩
   *
   * @private
   */
  private _showOverlay(): void {
    // 尝试隐藏覆盖，以防有一个已经打开
    this._hideOverlay();

    // 创建背景元素
    this._overlay = this._renderer2.createElement('div');

    // 返回如果覆盖不能创建一些原因
    if (!this._overlay) {
      return;
    }

    // 给背景元素添加一个类
    this._overlay.classList.add('quick-chat-overlay');

    // 将背景添加到面板的父元素
    this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._overlay);

    // 启用块滚动策略
    this._scrollStrategy.enable();

    // 添加一个事件监听器到覆盖
    this._overlay.addEventListener('click', () => {
      this.close();
    });
  }

  /**
   * 隐藏遮罩
   *
   * @private
   */
  private _hideOverlay(): void {
    if (!this._overlay) {
      return;
    }

    // 如果遮罩仍然存在……
    if (this._overlay) {
      // 删除遮罩
      this._overlay.parentNode.removeChild(this._overlay);
      this._overlay = null;
    }

    // 禁用块滚动策略
    this._scrollStrategy.disable();
  }

  /**
   * 打开关闭面板
   *
   * @param open
   * @private
   */
  private _toggleOpened(open: boolean): void {
    // 设置打开
    this.opened = open;

    // 如果面板打开，显示遮罩
    if (open) {
      this._showOverlay();
    }
    // 否则，隐藏遮罩
    else {
      this._hideOverlay();
    }
  }
}
