import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { wsAnimations } from '@ws/animations';
import { WsMessageService } from '@ws/services/message';
import { AuthService } from 'app/core/auth';
import { LanguagesComponent } from 'app/layout/common/languages';
import { SchemesComponent } from 'app/layout/common/schemes';
import { finalize } from 'rxjs';

@Component({
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
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
export class AuthSignInComponent implements OnInit {
  @ViewChild('signInNgForm') signInNgForm: NgForm;
  signInForm: FormGroup;

  /**
   * 构造函数
   */
  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _wsMessageService: WsMessageService,
  ) {}

  // ----------------------------------------------------------------------------
  // @ 生命周期钩子
  // ----------------------------------------------------------------------------

  /**
   * 组件初始化
   */
  ngOnInit(): void {
    // 创建表单
    this.signInForm = this._formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
      rememberMe: [this._authService.rememberMe],
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 登录
   */
  signIn(): void {
    // 如果表单无效则返回
    if (this.signInForm.invalid) return;

    // 禁用表单
    this.signInForm.disable();

    // 登录
    this._authService
      .signIn(this.signInForm.value)
      .pipe(
        finalize(() => {
          // 重新启用表单
          this.signInForm.enable();
        }),
      )
      .subscribe({
        next: () => {
          // 设置重定向url
          const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

          // 导航到重定向url
          this._router.navigateByUrl(redirectURL);
        },
      });
  }
}
