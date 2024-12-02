import 'filepond';

declare module 'filepond' {
  export interface FilePondOptions {
    /** 用于下载按钮的标签 */
    labelButtonDownloadItem?: string;

    /** 允许通过url下载 */
    allowDownloadByUrl?: boolean;
  }
}
