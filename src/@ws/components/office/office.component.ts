import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import loadScript from '@ws/components/office/load-script';
import { IConfig } from '@ws/components/office/office.types';
import { cloneDeep } from 'lodash';

declare global {
  interface Window {
    DocsAPI?: any;
    DocEditor?: any;
  }
}

@Component({
  selector: 'ws-office',
  template: `<div [id]="id"></div>`,
  standalone: true,
})
export class WsOfficeComponent implements OnInit, OnChanges, OnDestroy {
  @Input() id: string;
  @Input() documentServerUrl: string;
  @Input() config: IConfig;

  @Input() document_fileType?: string;
  @Input() document_title?: string;
  @Input() documentType?: 'word' | 'cell' | 'slide' | 'pdf';
  @Input() editorConfig_lang?: string;
  @Input() height?: string;
  @Input() type?: 'desktop' | 'mobile' | 'embedded';
  @Input() width?: string;

  @Input() onLoadComponentError?: (errorCode: number, errorDescription: string) => void;

  @Input() events_onAppReady?: (event: object) => void;
  @Input() events_onDocumentStateChange?: (event: object) => void;
  @Input() events_onMetaChange?: (event: object) => void;
  @Input() events_onDocumentReady?: (event: object) => void;
  @Input() events_onInfo?: (event: object) => void;
  @Input() events_onWarning?: (event: object) => void;
  @Input() events_onError?: (event: object) => void;
  @Input() events_onRequestSharingSettings?: (event: object) => void;
  @Input() events_onRequestRename?: (event: object) => void;
  @Input() events_onMakeActionLink?: (event: object) => void;
  @Input() events_onRequestInsertImage?: (event: object) => void;
  @Input() events_onRequestSaveAs?: (event: object) => void;
  /**
   * @deprecated Deprecated since version 7.5, please use events_onRequestSelectSpreadsheet instead.
   */
  @Input() events_onRequestMailMergeRecipients?: (event: object) => void;
  /**
   * @deprecated Deprecated since version 7.5, please use events_onRequestSelectDocument instead.
   */
  @Input() events_onRequestCompareFile?: (event: object) => void;
  @Input() events_onRequestEditRights?: (event: object) => void;
  @Input() events_onRequestHistory?: (event: object) => void;
  @Input() events_onRequestHistoryClose?: (event: object) => void;
  @Input() events_onRequestHistoryData?: (event: object) => void;
  @Input() events_onRequestRestore?: (event: object) => void;
  @Input() events_onRequestSelectSpreadsheet?: (event: object) => void;
  @Input() events_onRequestSelectDocument?: (event: object) => void;
  @Input() events_onRequestUsers?: (event: object) => void;

  isFirstOnChanges: boolean = true;

  constructor(public elementRef: ElementRef) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    let url = this.documentServerUrl;
    if (!url.endsWith('/')) url += '/';

    const docApiUrl = `${url}web-apps/apps/api/documents/api.js`;
    loadScript(docApiUrl, 'onlyoffice-api-script')
      .then(() => this.onInit())
      .catch(err => {
        this.onError(-2);
      });
  }

  /**
   * 绑定输入改变
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges) {
    const listNameChanges = [
      'config',
      'document_fileType',
      'document_title',
      'documentType',
      'editorConfig_lang',
      'height',
      'type',
      'width',
    ];

    if (this.isFirstOnChanges) {
      this.isFirstOnChanges = false;
      return;
    }

    for (const name of listNameChanges) {
      if (changes.hasOwnProperty(name)) {
        if (window?.DocEditor?.instances[this.id]) {
          window.DocEditor.instances[this.id].destroyEditor();
          window.DocEditor.instances[this.id] = undefined;

          console.log('Important props have been changed. Load new Editor.');
          this.onLoad();
          return;
        }
      }
    }
  }

  /**
   * 组件销毁
   */
  ngOnDestroy() {
    if (window?.DocEditor?.instances[this.id]) {
      window.DocEditor.instances[this.id].destroyEditor();
      window.DocEditor.instances[this.id] = undefined;
    }
  }

  onInit = () => {
    if (!window.DocsAPI) this.onError(-3);
    if (window?.DocEditor?.instances[this.id]) {
      console.log('Skip loading. Instance already exists', this.id);
      return;
    }

    if (!window?.DocEditor?.instances) {
      window.DocEditor = { instances: {} };
    }
  };

  onLoad = () => {
    try {
      this.onInit();

      const cloneConfig = cloneDeep(this.config);

      const propsConfig = Object.assign({
        document: {
          fileType: this.document_fileType,
          title: this.document_title,
        },
        documentType: this.documentType,
        editorConfig: {
          lang: this.editorConfig_lang,
        },
        events: {
          onAppReady: this.onAppReady,
          onDocumentStateChange: this.events_onDocumentStateChange,
          onMetaChange: this.events_onMetaChange,
          onDocumentReady: this.events_onDocumentReady,
          onInfo: this.events_onInfo,
          onWarning: this.events_onWarning,
          onError: this.events_onError,
          onRequestSharingSettings: this.events_onRequestSharingSettings,
          onRequestRename: this.events_onRequestRename,
          onMakeActionLink: this.events_onMakeActionLink,
          onRequestInsertImage: this.events_onRequestInsertImage,
          onRequestSaveAs: this.events_onRequestSaveAs,
          onRequestMailMergeRecipients: this.events_onRequestMailMergeRecipients,
          onRequestCompareFile: this.events_onRequestCompareFile,
          onRequestEditRights: this.events_onRequestEditRights,
          onRequestHistory: this.events_onRequestHistory,
          onRequestHistoryClose: this.events_onRequestHistoryClose,
          onRequestHistoryData: this.events_onRequestHistoryData,
          onRequestRestore: this.events_onRequestRestore,
          onRequestSelectSpreadsheet: this.events_onRequestSelectSpreadsheet,
          onRequestSelectDocument: this.events_onRequestSelectDocument,
          onRequestUsers: this.events_onRequestUsers,
        },
        height: this.height,
        type: this.type,
        width: this.width,
      });

      const document = this.getDocument();
      const editorConfig = this.getEditorConfig();

      if (document !== null) propsConfig.document = document;
      if (editorConfig !== null) propsConfig.editorConfig = editorConfig;

      const initConfig = Object.assign(propsConfig, cloneConfig || {});

      const editor = window.DocsAPI.DocEditor(this.id, initConfig);
      window.DocEditor.instances[this.id] = editor;
    } catch (err: any) {
      console.error(err);
      this.onError(-1);
    }
  };

  private getDocument = () => {
    let document: any = null;

    if (this.document_fileType) {
      document = document || {};
      document.fileType = this.document_fileType;
    }

    if (this.document_title) {
      document = document || {};
      document.document_title = this.document_title;
    }

    return document;
  };

  private getEditorConfig = () => {
    let editorConfig: any = null;

    if (this.editorConfig_lang) {
      editorConfig = editorConfig || {};
      editorConfig.lang = this.editorConfig_lang;
    }

    return editorConfig;
  };

  private onError = (errorCode: number) => {
    let message: string;

    switch (errorCode) {
      case -2:
        message = '加载DocsAPI时出错，请检查服务地址是否可以访问';
        break;
      case -3:
        message = 'DocsAPI未定义';
        break;
      default:
        message = '加载组件时出现未知错误';
        errorCode = -1;
    }

    if (typeof this.onLoadComponentError == 'undefined') {
      console.warn(message);
    } else {
      this.onLoadComponentError(errorCode, message);
    }
  };

  private onAppReady() {
    this.events_onAppReady!(window.DocEditor.instances[this.id]);
  }
}
