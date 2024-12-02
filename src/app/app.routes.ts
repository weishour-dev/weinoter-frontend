import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
export const appRoutes: Route[] = [
  // 重定向空路径到'basedata/demo'
  { path: '', pathMatch: 'full', redirectTo: 'basedata/demo' },

  // 重定向已登录用户到'basedata/demo'
  //
  // 用户登录后，登录页面将用户重定向到“sign -in-redirect”路径。下面是该路径的
  // 另一个重定向，用于将用户重定向到所需的位置。这是一个小小的方便，可以将所有的主
  // 要路径都放在这个文件中.
  { path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'basedata/demo' },

  // 游客的授权路由
  {
    path: '',
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
      showSetting: false,
    },
    children: [
      {
        path: 'confirmation-required',
        loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes'),
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes'),
      },
      { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
      {
        path: 'sign-in',
        data: { reuse: false },
        loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes'),
      },
      { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') },
    ],
  },

  // 认证用户的授权路由
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: 'empty',
      showSetting: false,
    },
    children: [
      {
        path: 'sign-out',
        data: { reuse: false },
        loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes'),
      },
      { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') },
    ],
  },

  // 登录页路由
  {
    path: '',
    component: LayoutComponent,
    data: {
      layout: 'empty',
    },
    children: [{ path: 'landing/home', loadChildren: () => import('app/modules/landing/home/home.routes') }],
  },

  // 管理页路由
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: initialDataResolver,
    },
    children: [
      // 基础资料
      {
        path: 'basedata',
        children: [{ path: 'demo', loadChildren: () => import('app/modules/admin/basedata/demo/demo.routes') }],
      },
      // 系统管理
      {
        path: 'systems',
        children: [
          { path: 'menus', loadChildren: () => import('app/modules/admin/systems/menus/menus.routes') },
          {
            path: 'organizations',
            loadChildren: () => import('app/modules/admin/systems/organizations/organizations.routes'),
          },
          {
            path: 'user-groups',
            loadChildren: () => import('app/modules/admin/systems/user-groups/user-groups.routes'),
          },
          { path: 'roles', loadChildren: () => import('app/modules/admin/systems/roles/roles.routes') },
          {
            path: 'permissions',
            loadChildren: () => import('app/modules/admin/systems/permissions/permissions.routes'),
          },
          { path: 'users', loadChildren: () => import('app/modules/admin/systems/users/users.routes') },
        ],
      },
      // 个人中心
      {
        path: 'profile',
        children: [
          // 设置
          {
            path: 'settings',
            data: { id: 'profile-settings', title: '个人中心' },
            loadChildren: () => import('app/modules/admin/profile/profile.routes'),
          },
        ],
      },
      // 错误页
      {
        path: 'error',
        children: [
          { path: '400', loadChildren: () => import('app/modules/error/400/error-400.routes') },
          { path: '403', loadChildren: () => import('app/modules/error/403/error-403.routes') },
          { path: '404', loadChildren: () => import('app/modules/error/404/error-404.routes') },
          { path: '500', loadChildren: () => import('app/modules/error/500/error-500.routes') },
          { path: 'network-error', loadChildren: () => import('app/modules/error/network-error/network-error.routes') },
          { path: 'not-data', loadChildren: () => import('app/modules/error/not-data/not-data.routes') },
        ],
      },
      // 未找到页面
      { path: '**', redirectTo: 'error/404' },
    ],
  },
];
