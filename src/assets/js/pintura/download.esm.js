/**
   * 通过插入下载图标来注册下载组件
   */
const registerDownloadComponent = (item, el, labelButtonDownload, allowDownloadByUrl) => {
  const info = el.querySelector('.filepond--file-info-main'),
    downloadIcon = getDownloadIcon(labelButtonDownload);

  info.innerHTML = item.file.name;
  info.prepend(downloadIcon);

  downloadIcon.addEventListener('click', event => {
    event.stopPropagation();
    downloadFile(item, allowDownloadByUrl)
  });
};

/**
 * 生成下载图标
 */
const getDownloadIcon = labelButtonDownload => {
  let icon = document.createElement('span');
  icon.className = 'filepond--download-icon';
  icon.title = labelButtonDownload;
  return icon;
};

/**
 * 触发上传文件的实际下载
 */
const downloadFile = (item, allowDownloadByUrl) => {
  // 如果客户端想从远程服务器下载文件
  if (allowDownloadByUrl && item.getMetadata('url')) {
    location.href = item.getMetadata('url'); // full path to remote server is stored in metadata with key 'url'
  } else {
    // 创建临时超链接以强制浏览器下载文件
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(item.file);
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = item.file.name;
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();
  }
};

/**
 * 下载插件
 */
const plugin = fpAPI => {
  const { addFilter, utils } = fpAPI;
  const { Type, createRoute } = utils;

  // 为“create”方法之后创建的每个视图调用
  addFilter('CREATE_VIEW', viewAPI => {
    // 获取对创建的视图的引用
    const { is, view, query } = viewAPI;

    // 仅连接到项目视图
    if (!is('file')) {
      return;
    }

    // 创建获取文件插件
    const didLoadItem = ({ root, props }) => {
      const { id } = props;
      const item = query('GET_ITEM', id);

      if (!item || item.archived) {
        return;
      }

      const labelButtonDownload = root.query('GET_LABEL_BUTTON_DOWNLOAD_ITEM');

      const allowDownloadByUrl = root.query('GET_ALLOW_DOWNLOAD_BY_URL');

      registerDownloadComponent(item, root.element, labelButtonDownload, allowDownloadByUrl);
    };

    // start writing
    view.registerWriter(
      createRoute(
        {
          DID_LOAD_ITEM: didLoadItem,
        },
        ({ root, props }) => {
          const { id } = props;
          const item = query('GET_ITEM', id);

          // don't do anything while hidden
          if (root.rect.element.hidden) return;
        },
      ),
    );
  });

  // expose plugin
  return {
    options: {
      labelButtonDownloadItem: ['Download file', Type.STRING],
      allowDownloadByUrl: [false, Type.BOOLEAN],
    },
  };
};

// 如果在浏览器中运行，则触发pluginloaded事件，这允许在使用异步脚本标签时注册插件
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
if (isBrowser) {
  document.dispatchEvent(new CustomEvent('FilePond:pluginloaded', { detail: plugin }));
}

export default plugin;
