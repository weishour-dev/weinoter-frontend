import { expandCollapse } from '@ws/animations/expand-collapse';
import {
  fadeIn,
  fadeInBottom,
  fadeInLeft,
  fadeInRight,
  fadeInTop,
  fadeOut,
  fadeOutBottom,
  fadeOutLeft,
  fadeOutRight,
  fadeOutTop,
} from '@ws/animations/fade';
import {
  routerTransitionDown,
  routerTransitionFade,
  routerTransitionLeft,
  routerTransitionRight,
  routerTransitionUp,
} from '@ws/animations/routers';
import { shake } from '@ws/animations/shake';
import {
  slideInBottom,
  slideInLeft,
  slideInRight,
  slideInTop,
  slideOutBottom,
  slideOutLeft,
  slideOutRight,
  slideOutTop,
} from '@ws/animations/slide';
import { stagger20, stagger40, stagger60, stagger80 } from '@ws/animations/stagger';
import { zoomIn, zoomOut } from '@ws/animations/zoom';

export const wsAnimations = [
  expandCollapse,
  fadeIn,
  fadeInTop,
  fadeInBottom,
  fadeInLeft,
  fadeInRight,
  fadeOut,
  fadeOutTop,
  fadeOutBottom,
  fadeOutLeft,
  fadeOutRight,
  routerTransitionFade,
  routerTransitionUp,
  routerTransitionDown,
  routerTransitionRight,
  routerTransitionLeft,
  shake,
  slideInTop,
  slideInBottom,
  slideInLeft,
  slideInRight,
  slideOutTop,
  slideOutBottom,
  slideOutLeft,
  slideOutRight,
  zoomIn,
  zoomOut,
  stagger20,
  stagger40,
  stagger60,
  stagger80,
];
