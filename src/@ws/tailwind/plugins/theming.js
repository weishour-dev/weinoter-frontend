const chroma = require('chroma-js');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const colors = require('tailwindcss/colors');
const plugin = require('tailwindcss/plugin');
const flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette').default;
const generateContrasts = require(path.resolve(__dirname, '../utils/generate-contrasts'));
const jsonToSassMap = require(path.resolve(__dirname, ('../utils/json-to-sass-map')));

// ----------------------------------------------------------------------------
// @ Utilities
// ----------------------------------------------------------------------------

/**
 * 通过从每个调色板中省略空值和以“on”开头的值，规范化提供的主题。还设置每个选项板的正确默认值。
 *
 * @param theme
 */
const normalizeTheme = (theme) => {
  return _.fromPairs(
    _.map(
      _.omitBy(theme, (palette, paletteName) => paletteName.startsWith('on') || _.isEmpty(palette)),
      (palette, paletteName) => [
        paletteName,
        {
          ...palette,
          DEFAULT: palette['DEFAULT'] || palette[500],
        },
      ],
    ),
  );
};

// ----------------------------------------------------------------------------
// @ WS TailwindCSS 主插件
// ----------------------------------------------------------------------------
const theming = plugin.withOptions(
  (options) =>
    ({ addComponents, e, theme }) => {
      /**
       * 通过提供的主题和将它们与提供的“default”合并，这样我们就可以得到一个完整的每个用户主题的调色板集。
       */
      const userThemes = _.fromPairs(_.map(options.themes, (theme, themeName) => [
        themeName,
        _.defaults({}, theme, options.themes['default'])
      ]));

      /**
       * 规范化主题并将其分配给主题对象。这会是我们从中创建 SASS 映射的最终对象
       */
      let themes = _.fromPairs(_.map(userThemes, (theme, themeName) => [
        themeName,
        normalizeTheme(theme)
      ]));

      /**
       * 浏览主题以生成对比并过滤调色板只有“primary”、“accent”和“warn”对象。
       */
      themes = _.fromPairs(_.map(themes, (theme, themeName) => [
        themeName,
        _.pick(
          _.fromPairs(_.map(theme, (palette, paletteName) => [
            paletteName,
            {
              ...palette,
              contrast: _.fromPairs(_.map(generateContrasts(palette), (color, hue) => [
                hue,
                _.get(userThemes[themeName], [`on-${paletteName}`, hue]) || color
              ]))
            }
          ])),
          ['primary', 'accent', 'warn']
        )
      ]));

      /**
       * 浏览主题并附加适当的类选择器，我们可以使用它们来封装每个主题。
       */
      themes = _.fromPairs(_.map(themes, (theme, themeName) => [
        themeName,
        {
          selector: `".theme-${themeName}"`,
          ...theme
        }
      ]));

      /* 使用themes对象生成SASS映射 */
      const sassMap = jsonToSassMap(JSON.stringify({'user-themes': themes}));

      /* 获取文件路径 */
      const filename = path.resolve(__dirname, ('../../styles/user-themes.scss'));

      /* 读取文件并获取其数据 */
      let data;
      try {
        data = fs.readFileSync(filename, {encoding: 'utf8'});
      } catch (err) {
        console.error(err);
      }

      /* 如果map已更改，则写入文件 */
      if (data !== sassMap) {
        try {
          fs.writeFileSync(filename, sassMap, {encoding: 'utf8'});
        } catch (err) {
          console.error(err);
        }
      }

      /**
       * 遍历用户的主题，并使用它们的颜色构建包含CSS自定义属性的Tailwind组件。
       * 这允许通过简单地替换类名和嵌套它们来切换主题。
       */
      addComponents(
        _.fromPairs(
          _.map(options.themes, (theme, themeName) => [
            themeName === 'default' ? 'body, .theme-default' : `.theme-${e(themeName)}`,
            _.fromPairs(
              _.flatten(
                _.map(
                  flattenColorPalette(
                    _.fromPairs(
                      _.flatten(
                        _.map(normalizeTheme(theme), (palette, paletteName) => [
                          [e(paletteName), palette],
                          [
                            `on-${e(paletteName)}`,
                            _.fromPairs(
                              _.map(generateContrasts(palette), (color, hue) => [
                                hue,
                                _.get(theme, [`on-${paletteName}`, hue]) || color,
                              ]),
                            ),
                          ],
                        ]),
                      ),
                    ),
                  ),
                  (value, key) => [
                    [`--ws-${e(key)}`, value],
                    [`--ws-${e(key)}-rgb`, chroma(value).rgb().join(',')],
                  ],
                ),
              ),
            ),
          ]),
        ),
      );

      // ----------------------------------------------------------------------------
      // 生成基于css自定义属性和实用程序类的方案
      // ----------------------------------------------------------------------------
      const schemeCustomProps = _.map(['light', 'dark'], (colorScheme) => {
        const isDark = colorScheme === 'dark';
        const background = theme(`ws.customProps.background.${colorScheme}`);
        const foreground = theme(`ws.customProps.foreground.${colorScheme}`);
        const lightSchemeSelectors = 'body.light, .light, .dark .light';
        const darkSchemeSelectors = 'body.dark, .dark, .light .dark';

        return {
          [isDark ? darkSchemeSelectors : lightSchemeSelectors]: {
            /**
             * 如果自定义属性不可用，浏览器将使用回退值, 在本例中，我们想使用'--is-dark'
             * 作为暗主题的指示符，所以我们可以像这样使用它:
             * background-color: var(--is-dark, red);
             *
             * 如果我们在黑暗主题上将'--is-dark'设置为"true"，那么上述规则将因为“回退值”逻辑而失* 效. 因此，我们将'--is-dark'设置为"false"，而不是全部设置为黑暗主题，这样就可以在* 黑暗主题上使用回退值.
             *
             * 在浅色主题上, 由于'--is-dark'存在, 上面的规则将被插值为:
             * "background-color: false"
             *
             * 在dark主题上，因为'--is-dark' 不存在，所以回退值将被使用(在本例中是‘red’)， 并且* 规则将被插值为
             * :"background-color: red"
             *
             * 这样更容易理解和记忆
             */
            ...(!isDark ? { '--is-dark': 'false' } : {}),

            /* 从customProps生成自定义属性 */
            ..._.fromPairs(
              _.flatten(
                _.map(background, (value, key) => [
                  [`--ws-${e(key)}`, value],
                  [`--ws-${e(key)}-rgb`, chroma(value).rgb().join(',')],
                ]),
              ),
            ),
            ..._.fromPairs(
              _.flatten(
                _.map(foreground, (value, key) => [
                  [`--ws-${e(key)}`, value],
                  [`--ws-${e(key)}-rgb`, chroma(value).rgb().join(',')],
                ]),
              ),
            ),
          },
        };
      });

      const schemeUtilities = (() => {
        /* 生成通用样式和实用程序 */
        return {};
      })();

      addComponents(schemeCustomProps);
      addComponents(schemeUtilities);
    },
  (options) => {
    return {
      theme: {
        extend: {
          /**
           * 添加'Primary'， 'Accent'和'Warn'调色板作为颜色，以便为它们生成所有的颜色实用程序;
           * “bg-primary”，“text-on-primary”，“bg-accent-600”等。这也允许使用任意值，如不透明度等。
           */
          colors: _.fromPairs(
            _.flatten(
              _.map(_.keys(flattenColorPalette(normalizeTheme(options.themes.default))), (name) => [
                [name, `rgba(var(--ws-${name}-rgb), <alpha-value>)`],
                [`on-${name}`, `rgba(var(--ws-on-${name}-rgb), <alpha-value>)`],
              ]),
            ),
          ),
        },
        ws: {
          customProps: {
            background: {
              light: {
                'bg-app-bar': '#FFFFFF',
                'bg-card': '#FFFFFF',
                'bg-default': colors.slate[100],
                'bg-dialog': '#FFFFFF',
                'bg-hover': chroma(colors.slate[400]).alpha(0.12).css(),
                'bg-status-bar': colors.slate[300],
                'field-divider': 'rgba(0,0,0,0.42)',
              },
              dark: {
                'bg-app-bar': colors.slate[900],
                'bg-card': colors.slate[800],
                'bg-default': colors.slate[900],
                'bg-dialog': colors.slate[800],
                'bg-hover': 'rgba(255, 255, 255, 0.05)',
                'bg-status-bar': colors.slate[900],
                'field-divider': 'rgba(255,255,255,0.42)',
              },
            },
            foreground: {
              light: {
                'text-default': colors.slate[800],
                'text-secondary': colors.slate[500],
                'text-hint': colors.slate[400],
                'text-disabled': colors.slate[400],
                border: colors.slate[200],
                divider: colors.slate[200],
                icon: colors.slate[500],
                'mat-icon': colors.slate[500],
              },
              dark: {
                'text-default': '#FFFFFF',
                'text-secondary': colors.slate[400],
                'text-hint': colors.slate[500],
                'text-disabled': colors.slate[600],
                border: chroma(colors.slate[100]).alpha(0.12).css(),
                divider: chroma(colors.slate[100]).alpha(0.12).css(),
                icon: colors.slate[400],
                'mat-icon': colors.slate[400],
              },
            },
          },
        },
      },
    };
  },
);

module.exports = theming;
