import { popperVariation, TippyConfig, tooltipVariation } from '@ngneat/helipopper';

/**
 * tippy全局配置
 */
export const tippyConfig: Partial<TippyConfig> = {
  defaultVariation: 'tooltip',
  variations: {
    tooltip: {
      ...tooltipVariation,
      arrow: true,
      offset: [0, 10],
    },
    popper: popperVariation,
  },
};
