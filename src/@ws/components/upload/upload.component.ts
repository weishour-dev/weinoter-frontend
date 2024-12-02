import { DOCUMENT, NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Fancybox } from '@fancyapps/ui';
import { userSlideType } from '@fancyapps/ui/types/Carousel/types';
import { OptionsType } from '@fancyapps/ui/types/Fancybox/options';
import { select } from '@syncfusion/ej2-base';
import { IConfig, WsOfficeComponent, WsOfficeViewComponent } from '@ws/components/office';
import {
  compressorConfig,
  en_US,
  filePondAttachmentConfig,
  filePondConfig,
  officeConfig,
  officeDialogConfig,
  WsUploadType,
  zh_CN,
} from '@ws/components/upload';
import { WsFilePondModule } from '@ws/modules';
import { WsConfigService } from '@ws/services/config';
import { WsMessageService } from '@ws/services/message';
import { StorageService } from '@ws/services/storage';
import { AuthService } from 'app/core/auth';
import { fancyboxConfig, WsConfig } from 'app/core/config';
import { UsersService } from 'app/core/systems/users';
import Compressor from 'compressorjs';
import { environment } from 'environments/environment';
import { FilePond, FilePondErrorDescription, FilePondFile, FilePondOptions, FileStatus } from 'filepond';
import { filter, findIndex, isEmpty, isNull, isUndefined, merge } from 'lodash-es';
import { DialogService, IDialogOptions, ModalModule } from 'ng-devui/modal';

@Component({
  selector: 'ws-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgClass, WsFilePondModule, ModalModule, WsOfficeComponent],
})
export class WsUploadComponent implements OnInit, AfterViewInit, OnDestroy {
  /** 上传类型 */
  @Input() type: WsUploadType = 'avatar';

  /** 上传输入字段名称 */
  @Input() name = 'file';

  /** 上传根元素的样式 */
  @Input() class = '';

  /** 是否显示删除按钮 */
  @Input() allowRemove = true;

  /** 是否启用裁剪形状 */
  @Input() cropEnableSelectPreset = false;

  /** 单据对应实体名称 */
  @Input() entity = '';

  /** 单据对应id */
  @Input() orderId: string | number;

  /** 实例已创建并准备就绪事件 */
  @Output() readonly oninit: EventEmitter<void> = new EventEmitter<void>();

  /** 文件已被删除事件 */
  @Output() readonly onremovefile: EventEmitter<FilePondFile> = new EventEmitter<FilePondFile>();

  /** 当poster更新事件 */
  @Output() readonly onposter: EventEmitter<string> = new EventEmitter<string>();

  /** 上传实体 */
  @ViewChild('filepond') filepond: FilePond;

  /** 上传设置 */
  filePondOptions = filePondConfig;

  /** 图片文件类型 */
  imagesTypes = ['png', 'jpg', 'svg'];

  /** 文档文件类型 */
  wordsTypes = ['doc', 'docx'];

  /** 表格文件类型 */
  excelsTypes = ['xls', 'xlsx'];

  /** 灯幻片文件类型 */
  powerPointsTypes = ['ppt', 'pptx'];

  /** 文档服务器地址 */
  officeApi: string;

  /** 访问文档的平台类型 */
  officeType: 'desktop' | 'mobile' | 'embedded' = 'desktop';

  /** 要打开的文档类型 */
  officeDocumentType: 'word' | 'cell' | 'slide' | 'pdf' = 'word';

  /** 文档配置 */
  officeConfig = officeConfig;

