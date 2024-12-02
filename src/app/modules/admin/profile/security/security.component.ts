import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { wsAnimations } from '@ws/animations';
import { WsValidators } from '@ws/validators';
import { UsersService } from 'app/core/systems/users';
import { finalize } from 'rxjs';

@Component({
  selector: 'profile-security',
  templateUrl: './security.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: wsAnimations,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class ProfileSecurityComponent implements OnInit {
  securityForm: FormGroup;

  /**
   * 构造函数
   */
  constructor(
    private _formBuilder: FormBuilder,
    private _usersService: UsersService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 创建表单
    this.securityForm = this._formBuilder.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
      },
      {
        validators: WsValidators.mustMatch('currentPassword', 'newPassword', true),
      },
    );
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 保存
   */
  save(): void {
    // 如果表单无效则返回
    if (this.securityForm.invalid) return;

    // 禁用表单
    this.securityForm.disable();

    // 修改密码
    this._usersService
      .profilePassword(this.securityForm.value)
      .pipe(finalize(() => this.securityForm.enable()))
      .subscribe({
        next: () => this.securityForm.reset(),
      });
  }
}
