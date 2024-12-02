import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { wsAnimations } from '@ws/animations';
import { WsValidators } from '@ws/validators';
import { AuthService } from 'app/core/auth/auth.service';
import { LanguagesComponent } from 'app/layout/common/languages';
import { SchemesComponent } from 'app/layout/common/schemes';
import { omit } from 'lodash-es';

@Component({
  selector: 'auth-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: wsAnimations,
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    LanguagesComponent,
    SchemesComponent,
    TranslocoModule,
  ],
})
export class AuthSignUpComponent implements OnInit {
  @ViewChild('signUpNgForm') signUpNgForm: NgForm;
  signUpForm: FormGroup;

  /**
   * 构造函数
   */
  constructor(
    private _authService: AuthService,
    private _formBuilder: FormBuilder,
    private _router: Router,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 创建表单
    this.signUpForm = this._formBuilder.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        passwordConfirm: ['', Validators.required],
        agreements: [false, Validators.requiredTrue],
      },
      {
        validators: WsValidators.mustMatch('password', 'passwordConfirm'),
      },
    );
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 注册
   */
  signUp(): void {
    // 如果表单无效则返回
    if (this.signUpForm.invalid) return;

    // 禁用表单
    this.signUpForm.disable();

    // 注册
    this._authService.signUp(omit(this.signUpForm.value, ['passwordConfirm'])).subscribe({
      next: () => {
        // 导航到登录页面
        this._router.navigateByUrl('/sign-in');
      },
      error: () => {
        // 重新启用表单
        this.signUpForm.enable();
      },
    });
  }
}
