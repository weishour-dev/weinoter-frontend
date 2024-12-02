export interface WeatherNowResult {
  /** 状态码 */
  code: string;
  /** 当前API的最近更新时间 */
  updateTime: string;
  /** 当前数据的响应式页面 */
  fxLink: string;
  /** 实时天气 */
  now: WeatherNow;
  /** 参考说明 */
  refer: {
    /** 原始数据来源或数据源说明 */
    sources: string[];
    /** 数据许可或版权声明 */
    license: string[];
  };
}

export interface WeatherNow {
  /** 数据观测时间 */
  obsTime: string;
  /** 温度 */
  temp: string;
  /** 体感温度 */
  feelsLike: string;
  /** 天气状况的图标代码 */
  icon: string;
  /** 天气状况的文字描述 */
  text: string;
  /** 风向360角度 */
  wind360: string;
  /** 风向 */
  windDir: string;
  /** 风力等级 */
  windScale: string;
  /** 风速 */
  windSpeed: string;
  /** 相对湿度 */
  humidity: string;
  /** 当前小时累计降水量 */
  precip: string;
  /** 大气压强 */
  pressure: string;
  /** 能见度 */
  vis: string;
  /** 云量 */
  cloud: string;
  /** 露点温度 */
  dew: string;
}
