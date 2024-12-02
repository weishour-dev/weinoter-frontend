import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { wsAnimations } from '@ws/animations';
import { WsAlertComponent, WsAlertType } from '@ws/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'auth-forgot-password',
  templateUrl: './forgot-password.component.html',
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    WsAlertComponent,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
})
export class AuthForgotPasswordComponent implements OnInit {
  @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

  alert: { type: WsAlertType; message: string } = {
    type: 'success',
    message: '',
  };
  forgotPasswordForm: FormGroup;
  showAlert: boolean = false;

  /**
   * 构造函数
   */
  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 创建表单
    this.forgotPasswordForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 发送重置链接
   */
  sendResetLink(): void {
    // 如果表单无效则返回
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    // 禁用表单
    this.forgotPasswordForm.disable();

    // 隐藏提示
    this.showAlert = false;

    // 忘记密码
    this._authService
      .forgotPassword(this.forgotPasswordForm.get('email').value)
      .pipe(
        finalize(() => {
          // 重新启用表单
          this.forgotPasswordForm.enable();

          // 重置表单
          this.forgotPasswordNgForm.resetForm();

          // 显示警报
          this.showAlert = true;
        }),
      )
      .subscribe({
        next: () => {
          // 设置提示
          this.alert = {
            type: 'success',
            message: '发送密码重置!如果您在我们的系统上注册，您将收到一封电子邮件。',
          };
        },
        error: () => {
          // 设置提示
          this.alert = {
            type: 'error',
            message: '没有找到电子邮件!你确定你已经是会员了吗?',
          };
        },
      });
  }
}
