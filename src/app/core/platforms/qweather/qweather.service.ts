import { Injectable } from '@angular/core';
import { Result } from '@ws/interfaces';
import { WsHttpService } from '@ws/services/http';
import { Routes } from 'app/core/config';
import { QweatherCommonDto, WeatherNowResult } from 'app/core/platforms/qweather';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QweatherService {
  apiPoint = Routes.platforms.qweather;

  constructor(private _wsHttpService: WsHttpService) {}

  /**
   * 城市天气 - 实时天气
   *
   * @param param
   * @returns Observable<WeatherNowResult>
   */
  weatherNow(param: QweatherCommonDto): Observable<WeatherNowResult> {
    return this._wsHttpService
      .get<Result<WeatherNowResult>>(`${this.apiPoint}/weather/now`, param, { toast: false })
      .pipe(map(result => result.data));
  }
}
