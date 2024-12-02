const loadScript = async (url: string, id: string) => {
  return new Promise((resolve, reject) => {
    try {
      // 如果定义了 DocsAPI，则返回解析。
      if (window.DocsAPI) return resolve(null);

      const existedScript = document.getElementById(id);

      if (existedScript) {
        // 如果找到脚本元素，请等待其加载。
        const intervalHandler = setInterval(() => {
          const loading = existedScript.getAttribute('loading');
          if (loading) {
            // 如果下载未完成，请继续等待。
            return;
          } else {
            // 如果下载完成，则停止等待。
            clearInterval(intervalHandler);

            // 如果定义了DocsAPI，则加载后返回resolve。
            if (window.DocsAPI) return resolve(null);

            // 如果未定义 DocsAPI，请删除现有脚本并创建一个新脚本。
            const script = _createScriptTag(id, url, resolve, reject);
            existedScript.remove();
            document.body.appendChild(script);
          }
        }, 500);
      } else {
        // 如果未找到脚本元素，请创建它。
        const script = _createScriptTag(id, url, resolve, reject);
        document.body.appendChild(script);
      }
    } catch (e) {
      console.error(e);
    }
  });
};

const _createScriptTag = (
  id: string,
  url: string,
  resolve: (value: unknown) => void,
  reject: (reason?: any) => void,
) => {
  const script = document.createElement('script');

  script.id = id;
  script.type = 'text/javascript';
  script.src = url;
  script.async = true;

  script.onload = () => {
    // 加载完成后移除属性加载。
    script.removeAttribute('loading');
    resolve(null);
  };
  script.onerror = (error: any) => {
    // 加载完成后移除属性加载。
    script.removeAttribute('loading');
    reject(error);
  };

  script.setAttribute('loading', '');

  return script;
};

export default loadScript;
