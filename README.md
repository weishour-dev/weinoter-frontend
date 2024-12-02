<p align="center">
  <a href="https://www.weishour.com/" target="blank"><img src="./src/assets/images/logo/weishour.svg" width="220" alt="WeiShour Logo" /></a>
</p>

## 描述

[Weinoter-Frontend]() 唯守笔记前端。

## 安装

```bash
$ npm install
```

## 运行

```bash
# 开始
$ npm run start

# 观察
$ npm run watch
```

## 构建

```bash
$ npm run build
```

## 创建组件

```bash
$ ng g component xxx --skip-tests=true
```

## window删除node_modules
rimraf node_modules

## 内置插件

- [ngx-socket-io](https://github.com/rodgc/ngx-socket-io) [v4.7.0] (Commits on Oct 25, 2024)
- [@onlyoffice/document-editor-angular](https://github.com/ONLYOFFICE/document-editor-angular-workspace) [v5.3.0] (Commits on Nov 7, 2024)

## 部署

```bash
# 压缩镜像
$ docker-slim build --include-path /usr/share/nginx/ --target weishour/weinoter-frontend --tag weishour/weinoter-frontend.slim:v1

$ docker-compose up -d
```
