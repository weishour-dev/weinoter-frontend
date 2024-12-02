import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { funEmoji } from '@dicebear/collection';
import { toJpeg } from '@dicebear/converter';
import { createAvatar } from '@dicebear/core';
import {
  DataStateChangeEventArgs,
  DialogEditEventArgs,
  EditSettingsModel,
  GridAllModule,
  GridComponent,
  SaveEventArgs,
} from '@syncfusion/ej2-angular-grids';
import { ChangedEventArgs, TextBoxAllModule, TextBoxComponent } from '@syncfusion/ej2-angular-inputs';
import { ClickEventArgs, ItemModel } from '@syncfusion/ej2-angular-navigations';
import { BeforeCloseEventArgs } from '@syncfusion/ej2-angular-popups';
import { DataManager } from '@syncfusion/ej2-data';
import { wsAnimations } from '@ws/animations';
import { OnReuseInit, ReuseHookOnReuseInitType } from '@ws/components/reuse-tab';
import { FilePondFile, WsUploadComponent } from '@ws/components/upload';
import { FormActionType } from '@ws/interfaces';
import { GridProvider, GropDownListProvider } from '@ws/providers';
import { WsMessageService } from '@ws/services/message';
import { GridService, WsDialogService, WsUtilsService } from '@ws/services/utils';
import { MandateTargetType } from 'app/core/constants';
import { FilesService } from 'app/core/files';
import { IColumnUserModel, User, UsersService } from 'app/core/systems/users';
import { WsHeaderComponent } from 'app/layout/common/header';
import { PermissionAllocationComponent } from 'app/modules/admin/systems/permissions/permission-allocation';
import { UserDepartmentItemsComponent } from 'app/modules/admin/systems/users/user-department-items';
import { UserGroupItemsComponent } from 'app/modules/admin/systems/users/user-group-items';
import { UserRoleItemsComponent } from 'app/modules/admin/systems/users/user-role-items';
import { FilePondErrorDescription, FileStatus } from 'filepond';
import { cloneDeep, filter, isEmpty, isUndefined, merge } from 'lodash-es';
import { LayoutModule, TabsModule } from 'ng-devui';

@Component({
  selector: 'systems-users',
  templateUrl: './users.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    WsHeaderComponent,
    GridAllModule,
    TextBoxAllModule,
    LayoutModule,
    TabsModule,
    WsUploadComponent,
    UserDepartmentItemsComponent,
    UserGroupItemsComponent,
    UserRoleItemsComponent,
    PermissionAllocationComponent,
  ],
})
export class SystemsUsersComponent implements OnReuseInit, OnInit, AfterViewInit {
  @ViewChild('permissionAllocation') permissionAllocation: PermissionAllocationComponent;
  @ViewChild('systemsUsersGrid') systemsUsersGrid: GridComponent;
  @ViewChild('avatarUpload') avatarUpload: WsUploadComponent;
  @ViewChild('usersUsername') usersUsername: TextBoxComponent;
  @ViewChild('usersEmail') usersEmail: TextBoxComponent;
  @ViewChild('usersPassword') usersPassword: TextBoxComponent;
  @ViewChild('attachmentUpload') attachmentUpload: WsUploadComponent;

  /** 用户弹窗名称 */
  systemsUsersDialogName = '用户';
  /** 用户表格id */
  systemsUsersGridId = 'systems_users_grid';
  /** 编辑设置 */
  editSettings = cloneDeep(this.gridProvider.editSettings);
  /** 用户表格数据 */
  systemsUsersData: DataManager;
  /** 用户表单 */
  systemsUsersForm: FormGroup;

  //#region 其他
  /** 患者实体 */
  userEntity = 'user';
  /** 患者实体id */
  userId: number;
  /** 授权目标对象类型 */
  targetType = MandateTargetType.USER;
  /** 授权目标对象id */
  targetId: number;
  /** 表单操作类型 */
  formActionType: FormActionType;
  //#endregion

