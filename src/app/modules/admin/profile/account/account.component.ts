import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { wsAnimations } from '@ws/animations';
import { UsersService } from 'app/core/systems/users';
import { finalize } from 'rxjs';

@Component({
  selector: 'profile-account',
  templateUrl: './account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: wsAnimations,
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class ProfileAccountComponent implements OnInit {
  accountForm: FormGroup;

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
    this.accountForm = this._formBuilder.group({
      id: [0],
      username: ['', Validators.required],
      nickname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      about: [''],
    });

    // 获取当前用户
    this._usersService.get().subscribe({
      next: result => {
        if (result.status) {
          const currentUser = result.data;

          this.accountForm.patchValue({
            id: currentUser.id,
            username: currentUser.username,
            nickname: currentUser.nickname,
            email: currentUser.email,
            about: currentUser.about,
          });
        }
      },
    });
  }

  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * 保存
   */
  save(): void {
    // 如果表单无效则返回
    if (this.accountForm.invalid) return;

    // 禁用表单
    this.accountForm.disable();

    // 更新用户
    this._usersService
      .profileAccount(this.accountForm.value)
      .pipe(finalize(() => this.accountForm.enable()))
      .subscribe({
        next: () => {
          // 更新当前用户服务信息
          this._usersService.currentUser = this.accountForm.value;
        },
      });
  }
}
