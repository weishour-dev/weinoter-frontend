import { inject } from '@angular/core';
import { IconsService } from 'app/core/icons';
import { NavigationService } from 'app/core/navigation';
import { MessagesService } from 'app/layout/common/messages';
import { NotificationsService } from 'app/layout/common/notifications';
import { ShortcutsService } from 'app/layout/common/shortcuts';
import { forkJoin } from 'rxjs';

export const initialDataResolver = () => {
  const navigationService = inject(NavigationService);
  const iconsService = inject(IconsService);
  const messagesService = inject(MessagesService);
  const notificationsService = inject(NotificationsService);
  const shortcutsService = inject(ShortcutsService);

  // Fork联接多个API端点调用以等待所有这些调用完成
  return forkJoin([navigationService.get(), iconsService.getIcons()]);
};
