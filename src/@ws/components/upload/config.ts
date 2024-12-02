import { IConfig } from '@ws/components/office';
import { zh_CN } from '@ws/components/upload/zh';
import { HeroiconsOutlineCamera, HeroiconsOutlineUpload } from '@ws/constants';
import {
  createDefaultImageOrienter,
  createDefaultImageReader,
  createDefaultImageWriter,
  getEditorDefaults,
  openEditor,
  processImage,
} from 'assets/js/pintura/pintura.min.js';
import Compressor from 'compressorjs';
import { environment } from 'environments/environment';
import { FilePondOptions } from 'filepond';
import { IDialogOptions } from 'ng-devui/modal';

/**
 * filepond全局配置
 */
export const filePondConfig: Partial<FilePondOptions> = {
  /** 立即将新文件上传到服务器 */
  instantUpload: false,
  /** 默认标签显示 */
  labelIdle: HeroiconsOutlineCamera,
  /** 当字段包含无效文件并由父表单验证时显示的标签 */
  labelInvalidField: '字段包含无效文件',
  /** 等待文件大小信息时使用的标签 */
  labelFileWaitingForSize: '正在等待大小',
  /** 未收到文件大小信息时使用的标签 */
  labelFileSizeNotAvailable: '尺寸不可用',
  /** 加载文件时使用的标签 */
  labelFileLoading: '加载中',
  /** 文件加载失败时使用的标签 */
  labelFileLoadError: '加载过程中出错',
  /** 上传文件时使用的标签 */
  labelFileProcessing: '上传中',
  /** 文件上传完成时使用的标签 */
  labelFileProcessingComplete: '上传已完成',
  /** 取消上传时使用的标签 */
  labelFileProcessingAborted: '上传已取消',
  /** 文件上传过程中出现问题时使用的标签 */
  labelFileProcessingError: '上传过程中出错',
  /** 恢复文件上传过程中出现问题时使用的标签 */
  labelFileProcessingRevertError: '恢复过程中出错',
  /** 用于指示删除文件时出现问题的标签 */
  labelFileRemoveError: '删除过程中出错',
  /** 用于向用户指示可以取消操作的标签 */
  labelTapToCancel: '点击取消',
  /** 用于向用户指示可以重试操作的标签 */
  labelTapToRetry: '点击重试',
  /** 用于向用户指示可以撤消操作的标签 */
  labelTapToUndo: '点击删除',
  /** 用于删除按钮的标签 */
  labelButtonRemoveItem: '删除',
  /** 用于中止加载按钮的标签 */
  labelButtonAbortItemLoad: '中止加载',
  /** 用于重试加载按钮的标签 */
  labelButtonRetryItemLoad: '重试加载',
  /** 用于中止上传按钮的标签 */
  labelButtonAbortItemProcessing: '中止上传',
  /** 用于撤消上传按钮的标签 */
  labelButtonUndoItemProcessing: '撤消上传',
  /** 用于重试上传按钮的标签 */
  labelButtonRetryItemProcessing: '重试上传',
  /** 用于上传按钮的标签 */
  labelButtonProcessItem: '上传',
  /** 用于下载按钮的标签 */
  labelButtonDownloadItem: '下载',
  /** 固定图像预览高度，覆盖最小和最大预览高度 */
  imagePreviewHeight: 44,
  /** 图像预览透明度指示器 */
  imagePreviewTransparencyIndicator: 'grid',
  /** 加载指示器的位置 */
  styleLoadIndicatorPosition: 'center bottom',
  /** 进度指示器的位置 */
  styleProgressIndicatorPosition: 'left bottom',
  /** 删除按钮的位置 */
  styleButtonRemoveItemPosition: 'right bottom',
  /** 项目处理按钮的位置 */
  styleButtonProcessItemPosition: 'left bottom',
  /** 点击添加文件位置 */
  itemInsertLocation: 'after',
  /** 用于计算文件大小的基值 */
  fileSizeBase: 1024,
  /** 页脚信息 */
  credits: false,
  /** 服务接口配置 */
  server: {
    process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
      progress(true, file.size, file.size);
    },
  },
  /** 最大文件大小 */
  maxFileSize: '3MB',
  /** 超出最大文件大小标签 */
  labelMaxFileSizeExceeded: '上传文件太大',
  /** 最大文件大小标签 */
  labelMaxFileSize: '允许上传最大文件大小为{filesize}',
  /** 接受的文件类型 */
  acceptedFileTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
  /** 不允许的标签文件类型 */
  labelFileTypeNotAllowed: '上传的文件类型无效',
  /** 文件验证类型标签预期类型 */
  fileValidateTypeLabelExpectedTypes: '允许类型 {allTypes}',
  /** 文件验证类型标签预期类型映射 */
  fileValidateTypeLabelExpectedTypesMap: {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/svg+xml': 'svg',
  },
  /** 设置为 false 将图像 exif 数据复制到输出 */
  imageTransformOutputStripImageHead: false,
  /** 启用或禁用添加多个文件 */
  allowMultiple: false,
  /** 启用或禁用进程按钮 */
  allowProcess: false,
  /** 启用或禁用图片预览 */
  allowImagePreview: false,
  /** 启用或禁用图像变换 */
  allowImageTransform: true,
  /** 启用或禁用图像调整大小 */
  allowImageResize: true,
  /** 启用或禁用图像裁剪 */
  allowImageCrop: true,
  /** 启用或禁用 exif 方向读取 */
  allowImageExifOrientation: true,
  /** 启用或禁用文件海报 */
  allowFilePoster: true,
  /** 启用或禁用图像编辑器插件 */
  allowImageEditor: true,
  /** 图像添加到 FilePond 时编辑器将立即打开 */
  imageEditorInstantEdit: false,
  /** 启用或禁用此 FilePond 实例的图像编辑 */
  imageEditorAllowEdit: true,
  /** FilePond图像编辑器插件属性 */
  imageEditor: {
    /** 用于创建编辑器（必需） */
    createEditor: openEditor,
    /** 用于读取图像数据、获取元数据信息 */
    imageReader: [createDefaultImageReader],
    /** 这将接收文件、元数据和imageState并生成输出图像 */
    imageWriter: [createDefaultImageWriter],
    /** 这在较旧的浏览器上是需要的，以正确定位JPEG */
    imageOrienter: [createDefaultImageOrienter],
    /** 用于创建海报和输出图像，运行一个不可见的“无头”编辑器实例 */
    imageProcessor: processImage,
    /** Pintura图像编辑器选项 */
    editorOptions: {
      /** 传递编辑器默认配置选项 */
      ...getEditorDefaults(),
      /** 本地化 */
      locale: zh_CN,
      /** 启用的实用程序及其在菜单中的顺序 */
      utils: ['crop', 'filter', 'finetune', 'annotate', 'decorate', 'sticker', 'frame', 'redact', 'resize'],
      /** 编辑器布局的方向偏好，当编辑器根处于纵向长宽比时，'auto'编辑器会自动将其设置为横向长宽比。 'vertical''horizontal' */
      layoutDirectionPreference: 'auto',
      /** 实用程序菜单的水平位置，设置为'left'或'right'将主导航移动到图像的那一侧 */
      layoutHorizontalUtilsPreference: 'left',
      /** 实用程序菜单的垂直位置，设置为'bottom'或'top'将主导航移动到图像的该侧。不会影响菜单始终位于底部的移动演示 */
      layoutVerticalUtilsPreference: 'bottom',
      /** 工具栏菜单的垂直位置，设置为'bottom'或'top'将工具栏移动到图像的那一侧 */
      layoutVerticalToolbarPreference: 'top',
      /** 实用程序控件的垂直位置，设置为'top'在图像顶部而不是下面显示控件 */
      layoutVerticalControlGroupsPreference: 'bottom',
      /** util 控件选项卡的位置，设置为'top'在控件上方而不是下方显示选项卡 */
      layoutVerticalControlTabsPreference: 'bottom',
      /** UI 控件上的文本方向，设置为'rtl'从右向左切换文本 */
      textDirection: 'ltr',
      /** 设置为true固定 MacOS 上的滚动方向，默认情况下滚动方向是反向的 */
      fixScrollDirection: false,
      /** 控制是否以及何时显示动画 */
      animations: 'auto',
      /** 设置为true禁用与编辑器的任何交互 */
      disabled: false,
      /** 控制界面的弹力 */
      elasticityMultiplier: 10,
      /** 是否应该放大图像预览以适应编辑器阶段 */
      previewUpscale: true,
      /** 当框架渲染在图像边界之外时，图像预览是否应该在图像周围添加填充 */
      previewPad: true,
      /** 当在图像边界之外渲染时，应用于帧的叠加层的不透明度 */
      previewMaskOpacity: 0.95,
      /** 设置false为默认启用音频 */
      muteAudio: true,
      /** 当设置为true在图像后面渲染网格以显示透明区域时 */
      enableTransparencyGrid: true,
      /** 设置true为使画布透明 */
      enableCanvasAlpha: true,
      /** 设置false为禁用工具栏 */
      enableToolbar: true,
      /** 设置false为禁用 util 选项卡 */
      enableUtils: true,
      /** 设置true为显示关闭按钮，true使用时自动设置为openModal */
      enableButtonClose: true,
      /** 设置false为禁用导出按钮 */
      enableButtonExport: true,
      /** 设置false为禁用历史恢复按钮 */
      enableButtonRevert: true,
      /** 设置false为禁用撤消和重做按钮 */
      enableNavigateHistory: true,
      /** 设置为true允许通过将新图像拖放到编辑器上来加载新图像 */
      enableDropImage: true,
      /** 设置true为允许粘贴新图像。如果粘贴的图像至少有 75% 可见，编辑器将接受该图像 */
      enablePasteImage: true,
      /** 设置为true允许在编辑器处于“等待图像”状态时单击编辑器浏览图像 */
      enableBrowseImage: true,
      /** 设置为false禁用平移图像 */
      enablePan: true,
      /** 设置false为禁用图像缩放 */
      enableZoom: true,
      /** 设置false为禁用缩放控制 */
      enableZoomControls: true,
      /** 按下变焦按钮增加或减少变焦的速度 */
      zoomAdjustStep: 0.25,
      /** 按住变焦按钮时用于增加或减少变焦速度的系数。增加速度为1 + .1，减少速度为1 - .1 */
      zoomAdjustFactor: 0.1,
      /** 放大时 UI 控件后面渲染的覆盖层的最大不透明度 */
      zoomMaskOpacity: 0.85,
      /** 在图像预览中插入形状或调整形状 */
      willRenderCanvas: (shapes, state) => {
        const { utilVisibility, selectionRect, backgroundColor, lineColor } = state;
        // 如果裁剪实用程序不可见，则退出
        if (utilVisibility.crop <= 0) return shapes;
        // 选择矩形的快捷方式
        const { x, y, width, height } = selectionRect;
        // 返回更新的形状
        return {
          // 复制其他形状列表
          ...shapes,

          // 添加“圆形”形状
          interfaceShapes: [
            {
              x: x + width * 0.5,
              y: y + height * 0.5,
              rx: width * 0.5,
              ry: height * 0.5,
              opacity: state.opacity,
              inverted: true,
              backgroundColor: [...backgroundColor, 0.5],
              strokeWidth: 1,
              strokeColor: [...lineColor],
            },
            ...shapes.interfaceShapes,
          ],
        };
      },
      // ---------------------------------------------------------------------------------------------------------------
      // @ 裁剪插件配置
      // ---------------------------------------------------------------------------------------------------------------
      /** 调整裁剪区域外部蒙版的不透明度 */
      cropMaskOpacity: 0.85,
      /** 裁剪预设列表 */
      cropSelectPresetOptions: [
        [
          '默认',
          [
            [undefined, '自定义'],
            [1, '1:1'],
          ],
        ],
        [
          '桌面端',
          [
            [2 / 1, '2:1'],
            [3 / 2, '3:2'],
            [4 / 3, '4:3'],
            [5 / 4, '5:4'],
            [16 / 9, '16:9'],
            [16 / 10, '16:10'],
          ],
        ],
        [
          '移动端',
          [
            [1 / 2, '1:2'],
            [2 / 3, '2:3'],
            [3 / 4, '3:4'],
            [4 / 5, '4:5'],
            [9 / 16, '9:16'],
            [10 / 16, '10:16'],
          ],
        ],
      ],
      /** 应用于裁剪预设列表的方向过滤器。设置'landscape'为启用预设下拉列表中的方向选项卡并显示横向纵横比 */
      cropSelectPresetFilter: false,
      /** 更改预设滤镜时自动切换裁剪纵横比 */
      cropEnableFilterMatchAspectRatio: true,
      /** 确定裁剪选择角的样式，'circle'、'hook'或'invisible'，默认为'circle' */
      cropImageSelectionCornerStyle: 'hook',
      /** 切换水平翻转按钮 */
      cropEnableButtonFlipHorizontal: true,
      /** 切换垂直翻转按钮 */
      cropEnableButtonFlipVertical: true,
      /** 切换向左旋转按钮 */
      cropEnableButtonRotateLeft: true,
      /** 切换向右旋转按钮 */
      cropEnableButtonRotateRight: true,
      /** 切换裁剪限制按钮 */
      cropEnableButtonToggleCropLimit: true,
      /** 启用或禁用作物选择控件 */
      cropEnableImageSelection: true,
      /** 显示图像尺寸指示器 */
      cropEnableInfoIndicator: true,
      /** 仅当鼠标位于作物选择范围内时捕获鼠标滚轮交互 */
      cropEnableLimitWheelInputToCropSelection: true,
      /** 打开和关闭图像旋转输入 */
      cropEnableRotationInput: true,
      /** 如果已定义裁剪预设，则会在工具栏中显示预设下拉列表 */
      cropEnableSelectPreset: false,
      /** 启用图像的通用缩放。如果设置为false所有与缩放相关的输入将被禁用 */
      cropEnableZoom: true,
      /** 启用裁剪工具底部的缩放输入控件。如果没有足够的垂直空间，该控件将自动隐藏 */
      cropEnableZoomInput: true,
      /** 设置为时，true缩放控件会自动隐藏，以保留垂直空间较低的布局中的空间 */
      cropEnableZoomAutoHide: true,
      /** 设置'zoom'为激活缩放工具而不是旋转工具 */
      cropActiveTransformTool: 'rotation',
      /** 缩小时会自动调整裁剪纵横比，仅当纵横比设置为undefined */
      cropEnableZoomMatchImageAspectRatio: true,
      /** 'custom'如果设置为、 或 ，将自动随图像旋转裁剪矩形'always' */
      cropEnableRotateMatchImageAspectRatio: 'never',
      /** 将放大到剪裁内的鼠标位置 */
      cropEnableZoomTowardsWheelPosition: true,
      /** 打开和关闭中心选择按钮 */
      cropEnableCenterImageSelection: true,
      /** 设置为'always'强制将工具栏项传播到主工具栏，而不是显示在单独的行中 */
      cropMinimizeToolbar: 'auto',
      /** 交互的焦点默认是'image'指用户与图像交互，而不是与裁剪选择交互。更改为'selection'将图像锁定到位并与选择进行交互 */
      cropInteractionFocus: 'image',
      /** 旋转控件可以移动的负值和正值范围。默认值的Math.PI / 4范围是从-Math.PI / 4到Math.PI / 4 */
      cropRotationRange: Math.PI / 4,
      // ---------------------------------------------------------------------------------------------------------------
      // @ 贴纸插件配置
      // ---------------------------------------------------------------------------------------------------------------
      /** 在页脚贴纸栏中显示的 一系列贴纸 */
      stickers: [['表情', ['⭐️', '😊', '👍', '👎', '🌤', '🌥']]],
    },
  },
};

