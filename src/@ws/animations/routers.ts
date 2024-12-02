import { animate, animateChild, group, query, sequence, style, transition, trigger } from '@angular/animations';

// ----------------------------------------------------------------------------
// @ 淡入过渡
// ----------------------------------------------------------------------------
const routerTransitionFade = trigger('routerTransitionFade', [
  transition(
    '* => *',
    group([
      query(
        'content > :enter, content > :leave ',
        [
          style({
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }),
        ],
        { optional: true },
      ),

      query(
        'content > :enter',
        [
          style({
            opacity: 0,
          }),
        ],
        { optional: true },
      ),
      query(
        'content > :leave',
        [
          style({
            opacity: 1,
          }),
          animate(
            '300ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              opacity: 0,
            }),
          ),
        ],
        { optional: true },
      ),
      query(
        'content > :enter',
        [
          style({
            opacity: 0,
          }),
          animate(
            '300ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              opacity: 1,
            }),
          ),
        ],
        { optional: true },
      ),
      query('content > :enter', animateChild(), { optional: true }),
      query('content > :leave', animateChild(), { optional: true }),
    ]),
  ),
]);

// ----------------------------------------------------------------------------
// @ 向上过渡
// ----------------------------------------------------------------------------
const routerTransitionUp = trigger('routerTransitionUp', [
  transition('* => *', [
    query(
      'content > :enter, content > :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }),
      ],
      { optional: true },
    ),
    query(
      'content > :enter',
      [
        style({
          transform: 'translateY(100%)',
          opacity: 0,
        }),
      ],
      { optional: true },
    ),
    group([
      query(
        'content > :leave',
        [
          style({
            transform: 'translateY(0)',
            opacity: 1,
          }),
          animate(
            '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              transform: 'translateY(-100%)',
              opacity: 0,
            }),
          ),
        ],
        { optional: true },
      ),
      query(
        'content > :enter',
        [
          style({ transform: 'translateY(100%)' }),
          animate(
            '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
            style({
              transform: 'translateY(0%)',
              opacity: 1,
            }),
          ),
        ],
        { optional: true },
      ),
    ]),
    query('content > :leave', animateChild(), { optional: true }),
    query('content > :enter', animateChild(), { optional: true }),
  ]),
]);

// ----------------------------------------------------------------------------
// @ 向下过渡
// ----------------------------------------------------------------------------
const routerTransitionDown = trigger('routerTransitionDown', [
  transition('* => *', [
    query(
      'content > :enter, content > :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }),
      ],
      { optional: true },
    ),
    query(
      'content > :enter',
      [
        style({
          transform: 'translateY(-100%)',
          opacity: 0,
        }),
      ],
      { optional: true },
    ),
    sequence([
      group([
        query(
          'content > :leave',
          [
            style({
              transform: 'translateY(0)',
              opacity: 1,
            }),
            animate(
              '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateY(100%)',
                opacity: 0,
              }),
            ),
          ],
          { optional: true },
        ),
        query(
          'content > :enter',
          [
            style({ transform: 'translateY(-100%)' }),
            animate(
              '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateY(0%)',
                opacity: 1,
              }),
            ),
          ],
          { optional: true },
        ),
      ]),
      query('content > :leave', animateChild(), { optional: true }),
      query('content > :enter', animateChild(), { optional: true }),
    ]),
  ]),
]);

// ----------------------------------------------------------------------------
// @ 向右过渡
// ----------------------------------------------------------------------------
const routerTransitionRight = trigger('routerTransitionRight', [
  transition('* => *', [
    query(
      'content > :enter, content > :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }),
      ],
      { optional: true },
    ),
    query(
      'content > :enter',
      [
        style({
          transform: 'translateX(-100%)',
          opacity: 0,
        }),
      ],
      { optional: true },
    ),
    sequence([
      group([
        query(
          'content > :leave',
          [
            style({
              transform: 'translateX(0)',
              opacity: 1,
            }),
            animate(
              '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateX(100%)',
                opacity: 0,
              }),
            ),
          ],
          { optional: true },
        ),
        query(
          'content > :enter',
          [
            style({ transform: 'translateX(-100%)' }),
            animate(
              '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateX(0%)',
                opacity: 1,
              }),
            ),
          ],
          { optional: true },
        ),
      ]),
      query('content > :leave', animateChild(), { optional: true }),
      query('content > :enter', animateChild(), { optional: true }),
    ]),
  ]),
]);

// ----------------------------------------------------------------------------
// @ 向左过渡
// ----------------------------------------------------------------------------
const routerTransitionLeft = trigger('routerTransitionLeft', [
  transition('* => *', [
    query(
      'contents > :enter, contents > :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }),
      ],
      { optional: true },
    ),
    query(
      'contents > :enter',
      [
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        }),
      ],
      { optional: true },
    ),
    sequence([
      group([
        query(
          'contents > :leave',
          [
            style({
              transform: 'translateX(0)',
              opacity: 1,
            }),
            animate(
              '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateX(-100%)',
                opacity: 0,
              }),
            ),
          ],
          { optional: true },
        ),
        query(
          'contents > :enter',
          [
            style({ transform: 'translateX(100%)' }),
            animate(
              '600ms cubic-bezier(0.0, 0.0, 0.2, 1)',
              style({
                transform: 'translateX(0%)',
                opacity: 1,
              }),
            ),
          ],
          { optional: true },
        ),
      ]),
      query('contents > :leave', animateChild(), { optional: true }),
      query('contents > :enter', animateChild(), { optional: true }),
    ]),
  ]),
]);

export { routerTransitionDown, routerTransitionFade, routerTransitionLeft, routerTransitionRight, routerTransitionUp };
