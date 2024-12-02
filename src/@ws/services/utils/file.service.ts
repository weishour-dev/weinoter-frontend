import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WsFileService {
  // ----------------------------------------------------------------------------
  // @ 公共方法
  // ----------------------------------------------------------------------------

  /**
   * Float32Array转WAV
   *
   * @param audioData
   * @param sampleRate
   */
  float32ArrayToWav(audioData: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(buffer);

    // 写入 WAV 标准头部信息
    this._writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * 2, true);
    this._writeString(view, 8, 'WAVE');
    this._writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM 格式
    view.setUint16(22, 1, true); // 单声道
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    this._writeString(view, 36, 'data');
    view.setUint32(40, audioData.length * 2, true); // 数据长度

    // PCM 数据
    for (let i = 0; i < audioData.length; i++) {
      const intSample = Math.max(-1, Math.min(1, audioData[i])) * 0x7fff;
      /* eslint-disable no-bitwise */
      view.setInt16(44 + i * 2, intSample | 0, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  /**
   * 下载WAV文件
   *
   * @param audioData
   * @param sampleRate
   */
  downloadWav(audioData: Float32Array, sampleRate: number) {
    const wavBlob = this.float32ArrayToWav(audioData, sampleRate);
    const url = URL.createObjectURL(wavBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'audio.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ----------------------------------------------------------------------------
  // @ 私有方法
  // ----------------------------------------------------------------------------

  private _writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