/**
 * filepond的附件配置
 */
export const filePondAttachmentConfig: Partial<FilePondOptions> = {
  instantUpload: false,
  labelIdle: HeroiconsOutlineUpload,
  styleLoadIndicatorPosition: 'right',
  styleProgressIndicatorPosition: 'right',
  styleButtonRemoveItemPosition: 'left',
  styleButtonProcessItemPosition: 'right',
  maxParallelUploads: 3,
  server: {
    url: `${environment.BASE_API}files`,
    process: {
      url: '/process',
      method: 'POST',
      withCredentials: false,
      onload: response => {
        response = JSON.parse(response);
        return response.serverId;
      },
      onerror: response => {
        response = JSON.parse(response);
        return response.message;
      },
    },
    revert: {
      url: '/revert',
      method: 'DELETE',
      withCredentials: false,
      onload: response => {
        response = JSON.parse(response);
        return 0;
      },
    },
    restore: {
      url: '/',
      method: 'GET',
      withCredentials: false,
      onload: response => response,
    },
    load: '/',
    fetch: '/fetch',
  },
  maxFileSize: '10MB',
  allowMultiple: true,
  allowProcess: true,
  allowReorder: false,
  allowImagePreview: true,
  allowFilePoster: false,
  allowImageEditor: false,
  imageEditorAllowEdit: false,
  acceptedFileTypes: [
    ...filePondConfig.acceptedFileTypes,
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  fileValidateTypeLabelExpectedTypesMap: {
    ...filePondConfig.fileValidateTypeLabelExpectedTypesMap,
    'application/msword': 'doc',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  },
};

/**
 * 压缩器全局配置
 */
export const compressorConfig: Partial<Compressor.Options> = {
  quality: 0.8,
  retainExif: true,
  mimeType: 'image/jpeg',
};

/**
 * 文档弹窗默认配置
 */
export const officeDialogConfig: IDialogOptions = {
  dialogtype: 'standard',
  width: '100%',
  maxHeight: '100%',
  zIndex: 10010,
  backDropZIndex: 10009,
  title: '文档预览',
  bodyScrollable: false,
  backdropCloseable: false,
  buttons: [],
};

/**
 * 文档默认配置
 */
export const officeConfig: IConfig = {
  document: {
    key: '',
    fileType: '',
    title: '',
    url: '',
    permissions: {
      chat: false,
      edit: false,
      review: true,
    },
  },
  editorConfig: {
    mode: 'view',
    lang: 'zh',
    location: 'cn',
    region: 'zh-CN',
    customization: {
      compactHeader: false,
      compactToolbar: false,
      help: false,
      plugins: false,
    },
  },
};