  /**
   * 构造函数
   */
  constructor(
    public gridProvider: GridProvider,
    public gropDownListProvider: GropDownListProvider,
    private _formBuilder: FormBuilder,
    private _filesService: FilesService,
    private _usersService: UsersService,
    private _wsMessageService: WsMessageService,
    private _gridService: GridService,
    private _wsUtilsService: WsUtilsService,
    private _wsDialogService: WsDialogService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 路由复用进入
   */
  _onReuseInit(type: ReuseHookOnReuseInitType) {
    switch (type) {
      case 'init':
        this.gridProvider.toolbarHandle(this.systemsUsersGrid, 'text');
        this.gridProvider.toolbarHandle(this.systemsUsersGrid, 'isEnable');
        this.systemsUsersGrid.refresh();
        break;
    }
  }

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 加载表格数据
    this.initSystemsUsersData();
  }

  /**
   * 视图初始化后
   */
  ngAfterViewInit(): void {
    // 加载表格数据
    this.initSystemsUsersData();
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 用户表格创建完成事件
   *
   * @param args
   */
  systemsUserGridCreated(args: object): void {
    this.gridProvider.created(args, this.systemsUsersGrid);

    // 表格默认设置
    this.gridProvider.defaultHandle(this.systemsUsersGrid);

    // 工具栏自定义处理
    this.systemsUsersGrid.toolbar = <ItemModel[]>cloneDeep(this.gridProvider.toolbar);
    const toolbar = <ItemModel[]>cloneDeep(this.systemsUsersGrid.toolbar);
    toolbar.splice(2, 0, {
      text: '授权',
      tooltipText: '授权',
      prefixIcon: 'icon-set-permission text-green-500',
      id: 'auth',
    });
    this.systemsUsersGrid.toolbar = toolbar;
    setTimeout(() => this.gridProvider.toolbarHandle(this.systemsUsersGrid, 'text'));

    // 表单弹窗配置
    this.editSettings = merge<EditSettingsModel, EditSettingsModel>(this.editSettings, {
      dialog: {
        params: {
          beforeClose: (args: BeforeCloseEventArgs) => {
            if (!isUndefined(this.attachmentUpload)) {
              const files = this.attachmentUpload.filepond.getFiles();
              const completeFiles = filter(files, ['status', FileStatus.PROCESSING_COMPLETE]);

              // 当存在已上传文件 && 新增操作 && 弹窗关闭
              if (completeFiles.length > 0 && isUndefined(this.userId) && !args.cancel) {
                const fileNames = completeFiles.map(completeFile => completeFile.serverId);

                // 批量移除文件
                this._filesService.batchRemove({ fileNames }).subscribe();
              }
            }
          },
        },
      },
    });
  }

  // ----------------------------------------------------------------------------
  // @ 用户表格
  // ----------------------------------------------------------------------------

  /**
   * 初始化数据
   *
   * @param message
   */
  initSystemsUsersData(message: string = ''): void {
    // 获取表格数据
    const state: DataStateChangeEventArgs = {};

    this._usersService.getData(state).subscribe({
      next: result => {
        this.systemsUsersData = result.dataManager;

        if (message !== '') this._wsMessageService.toast('success', message);
      },
      error: error => {
        this._wsMessageService.error(error);
      },
    });
  }

  /**
   * 操作开始
   *
   * @param args
   */
  systemsUsersActionBegin(args: SaveEventArgs): void {
    if (['add', 'beginEdit'].includes(args.requestType)) {
      // 新增之前
      if (args.requestType === 'add') {
        this.formActionType = 'add';
      }
      // 修改之前
      else {
        this.formActionType = 'edit';
      }

      this.createFormGroup(args.rowData);
    }

    // 删除前处理
    args.cancel = this._gridService.deleteBeginHandle(args);

    if (args.requestType === 'save') {
      if (this._systemsUsersFormVerify()) {
        let data = {};
        if (args.action === 'add') {
          const rowsCount = this.systemsUsersGrid.getRowsObject().length;
          data = { sort: rowsCount + 1, ...this.systemsUsersForm.value };
        } else {
          data = this.systemsUsersForm.value;
        }
        args.data = data;
      } else {
        args.cancel = true;
      }
    }
  }

  /**
   * 操作完成
   *
   * @param args
   */
  systemsUsersActionComplete(args: DialogEditEventArgs | SaveEventArgs): void {
    const isComplete = args.type === 'actionComplete';

    if (this._wsUtilsService.isProps<SaveEventArgs>(args, 'action')) {
      // 新增完成
      if (args.action === 'add' && isComplete) {
      }
      // 修改完成
      else if (args.action === 'edit' && isComplete) {
        // 更新当前用户服务信息
        this._usersService.currentUser = <User>args.data;
      }
    } else if (this._wsUtilsService.isProps<DialogEditEventArgs>(args, 'dialog')) {
      const dialog = args.dialog;
      const header =
        args.requestType === 'add'
          ? `新增${this.systemsUsersDialogName}`
          : `修改「${args.rowData['username']}」${this.systemsUsersDialogName}`;

      dialog && this.gridProvider.dialogHandle(dialog, header);
    }

    switch (args.requestType) {
      case 'columnstate':
        // 自动调整所有列
        this.systemsUsersGrid.autoFitColumns();
        break;
    }

    if (['save', 'delete', 'cancel'].includes(args.requestType)) {
      this.initSystemsUsersData();
    }
  }

  /**
   * 工具栏点击事件
   *
   * @param args
   */
  async systemsUsersToolbarClick(args: ClickEventArgs): Promise<void> {
    this.gridProvider.defaultToolbarClick(args, this.systemsUsersGridId, this.systemsUsersGrid);

    const records: IColumnUserModel[] = this.systemsUsersGrid.getSelectedRecords();

    switch (args.item.id) {
      // 授权成员
      case 'auth':
        if (records.length > 0) {
          this.allocation(records[0].id);
        } else {
          this._wsDialogService.gridAlert('没有为授权操作选择记录', this.systemsUsersGrid.element);
        }
        break;
      case 'refresh':
        this.initSystemsUsersData('刷新成功');

        // 清除过滤
        this.systemsUsersGrid.clearFiltering();
        // 清除排序
        this.systemsUsersGrid.clearSorting();
        break;
    }
  }

  // ----------------------------------------------------------------------------
  // @ 授权
  // ----------------------------------------------------------------------------

  /**
   * 分配
   *
   * @param id
   * @param type
   */
  allocation(id: number, type = MandateTargetType.USER): void {
    if (id > 0) {
      this.targetType = type;
      this.targetId = id;
      this.permissionAllocation.dialog.show();
    } else {
      this._wsMessageService.toast('error', '没有为授权操作选择记录');
    }
  }

  /**
   * 授权确认事件
   */
  allocationConfirm(): void {
    this.initSystemsUsersData();
  }

  // ----------------------------------------------------------------------------
  // @ 其他
  // ----------------------------------------------------------------------------

  /**
   * 标签切换事件
   *
   * @param id
   */
  activeTabChange(id: string | number): void {
    switch (id) {
      case 'attachments':
        const files = this.attachmentUpload.filepond.getFiles();
        if (files.length > 0 || isUndefined(this.userId)) return;

        // 加载附件文件列表
        this._filesService.attachments({ entity: this.userEntity, orderId: this.userId }).subscribe(files => {
          const fileNames = files.map(file => file.fileName);

          setTimeout(() => {
            for (const fileName of fileNames) {
              this.attachmentUpload.filepond
                .addFile(fileName, { type: 'limbo' })
                .catch((result: { error: FilePondErrorDescription | null; file: FilePondFile }) => {
                  const error = result.error;
                  const filePondFile = result.file;
                  if (error && error?.body && error.type === 'error') {
                    // 恢复错误通知
                    this._wsMessageService.toast('error', `『${filePondFile.filename} 』不存在`);
                  }
                });
            }
          }, 200);
        });
        break;
    }
  }

  /**
   * 创建表单
   *
   * @param data
   * @returns
   */
  createFormGroup(data: IColumnUserModel): void {
    this.systemsUsersForm = this._formBuilder.group({
      id: [data.id],
      avatar: [data.avatar],
      username: [data.username, Validators.required],
      nickname: [data.nickname || ''],
      email: [data.email, [Validators.required, Validators.email]],
      password: ['$argon2id$v=19$m=', Validators.required],
      about: [data.about],
    });

    // 用户实体id赋值
    this.userId = data.id;
  }

  /**
   * 用户名值变化
   *
   * @param args
   */
  usernameChange(args: ChangedEventArgs): void {
    if (this.formActionType === 'add') {
      this.generateAvatarBySeed(args.value);
    } else {
      const avatar = this.systemsUsersForm.value.avatar;
      if (isEmpty(avatar)) this.generateAvatarBySeed(args.value);
    }
  }

  // ----------------------------------------------------------------------------
  // @ 头像上传
  // ----------------------------------------------------------------------------

  /**
   * 头像上传实例已创建并准备就绪事件
   */
  avatarUploadInit(): void {
    const filepond = this.avatarUpload.filepond;
    const avatar = this.systemsUsersForm.value.avatar;
    if (!isEmpty(avatar)) filepond.addFile(avatar);
  }

  /**
   * 文件已删除事件
   */
  avatarUploadRemovefile(filePondFile: FilePondFile): void {
    // 更新头像字段
    this.systemsUsersForm.patchValue({ avatar: '' });
  }

  /**
   * 头像上传海报更新事件
   */
  avatarUploadPoster(avatar: string): void {
    const filepond = this.avatarUpload.filepond;

    if (filepond && avatar) {
      // 更新头像字段
      this.systemsUsersForm.patchValue({ avatar });
      this.systemsUsersForm.get('avatar').markAsDirty();
    }
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  /**
   * 根据文字生成头像
   *
   * @param args
   */
  private async generateAvatarBySeed(seed: string): Promise<void> {
    const avatar = createAvatar(funEmoji, { seed, backgroundColor: ['fcbc34'] }); // admin-1226123
    const jpgData = await toJpeg(avatar).toDataUri();
    const filepond = this.avatarUpload.filepond;

    if (filepond && jpgData) {
      // 头像显示
      filepond.addFile(jpgData);
      // 更新头像字段
      this.systemsUsersForm.patchValue({ avatar: jpgData });
    }
  }

  /**
   * 用户表单验证
   *
   * @returns
   */
  private _systemsUsersFormVerify(): boolean {
    // 数据验证
    if (this.systemsUsersForm.invalid) {
      const usernameControl = this.systemsUsersForm.get('username');
      const passwordControl = this.systemsUsersForm.get('password');
      const emailControl = this.systemsUsersForm.get('email');

      if (usernameControl.hasError('required')) {
        this.usersUsername.focusIn();
        this._wsMessageService.toast('warning', '请选择用户名!');
      } else if (passwordControl.hasError('required')) {
        this.usersPassword.focusIn();
        this._wsMessageService.toast('warning', '请输入密码!');
      } else if (emailControl.hasError('required')) {
        this.usersEmail.focusIn();
        this._wsMessageService.toast('warning', '请输入邮箱!');
      } else if (emailControl.hasError('email')) {
        this.usersEmail.focusIn();
        this._wsMessageService.toast('warning', '请输入正确的邮箱!');
      }

      return false;
    }

    // 数据是否修改过
    if (!this.systemsUsersForm.dirty) {
      this._wsMessageService.toast('warning', '暂无提交修改的数据!');
      return false;
    }

    return true;
  }
}
