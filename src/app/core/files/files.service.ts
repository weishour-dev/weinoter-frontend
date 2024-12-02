import { Injectable } from '@angular/core';
import { Result } from '@ws/interfaces';
import { GridProvider } from '@ws/providers';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { AttachmentsDto, BatchRemoveDto, FileModel, IColumnFileModel } from 'app/core/files/interfaces';
import { BaseService } from 'app/core/services/base.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FilesService extends BaseService<{ T: IColumnFileModel; K: FileModel }> {
  apiPoint = Routes.files;

  constructor(gridProvider: GridProvider, wsHttpService: WsHttpService) {
    super(gridProvider, wsHttpService);
  }

  /**
   * 获取附件列表
   *
   * @param attachmentsDto
   * @returns Observable<FileModel[]>
   */
  attachments(attachmentsDto: AttachmentsDto): Observable<FileModel[]> {
    return this.wsHttpService
      .post<Result<FileModel[]>>(`${this.apiPoint}/attachments`, attachmentsDto, { toast: false })
      .pipe(map(result => result.data));
  }

  /**
   * 批量移除文件
   *
   * @param batchRemoveDto
   * @returns Observable<FileModel[]>
   */
  batchRemove(batchRemoveDto: BatchRemoveDto): Observable<FileModel[]> {
    return this.wsHttpService
      .post<Result<FileModel[]>>(`${this.apiPoint}/batch/remove`, batchRemoveDto, { toast: false })
      .pipe(map(result => result.data));
  }
}