  /**
   * 构造函数
   */
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _elementRef: ElementRef,
    private _renderer2: Renderer2,
    private _authService: AuthService,
    private _usersService: UsersService,
    private _wsConfigService: WsConfigService,
    private _storageService: StorageService,
    private _wsMessageService: WsMessageService,
    private _dialogService: DialogService,
  ) {
    this.officeApi = environment.OFFICE_API;
  }

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    if (this.type === 'avatar') this.name = this.type;
    this.class = isEmpty(this.class) ? this.type : `${this.type} ${this.class}`;
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    let currentOptions: Partial<FilePondOptions> = merge({}, this.filePondOptions, {
      name: this.name,
      allowRemove: this.allowRemove,
      fileValidateTypeLabelExpectedTypes: '禁止类型 ',
      imageEditor: {
        editorOptions: {
          locale: this._wsConfigService.currentConfig.defaultLang === 'zh' ? zh_CN : en_US,
          cropEnableSelectPreset: this.cropEnableSelectPreset,
        },
      },
    });

    switch (this.type) {
      case 'avatar':
        currentOptions = merge<FilePondOptions, FilePondOptions>(currentOptions, {
          imageCropAspectRatio: '1:1',
          stylePanelLayout: 'compact circle',
          imageEditor: {
            editorOptions: {
              /** 设置方形裁剪纵横比 */
              imageCropAspectRatio: 1,
            },
          },
        });
        break;
      case 'attachment':
        currentOptions = merge<FilePondOptions, FilePondOptions>(
          currentOptions,
          merge<FilePondOptions, FilePondOptions>(filePondAttachmentConfig, {
            server: {
              headers: { Authorization: `Bearer ${this._authService.accessToken}` },
              process: {
                url: '/process',
                ondata: formData => formData,
              },
              revert: {
                url: '/revert',
                onerror: response => {
                  response = JSON.parse(response);
                  this._wsMessageService.toast('warning', response.message, { duration: 3000 });
                  return response.message;
                },
              },
              remove: (source, load, error) => {
                // 向服务器发送删除请求
                fetch(`${environment.BASE_API}files/revert`, {
                  method: 'DELETE',
                  headers: { Authorization: `Bearer ${this._authService.accessToken}` },
                  body: source,
                })
                  .then(response => {
                    if (response.ok) {
                      load();
                      this._wsMessageService.toast('success', `删除『${source}』文件成功`);
                    } else {
                      error(`删除文件失败，${response.statusText}`);
                    }
                  })
                  .catch(error => {
                    error('删除文件请求失败');
                  });
              },
            },
            /** 创建文件后对文件进行更改的挂钩 */
            imageTransformAfterCreateBlob: async (blob: Blob) => {
              return <File>await this._compressor(<File>blob, { quality: 0.8 }, true);
            },
          }),
        );

        // 自适应表单标签内容高度
        // setTimeout(() => {
        //   const formDom = closest(this._elementRef.nativeElement, 'form'); // 表单高度
        //   const height = formDom.clientHeight - 28; // 内容高度
        //   console.log(`h-[${height / 16}rem]`);
        //   const filepondDom = select('.filepond--root', this._elementRef.nativeElement);
        //   this._renderer2.setStyle(filepondDom, 'height', `${height}px`);
        // });
        break;
    }

    // 设置选项
    this.filepond['pond'].setOptions(currentOptions);

    // 实例已创建并准备就绪事件
    this.filepond['pond'].oninit = (): void => this.oninit.next();

    // 已创建文件项事件
    this.filepond['pond'].oninitfile = (filePondFile: FilePondFile): void => {};

    // 文件开始加载事件
    this.filepond['pond'].onaddfilestart = (filePondFile: FilePondFile): void => {
      if (this.type === 'avatar') return;

      // 附加文件元数据
      const filePondFiles = this.filepond.getFiles();
      const index = findIndex(filePondFiles, filePondFile);
      filePondFile.setMetadata('type', this.type); // 分类
      filePondFile.setMetadata('sort', index); // 排序
      filePondFile.setMetadata('entity', this.entity); // 单据对应实体名称
      filePondFile.setMetadata('orderId', this.orderId ?? 0); // 单据对应实体id
    };

    // 如果没有错误，则文件已成功加载事件
    this.filepond['pond'].onaddfile = (error: { main: string; sub: string }, filePondFile: FilePondFile): void => {
      if (error) {
        if (error?.main) {
          switch (error.main) {
            case '上传的文件类型无效':
              // 上传异常通知
              this._wsMessageService.notification(
                'warning',
                `『${filePondFile.filename} 』${error.main}`,
                `${error.sub} ${filePondFile.fileType}`,
                {
                  duration: 3000,
                },
              );
              break;
            case '上传文件太大':
            default:
              // 上传异常通知
              this._wsMessageService.notification('warning', `『${filePondFile.filename} 』${error.main}`, error.sub, {
                duration: 3000,
              });
              break;
          }
        }
        // 删除当前文件
        this.filepond.removeFile(filePondFile);
      }
    };

    // 文件加载进度事件
    this.filepond['pond'].onaddfileprogress = (filePondFile: FilePondFile, progress: number): void => {};

    // 文件开始上传事件
    this.filepond['pond'].onprocessfilestart = (filePondFile: FilePondFile): void => {};

    // 文件上传进度事件
    this.filepond['pond'].onprocessfileprogress = (filePondFile: FilePondFile, progress: number): void => {};

    // 文件中止上传事件
    this.filepond['pond'].onprocessfileabort = (filePondFile: FilePondFile): void => {};

    // 文件恢复上传事件
    this.filepond['pond'].onprocessfilerevert = (filePondFile: FilePondFile): void => {};

    // 如果没有错误，则文件处理已上传事件
    this.filepond['pond'].onprocessfile = (error: FilePondErrorDescription, filePondFile: FilePondFile): void => {
      if (error && error?.body && error.type === 'error') {
        // 上传错误通知
        this._wsMessageService.notification('error', `『${filePondFile.filename} 』上传失败`, error.body);
      }
    };

    // 当列表中的所有文件都已上传完毕事件
    this.filepond['pond'].onprocessfiles = (): void => {};

    // 文件已删除事件
    this.filepond['pond'].onremovefile = (error: FilePondErrorDescription, filePondFile: FilePondFile): void => {
      this._dropLabelHandle(false);
      if (isNull(error)) this.onremovefile.next(filePondFile);
    };

    // 文件已被转换插件处理事件
    this.filepond['pond'].onpreparefile = (filePondFile: FilePondFile, output: Blob): void => {};

    // 文件已添加或删除事件
    this.filepond['pond'].onupdatefiles = (filePondFiles: FilePondFile[]): void => {};

    // 单击或点击文件事件
    this.filepond['pond'].onactivatefile = async (filePondFile: FilePondFile): Promise<void> => {
      if (this.type === 'avatar') return;

      // 幻灯片配置
      const userSlides: userSlideType[] = [];

      if (
        [...this.imagesTypes, ...this.wordsTypes, ...this.excelsTypes, ...this.powerPointsTypes, 'pdf'].includes(
          filePondFile.fileExtension,
        )
      ) {
        let filePondFiles = this.filepond.getFiles();

        if (
          !this.imagesTypes.includes(filePondFile.fileExtension) &&
          filePondFile.status !== FileStatus.PROCESSING_COMPLETE
        ) {
          this._wsMessageService.toast(
            'warning',
            isUndefined(window.DocEditor) ? '文档服务未启动，预览失败' : '此文档还未上传，预览失败',
            { duration: 3000 },
          );
          return;
        }

        // 对不同类型文件进行分组
        switch (filePondFile.fileExtension) {
          // 图片处理
          case 'png':
          case 'jpg':
          case 'svg':
            filePondFiles = filter(filePondFiles, item => this.imagesTypes.includes(item.fileExtension));
            break;
          // Word处理
          case 'doc':
          case 'docx':
            filePondFiles = filter(
              filePondFiles,
              item => this.wordsTypes.includes(item.fileExtension) && item.id === filePondFile.id,
            );
            break;
          // Excel处理
          case 'xls':
          case 'xlsx':
            filePondFiles = filter(
              filePondFiles,
              item => this.excelsTypes.includes(item.fileExtension) && item.id === filePondFile.id,
            );
            break;
          // PowerPoint处理
          case 'ppt':
          case 'pptx':
            filePondFiles = filter(
              filePondFiles,
              item => this.powerPointsTypes.includes(item.fileExtension) && item.id === filePondFile.id,
            );
            break;
          // PDF处理
          case 'pdf':
            filePondFiles = filter(
              filePondFiles,
              item => ['pdf'].includes(item.fileExtension) && item.id === filePondFile.id,
            );
            break;
        }

        // 开始时活动幻灯片的索引
        for (const filePondFile of filePondFiles) {
          const file = <File>filePondFile.file;

          switch (filePondFile.fileExtension) {
            // 图片处理
            case 'png':
            case 'jpg':
            case 'svg':
              const dataURL = await this._fileToDataURL(file);
              userSlides.push({
                type: 'image',
                src: dataURL,
                thumb: dataURL,
                caption: filePondFile.filenameWithoutExtension,
              });
              break;
            // Word处理
            case 'doc':
            case 'docx':
              this.officeDocumentType = 'word';
              this.officeConfig = this._officeConfig(filePondFile);
              break;
            // Excel处理
            case 'xls':
            case 'xlsx':
              this.officeDocumentType = 'cell';
              this.officeConfig = this._officeConfig(filePondFile);
              break;
            // PowerPoint处理
            case 'ppt':
            case 'pptx':
              this.officeDocumentType = 'slide';
              this.officeConfig = this._officeConfig(filePondFile);
              break;
            // PDF处理
            case 'pdf':
              this.officeDocumentType = 'pdf';
              this.officeConfig = this._officeConfig(filePondFile);
              break;
          }
        }

        if (userSlides.length > 0) {
          // fancybox程序化
          const fancybox = new Fancybox(
            userSlides,
            merge(fancyboxConfig, { startIndex: findIndex(filePondFiles, filePondFile) } as Partial<OptionsType>),
          );
        } else {
          if (isUndefined(window.DocEditor)) {
            this._wsMessageService.toast('warning', `文档服务未启动，预览失败`, { duration: 3000 });
          } else {
            if (
              [...this.wordsTypes, ...this.excelsTypes, ...this.powerPointsTypes, 'pdf'].includes(
                filePondFile.fileExtension,
              )
            ) {
              const dialog = this._dialogService.open(
                merge<IDialogOptions, IDialogOptions>(officeDialogConfig, {
                  content: WsOfficeViewComponent,
                  data: {
                    type: this.officeType,
                    documentType: this.officeDocumentType,
                    config: this.officeConfig,
                  },
                  buttons: [],
                }),
              );
            }
          }
        }
      }
    };

    // 即将添加此文件事件
    this.filepond['pond'].beforeAddFile = (filePondFile: FilePondFile) => {
      this._dropLabelHandle(true);
    };

    // 即将删除此文件事件
    this.filepond['pond'].beforeRemoveFile = (filePondFile: FilePondFile) => {};

    // 当poster更新事件
    this._document.addEventListener('FilePond:poster', async (event: CustomEvent) => {
      const { dest } = event.detail;
      const dataURL = await this._fileToDataURL(dest);

      // 执行可观察对象
      this.onposter.next(dataURL);
    });

    // 设置压缩器默认配置
    Compressor.setDefaults(compressorConfig);
  }

  /**
   * 组件销毁
   */
  ngOnDestroy(): void {
    Fancybox.unbind(this._elementRef.nativeElement);
    Fancybox.close();
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 默认标签处理
   *
   * @param isAdd
   */
  private _dropLabelHandle(isAdd: boolean): void {
    if (this.type === 'avatar') return;

    const dropLabelDom = select('.filepond--drop-label', this._elementRef.nativeElement);
    const files = this.filepond.getFiles();

    if (isAdd) {
      if (files.length > 0) this._renderer2.setStyle(dropLabelDom, 'height', 'unset');
    } else {
      if (files.length === 0) this._renderer2.setStyle(dropLabelDom, 'height', '100%');
    }
  }

  /**
   * File转Base64 DataURL
   *
   * @param file
   */
  private _fileToDataURL = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * 图片压缩处理
   *
   * @param file
   */
  private _compressor = async (file: File, options?: Compressor.Options, isFile = false): Promise<string | File> => {
    return new Promise((resolve, reject) => {
      const fileToDataURL = this._fileToDataURL;
      new Compressor(file, {
        ...options,
        async success(result: File) {
          const dataURL = await fileToDataURL(result as File);
          resolve(isFile ? result : dataURL);
        },
        error(error: Error) {
          reject(error);
        },
      });
    });
  };

  /**
   * 文档配置处理
   *
   * @param filePondFile
   */
  private _officeConfig = (filePondFile: FilePondFile): IConfig => {
    const isDark = this._storageService.get<WsConfig>('ws-config').isDark;
    const maxHeight = this._document.body.offsetHeight;
    const height = maxHeight - 46 - 20 * 2 - 20;

    return merge<IConfig, IConfig>(this.officeConfig, {
      height: `${height}px`,
      document: {
        key: filePondFile.serverId,
        fileType: filePondFile.fileExtension,
        title: filePondFile.filenameWithoutExtension,
        url: `${environment.BASE_API}files/${filePondFile.serverId}`,
      },
      editorConfig: {
        customization: {
          uiTheme: isDark ? 'theme-dark' : 'theme-light',
          zoom: ['pdf'].includes(filePondFile.fileExtension) ? -1 : 100,
        },
        user: {
          group: 'ws',
          name: this._usersService.currentUser.username,
        },
      },
    });
  };
}
