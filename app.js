/**
 * 二胡 数字譜スマートプレイヤー (Erhu Jianpu AI Player)
 * - WebAudioFont 実機サンプリング音源 (Fiddle / Violin / Cello) + 擦弦ポルタメント・ビブラート
 * - 二胡専用フィジカルシンセ音源 (フォールバック)
 * - DeepSeek API による数字譜スキャンPDF/画像の自動解析
 * - インタラクティブ譜面追従 & 運指・弦ビジュアライザー
 */

// 1. サンプル曲「邀請舞曲」（中国民間舞曲 1=G調 2/4拍子 中速 Moderato）
const DEMO_SONG = {
  title: "邀請舞曲",
  key: "1=G", // 1=G: 内弦開放(D4)=5., 外弦開放(A4)=2
  timeSignature: "2/4",
  tempo: 88,
  notes: [
    // 【A】小節 1: 5. 1 | 1 1 (前半タイ・付点リズム 5._1)
    { measure: 1, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.75, box: [17.5, 28.5, 5.0, 4.0] },
    { measure: 1, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "⊓", duration: 0.25, box: [21.5, 28.5, 4.5, 4.0] },
    { measure: 1, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "V", duration: 0.5,  box: [26.0, 28.5, 4.5, 4.0] },
    { measure: 1, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "⊓", duration: 0.5,  box: [30.5, 28.5, 4.5, 4.0] },

    // 小節 2: 7. 6. | 5.
    { measure: 2, jianpu: "7.", pitch: "F#4", midi: 66, string: "inner", finger: 2, bow: "V", duration: 0.5, box: [38.0, 28.5, 4.5, 4.0] },
    { measure: 2, jianpu: "6.", pitch: "E4",  midi: 64, string: "inner", finger: 1, bow: "⊓", duration: 0.5, box: [42.5, 28.5, 4.5, 4.0] },
    { measure: 2, jianpu: "5.", pitch: "D4",  midi: 62, string: "inner", finger: 0, bow: "V", duration: 1.0, box: [48.0, 28.5, 4.5, 4.0] },

    // 小節 3: 5. 2 | 2 2
    { measure: 3, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.5, box: [58.0, 28.5, 4.5, 4.0] },
    { measure: 3, jianpu: "2",  pitch: "A4", midi: 69, string: "outer", finger: 0, bow: "V", duration: 0.5, box: [62.5, 28.5, 4.5, 4.0] },
    { measure: 3, jianpu: "2",  pitch: "A4", midi: 69, string: "outer", finger: 0, bow: "⊓", duration: 0.5, box: [68.0, 28.5, 4.5, 4.0] },
    { measure: 3, jianpu: "2",  pitch: "A4", midi: 69, string: "outer", finger: 0, bow: "V", duration: 0.5, box: [73.0, 28.5, 4.5, 4.0] },

    // 小節 4: 3 2 | 1^
    { measure: 4, jianpu: "3",  pitch: "B4", midi: 71, string: "outer", finger: 1, bow: "⊓", duration: 0.5, box: [81.0, 28.5, 4.5, 4.0] },
    { measure: 4, jianpu: "2",  pitch: "A4", midi: 69, string: "outer", finger: 0, bow: "V", duration: 0.5, box: [86.0, 28.5, 4.5, 4.0] },
    { measure: 4, jianpu: "1^", pitch: "G5", midi: 79, string: "outer", finger: 3, bow: "⊓", duration: 1.0, box: [92.0, 28.5, 4.5, 4.0] },

    // 2段目 小節 5: 5. 1 | 1 1
    { measure: 5, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.75, box: [17.5, 37.0, 5.0, 4.0] },
    { measure: 5, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "⊓", duration: 0.25, box: [21.5, 37.0, 4.5, 4.0] },
    { measure: 5, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "V", duration: 0.5,  box: [26.0, 37.0, 4.5, 4.0] },
    { measure: 5, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "⊓", duration: 0.5,  box: [30.5, 37.0, 4.5, 4.0] },

    // 小節 6: 7. 6. | 5.
    { measure: 6, jianpu: "7.", pitch: "F#4", midi: 66, string: "inner", finger: 2, bow: "V", duration: 0.5, box: [38.0, 37.0, 4.5, 4.0] },
    { measure: 6, jianpu: "6.", pitch: "E4",  midi: 64, string: "inner", finger: 1, bow: "⊓", duration: 0.5, box: [42.5, 37.0, 4.5, 4.0] },
    { measure: 6, jianpu: "5.", pitch: "D4",  midi: 62, string: "inner", finger: 0, bow: "V", duration: 1.0, box: [48.0, 37.0, 4.5, 4.0] },

    // 小節 7: 5. 5. | 6. 7.
    { measure: 7, jianpu: "5.", pitch: "D4",  midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.5, box: [58.0, 37.0, 4.5, 4.0] },
    { measure: 7, jianpu: "5.", pitch: "D4",  midi: 62, string: "inner", finger: 0, bow: "V", duration: 0.5, box: [62.5, 37.0, 4.5, 4.0] },
    { measure: 7, jianpu: "6.", pitch: "E4",  midi: 64, string: "inner", finger: 1, bow: "⊓", duration: 0.5, box: [68.0, 37.0, 4.5, 4.0] },
    { measure: 7, jianpu: "7.", pitch: "F#4", midi: 66, string: "inner", finger: 2, bow: "V", duration: 0.5, box: [73.0, 37.0, 4.5, 4.0] },

    // 小節 8: 1 | 1
    { measure: 8, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "⊓", duration: 1.0, box: [82.5, 37.0, 4.5, 4.0] },
    { measure: 8, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "V", duration: 1.0, box: [92.0, 37.0, 4.5, 4.0] },

    // 【B】3段目 小節 9: 5. 5. 5. 5.
    { measure: 9, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.25, box: [17.5, 45.5, 4.0, 4.0] },
    { measure: 9, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "V", duration: 0.25, box: [21.5, 45.5, 4.0, 4.0] },
    { measure: 9, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.25, box: [25.5, 45.5, 4.0, 4.0] },
    { measure: 9, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "V", duration: 0.25, box: [29.5, 45.5, 4.0, 4.0] },

    // 小節 10: 6. 5. | 4.
    { measure: 10, jianpu: "6.", pitch: "E4", midi: 64, string: "inner", finger: 1, bow: "⊓", duration: 0.5, box: [38.0, 45.5, 4.5, 4.0] },
    { measure: 10, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "V", duration: 0.5, box: [42.5, 45.5, 4.5, 4.0] },
    { measure: 10, jianpu: "4.", pitch: "C4", midi: 60, string: "inner", finger: 0, bow: "⊓", duration: 1.0, box: [48.0, 45.5, 4.5, 4.0] },

    // 小節 11: 4. 5. | 6. 6.
    { measure: 11, jianpu: "4.", pitch: "C4", midi: 60, string: "inner", finger: 0, bow: "⊓", duration: 0.75, box: [58.0, 45.5, 4.5, 4.0] },
    { measure: 11, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "V", duration: 0.25, box: [63.0, 45.5, 4.0, 4.0] },
    { measure: 11, jianpu: "6.", pitch: "E4", midi: 64, string: "inner", finger: 1, bow: "⊓", duration: 0.5,  box: [68.0, 45.5, 4.5, 4.0] },
    { measure: 11, jianpu: "6.", pitch: "E4", midi: 64, string: "inner", finger: 1, bow: "V", duration: 0.5,  box: [73.0, 45.5, 4.5, 4.0] },

    // 小節 12: 5. 4. | 5.
    { measure: 12, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.5, box: [80.5, 45.5, 4.5, 4.0] },
    { measure: 12, jianpu: "4.", pitch: "C4", midi: 60, string: "inner", finger: 0, bow: "V", duration: 0.5, box: [85.5, 45.5, 4.5, 4.0] },
    { measure: 12, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 1.0, box: [91.5, 45.5, 4.5, 4.0] },

    // 4段目 小節 13: 2. 5. | 5. 5.
    { measure: 13, jianpu: "2.", pitch: "A3", midi: 57, string: "inner", finger: 0, bow: "⊓", duration: 0.75, box: [17.5, 54.5, 4.5, 4.0] },
    { measure: 13, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "V", duration: 0.25, box: [22.5, 54.5, 4.0, 4.0] },
    { measure: 13, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.5,  box: [26.5, 54.5, 4.5, 4.0] },
    { measure: 13, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "V", duration: 0.5,  box: [31.0, 54.5, 4.5, 4.0] },

    // 小節 14: 4. 3. | 2.
    { measure: 14, jianpu: "4.", pitch: "C4", midi: 60, string: "inner", finger: 0, bow: "⊓", duration: 0.5, box: [38.0, 54.5, 4.5, 4.0] },
    { measure: 14, jianpu: "3.", pitch: "B3", midi: 59, string: "inner", finger: 0, bow: "V", duration: 0.5, box: [42.5, 54.5, 4.5, 4.0] },
    { measure: 14, jianpu: "2.", pitch: "A3", midi: 57, string: "inner", finger: 0, bow: "⊓", duration: 1.0, box: [48.0, 54.5, 4.5, 4.0] },

    // 小節 15: 5. 4. | 3. 2.
    { measure: 15, jianpu: "5.", pitch: "D4", midi: 62, string: "inner", finger: 0, bow: "⊓", duration: 0.75, box: [58.0, 54.5, 4.5, 4.0] },
    { measure: 15, jianpu: "4.", pitch: "C4", midi: 60, string: "inner", finger: 0, bow: "V", duration: 0.25, box: [63.0, 54.5, 4.0, 4.0] },
    { measure: 15, jianpu: "3.", pitch: "B3", midi: 59, string: "inner", finger: 0, bow: "⊓", duration: 0.5,  box: [68.0, 54.5, 4.5, 4.0] },
    { measure: 15, jianpu: "2.", pitch: "A3", midi: 57, string: "inner", finger: 0, bow: "V", duration: 0.5,  box: [73.0, 54.5, 4.5, 4.0] },

    // 小節 16: 1 | 1
    { measure: 16, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "V", duration: 1.0, box: [82.0, 54.5, 4.5, 4.0] },
    { measure: 16, jianpu: "1",  pitch: "G4", midi: 67, string: "inner", finger: 3, bow: "⊓", duration: 1.0, box: [91.5, 54.5, 4.5, 4.0] }
  ]
};

// 2. 音名 -> MIDIノート番号 & 周波数テーブル
const PITCH_TO_MIDI = {
  "G3": 55, "G#3": 56, "A3": 57, "A#3": 58, "B3": 59,
  "C4": 60, "C#4": 61, "D4": 62, "D#4": 63, "E4": 64, "F4": 65, "F#4": 66, "G4": 67, "G#4": 68, "A4": 69, "A#4": 70, "B4": 71,
  "C5": 72, "C#5": 73, "D5": 74, "D#5": 75, "E5": 76, "F5": 77, "F#5": 78, "G5": 79, "G#5": 80, "A5": 81, "B5": 83, "C6": 84
};

function pitchToMidi(pitch) {
  return PITCH_TO_MIDI[pitch] || 60;
}

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// 3. 高品質サンプリング音源エンジン (WebAudioFont + Physical Erhu Model)
class AdvancedErhuAudioEngine {
  constructor() {
    this.ctx = null;
    this.player = null;
    this.mode = "soundfont_fiddle"; // 'soundfont_fiddle', 'soundfont_violin', 'erhu_synth', 'acoustic_simple'
    this.vibratoDepth = 70; // 0-100
    this.instruments = {};
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (!this.player && window.WebAudioFontPlayer) {
      this.player = new window.WebAudioFontPlayer();
      // Load & decode soundfonts if present in window
      if (window._tone_1100_GeneralUserGS_sf2_file) {
        this.player.loader.decodeAfterLoading(this.ctx, '_tone_1100_GeneralUserGS_sf2_file');
        this.instruments["soundfont_fiddle"] = window._tone_1100_GeneralUserGS_sf2_file;
      }
      if (window._tone_0401_FluidR3_GM_sf2_file) {
        this.player.loader.decodeAfterLoading(this.ctx, '_tone_0401_FluidR3_GM_sf2_file');
        this.instruments["soundfont_violin"] = window._tone_0401_FluidR3_GM_sf2_file;
      }
    }
  }

  playNote(pitch, durationSeconds, timeOffset = 0) {
    this.init();
    const midi = pitchToMidi(pitch);

    // 1. サウンドフォント（実機サンプリング音源）方式
    if (this.mode.startsWith("soundfont") && this.player && this.instruments[this.mode]) {
      this.playSoundFontNote(midi, durationSeconds, timeOffset);
      return;
    }

    // 2. 二胡専用フィジカルモデリング方式（フォールバック または 選択時）
    const freq = midiToFrequency(midi);
    const startTime = this.ctx.currentTime + timeOffset;

    if (this.mode === "acoustic_simple") {
      this.playAcousticSimple(freq, startTime, durationSeconds);
    } else {
      this.playErhuPhysicalModel(freq, startTime, durationSeconds);
    }
  }

  playSoundFontNote(midi, durationSeconds, timeOffset) {
    const instr = this.instruments[this.mode];
    if (!instr) return;

    // 音の立ち上がりとサステインを二胡の擦弦らしく滑らかに調整
    const volume = 0.85;
    const when = this.ctx.currentTime + timeOffset;

    // WebAudioFont で実機サンプル波形を再生
    const envelope = this.player.queueWaveTable(
      this.ctx,
      this.ctx.destination,
      instr,
      when,
      midi,
      durationSeconds,
      volume
    );

    // サウンドフォント演奏時にも二胡独特の揉弦（ビブラート）を微細にかける
    if (envelope && this.vibratoDepth > 0 && envelope.audioBufferSourceNode) {
      try {
        const detuneNode = envelope.audioBufferSourceNode.detune;
        if (detuneNode) {
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.frequency.setValueAtTime(5.4, when); // 二胡の自然な揉弦周期
          lfoGain.gain.setValueAtTime((this.vibratoDepth / 100) * 18, when); // セント単位
          lfo.connect(lfoGain);
          lfoGain.connect(detuneNode);
          lfo.start(when + 0.08);
          lfo.stop(when + durationSeconds);
        }
      } catch (e) {
        // Safe fallback if detune not exposed directly
      }
    }
  }

  playErhuPhysicalModel(freq, startTime, duration) {
    const ctx = this.ctx;

    // 二胡の弓と2本の弦（絹弦または金属弦）の摩擦音・倍音構造を精密シミュレート
    // 基音 + 偶数/奇数倍音を複数合成
    const oscMain = ctx.createOscillator();
    const oscHarmonic1 = ctx.createOscillator();
    const oscHarmonic2 = ctx.createOscillator();

    oscMain.type = "sawtooth";
    oscHarmonic1.type = "triangle";
    oscHarmonic2.type = "sine";

    oscMain.frequency.setValueAtTime(freq, startTime);
    oscHarmonic1.frequency.setValueAtTime(freq * 2, startTime);
    oscHarmonic2.frequency.setValueAtTime(freq * 3, startTime);

    // 二胡のポルタメント（打音・スライド・指の滑り）
    oscMain.frequency.setValueAtTime(freq * 0.985, startTime);
    oscMain.frequency.exponentialRampToValueAtTime(freq, startTime + 0.035);

    // 揉弦 (ビブラート LFO)
    const vibratoLfo = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    vibratoLfo.frequency.setValueAtTime(5.3, startTime);
    const depthHz = (this.vibratoDepth / 100) * (freq * 0.018); // 音高に応じた揺れ
    vibratoGain.gain.setValueAtTime(depthHz, startTime);
    vibratoLfo.connect(oscMain.frequency);
    vibratoLfo.connect(oscHarmonic1.frequency);
    vibratoLfo.start(startTime + 0.08); // アタック後に自然に揉弦が入る

    // 二胡の共鳴胴（蛇皮 + 木製六角胴）フォルマントフィルター (約800Hz & 2200Hz)
    const bodyFilter1 = ctx.createBiquadFilter();
    bodyFilter1.type = "peaking";
    bodyFilter1.frequency.setValueAtTime(850, startTime);
    bodyFilter1.Q.setValueAtTime(3.0, startTime);
    bodyFilter1.gain.setValueAtTime(6, startTime);

    const bodyFilter2 = ctx.createBiquadFilter();
    bodyFilter2.type = "peaking";
    bodyFilter2.frequency.setValueAtTime(2100, startTime);
    bodyFilter2.Q.setValueAtTime(4.0, startTime);
    bodyFilter2.gain.setValueAtTime(8, startTime);

    // 高域カット（弓の滑らかさ）
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(3800, startTime);

    // エンベロープ (弓のアタック・サステイン・リリース)
    const gainNode = ctx.createGain();
    const attack = 0.04;
    const release = 0.09;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(0.65, startTime + attack);
    gainNode.gain.setValueAtTime(0.60, startTime + duration - release);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // ノイズ（松脂・弓の摩擦アタック）
    const noise = this.createBowingNoise(startTime);

    // 接続
    oscMain.connect(bodyFilter1);
    oscHarmonic1.connect(bodyFilter1);
    oscHarmonic2.connect(bodyFilter1);
    bodyFilter1.connect(bodyFilter2);
    bodyFilter2.connect(lowpass);
    lowpass.connect(gainNode);
    if (noise) noise.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscMain.start(startTime);
    oscHarmonic1.start(startTime);
    oscHarmonic2.start(startTime);

    oscMain.stop(startTime + duration);
    oscHarmonic1.stop(startTime + duration);
    oscHarmonic2.stop(startTime + duration);
    vibratoLfo.stop(startTime + duration);
  }

  createBowingNoise(startTime) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05 * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.start(startTime);
    noise.stop(startTime + 0.04);
    return noise;
  }

  playAcousticSimple(freq, startTime, duration) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.01, startTime);
    gain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playMetronomeClick(startTime, isStrong = false) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(isStrong ? 1200 : 800, startTime);
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.03);
  }
}

// 4. アプリケーション本体 & DeepSeek API連携
class ErhuApp {
  constructor() {
    this.audio = new AdvancedErhuAudioEngine();
    this.song = JSON.parse(JSON.stringify(DEMO_SONG));
    this.currentNoteIndex = 0;
    this.isPlaying = false;
    this.isLooping = false;
    this.playbackTimer = null;
    this.zoom = 1.0;
    this.showHighlight = true;
    this.currentImageBase64 = null; // Stored image for DeepSeek Vision API

    this.initDom();
    this.bindEvents();
    this.loadStoredApiKey();
    this.renderNoteChips();
    this.updateCurrentNoteDisplay(0);
    this.updateZoom();
    this.prepareDefaultImageBase64();
  }

  initDom() {
    // Playback buttons
    this.btnPlay = document.getElementById("btnPlay");
    this.btnStop = document.getElementById("btnStop");
    this.btnPrev = document.getElementById("btnPrev");
    this.btnNext = document.getElementById("btnNext");
    this.btnLoop = document.getElementById("btnLoop");
    this.tempoSlider = document.getElementById("tempoSlider");
    this.tempoValue = document.getElementById("tempoValue");
    this.soundSelect = document.getElementById("soundSelect");
    this.vibratoDepth = document.getElementById("vibratoDepth");
    this.metroToggle = document.getElementById("metroToggle");
    this.progressBar = document.getElementById("progressBarContainer");
    this.progressFill = document.getElementById("progressFill");
    this.timeCurrent = document.getElementById("timeCurrent");
    this.timeTotal = document.getElementById("timeTotal");

    // Sheet View
    this.sheetImage = document.getElementById("sheetImage");
    this.pdfCanvas = document.getElementById("pdfCanvas");
    this.noteCursor = document.getElementById("noteCursor");
    this.canvasWrapper = document.getElementById("canvasWrapper");
    this.fileInput = document.getElementById("fileInput");
    this.demoSongBtn = document.getElementById("demoSongBtn");

    this.zoomInBtn = document.getElementById("zoomInBtn");
    this.zoomOutBtn = document.getElementById("zoomOutBtn");
    this.zoomLevel = document.getElementById("zoomLevel");
    this.toggleOverlayBtn = document.getElementById("toggleOverlayBtn");

    // Monitor display
    this.curJianpu = document.getElementById("curJianpu");
    this.curPitch = document.getElementById("curPitch");
    this.curFinger = document.getElementById("curFinger");
    this.curBow = document.getElementById("curBow");
    this.curMeasure = document.getElementById("curMeasure");

    this.innerFingers = document.querySelectorAll("#innerStringLane .finger-marker");
    this.outerFingers = document.querySelectorAll("#outerStringLane .finger-marker");
    this.notesChipContainer = document.getElementById("notesChipContainer");
    this.addNoteBtn = document.getElementById("addNoteBtn");
    this.toggleEditBtn = document.getElementById("toggleEditBtn");
    this.jsonEditorWrapper = document.getElementById("jsonEditorWrapper");
    this.jsonText = document.getElementById("jsonText");
    this.applyJsonBtn = document.getElementById("applyJsonBtn");

    // Mobile Tabs
    this.mainContent = document.getElementById("mainContent");
    this.tabSheetBtn = document.getElementById("tabSheetBtn");
    this.tabMonitorBtn = document.getElementById("tabMonitorBtn");

    // Initialize default tab class
    if (this.mainContent) {
      this.mainContent.classList.add("tab-sheet");
    }

    // DeepSeek Modal
    this.deepseekModalBtn = document.getElementById("deepseekModalBtn");
    this.deepseekModal = document.getElementById("deepseekModal");
    this.closeModalBtn = document.getElementById("closeModalBtn");
    this.cancelModalBtn = document.getElementById("cancelModalBtn");
    this.runAiBtn = document.getElementById("runAiBtn");
    this.apiKeyInput = document.getElementById("apiKeyInput");
    this.modelSelect = document.getElementById("modelSelect");
    this.targetSheetName = document.getElementById("targetSheetName");
    this.aiProgressArea = document.getElementById("aiProgressArea");
    this.aiProgressText = document.getElementById("aiProgressText");
    this.aiErrorArea = document.getElementById("aiErrorArea");
  }

  bindEvents() {
    this.btnPlay.addEventListener("click", () => this.togglePlay());
    this.btnStop.addEventListener("click", () => this.stop());
    this.btnPrev.addEventListener("click", () => this.step(-1));
    this.btnNext.addEventListener("click", () => this.step(1));
    this.btnLoop.addEventListener("click", () => {
      this.isLooping = !this.isLooping;
      this.btnLoop.classList.toggle("active", this.isLooping);
    });

    this.tempoSlider.addEventListener("input", (e) => {
      this.song.tempo = parseInt(e.target.value, 10);
      this.tempoValue.textContent = this.song.tempo;
      this.updateTotalDurationDisplay();
    });

    this.soundSelect.addEventListener("change", (e) => {
      this.audio.mode = e.target.value;
    });

    this.vibratoDepth.addEventListener("input", (e) => {
      this.audio.vibratoDepth = parseInt(e.target.value, 10);
    });

    this.progressBar.addEventListener("click", (e) => {
      const rect = this.progressBar.getBoundingClientRect();
      const clickRatio = (e.clientX - rect.left) / rect.width;
      const targetIndex = Math.floor(clickRatio * this.song.notes.length);
      this.jumpToNote(targetIndex);
    });

    this.zoomInBtn.addEventListener("click", () => {
      this.zoom = Math.min(2.0, this.zoom + 0.15);
      this.updateZoom();
    });
    this.zoomOutBtn.addEventListener("click", () => {
      this.zoom = Math.max(0.6, this.zoom - 0.15);
      this.updateZoom();
    });

    this.toggleOverlayBtn.addEventListener("click", () => {
      this.showHighlight = !this.showHighlight;
      this.toggleOverlayBtn.classList.toggle("active", this.showHighlight);
      this.toggleOverlayBtn.textContent = this.showHighlight ? "🎯 ハイライトON" : "ハイライトOFF";
      this.noteCursor.classList.toggle("hidden", !this.showHighlight);
    });

    this.demoSongBtn.addEventListener("click", () => {
      this.loadSong(JSON.parse(JSON.stringify(DEMO_SONG)));
      this.sheetImage.classList.remove("hidden");
      this.pdfCanvas.classList.add("hidden");
      this.sheetImage.src = "page_0.png";
      this.targetSheetName.textContent = "教本スキャン画像 (page_0.png)";
      this.prepareDefaultImageBase64();
    });

    this.fileInput.addEventListener("change", (e) => this.handleFileUpload(e));

    // Mobile tab clicks
    if (this.tabSheetBtn && this.tabMonitorBtn) {
      this.tabSheetBtn.addEventListener("click", () => {
        this.tabSheetBtn.classList.add("active");
        this.tabMonitorBtn.classList.remove("active");
        this.mainContent.classList.remove("tab-monitor");
        this.mainContent.classList.add("tab-sheet");
      });

      this.tabMonitorBtn.addEventListener("click", () => {
        this.tabMonitorBtn.classList.add("active");
        this.tabSheetBtn.classList.remove("active");
        this.mainContent.classList.remove("tab-sheet");
        this.mainContent.classList.add("tab-monitor");
      });
    }

    this.toggleEditBtn.addEventListener("click", () => {
      const isHidden = this.jsonEditorWrapper.classList.toggle("hidden");
      if (!isHidden) {
        this.jsonText.value = JSON.stringify(this.song, null, 2);
      }
    });

    this.applyJsonBtn.addEventListener("click", () => {
      try {
        const parsed = JSON.parse(this.jsonText.value);
        this.loadSong(parsed);
        this.jsonEditorWrapper.classList.add("hidden");
        alert("楽譜データを正常に更新しました！");
      } catch (err) {
        alert("JSONの構文に誤りがあります: " + err.message);
      }
    });

    // Add note button
    this.addNoteBtn.addEventListener("click", () => {
      const newNote = {
        measure: (this.song.notes[this.song.notes.length - 1]?.measure || 1),
        jianpu: "1",
        pitch: "G4",
        midi: 67,
        string: "inner",
        finger: 3,
        bow: "⊓",
        duration: 0.5,
        box: [20, 30, 4.5, 4.0]
      };
      this.song.notes.push(newNote);
      this.renderNoteChips();
      this.jumpToNote(this.song.notes.length - 1);
    });

    // DeepSeek Modal triggers
    this.deepseekModalBtn.addEventListener("click", () => {
      this.deepseekModal.classList.remove("hidden");
      this.aiErrorArea.classList.add("hidden");
      this.aiProgressArea.classList.add("hidden");
    });

    this.closeModalBtn.addEventListener("click", () => {
      this.deepseekModal.classList.add("hidden");
    });
    this.cancelModalBtn.addEventListener("click", () => {
      this.deepseekModal.classList.add("hidden");
    });

    this.runAiBtn.addEventListener("click", () => this.runDeepSeekRecognition());

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === "ArrowLeft") {
        this.step(-1);
      } else if (e.code === "ArrowRight") {
        this.step(1);
      }
    });
  }

  loadStoredApiKey() {
    const key = localStorage.getItem("deepseek_api_key");
    if (key) {
      this.apiKeyInput.value = key;
    }
  }

  async prepareDefaultImageBase64() {
    try {
      const response = await fetch("page_0.png");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        this.currentImageBase64 = reader.result;
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      console.warn("Could not pre-load page_0.png as base64", e);
    }
  }

  loadSong(songData) {
    this.stop();
    this.song = songData;
    this.tempoSlider.value = this.song.tempo || 88;
    this.tempoValue.textContent = this.song.tempo || 88;
    document.getElementById("sheetInfoText").textContent = `曲名: ${this.song.title || "無題"} (${this.song.key || "1=G"}, ${this.song.timeSignature || "2/4"})`;
    this.renderNoteChips();
    this.jumpToNote(0);
    this.updateTotalDurationDisplay();
  }

  renderNoteChips() {
    this.notesChipContainer.innerHTML = "";
    this.song.notes.forEach((note, idx) => {
      const chip = document.createElement("div");
      chip.className = "note-chip";
      chip.textContent = `${note.jianpu} (${note.pitch})`;
      chip.dataset.index = idx;
      chip.addEventListener("click", () => {
        this.jumpToNote(idx);
        const beatSec = 60 / (this.song.tempo || 88);
        this.audio.playNote(note.pitch, (note.duration || 0.5) * beatSec);
      });
      this.notesChipContainer.appendChild(chip);
    });
    this.updateTotalDurationDisplay();
  }

  updateZoom() {
    this.canvasWrapper.style.transform = `scale(${this.zoom})`;
    this.zoomLevel.textContent = `${Math.round(this.zoom * 100)}%`;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.audio.init();
    this.isPlaying = true;
    this.btnPlay.textContent = "⏸";
    this.btnPlay.title = "一時停止";
    this.scheduleNextNote();
  }

  pause() {
    this.isPlaying = false;
    this.btnPlay.textContent = "▶";
    this.btnPlay.title = "再生";
    if (this.playbackTimer) clearTimeout(this.playbackTimer);
  }

  stop() {
    this.pause();
    this.jumpToNote(0);
  }

  step(direction) {
    const nextIdx = this.currentNoteIndex + direction;
    if (nextIdx >= 0 && nextIdx < this.song.notes.length) {
      this.jumpToNote(nextIdx);
      const note = this.song.notes[nextIdx];
      const beatSeconds = 60 / (this.song.tempo || 88);
      this.audio.playNote(note.pitch, (note.duration || 0.5) * beatSeconds);
    }
  }

  jumpToNote(index) {
    this.currentNoteIndex = Math.max(0, Math.min(index, this.song.notes.length - 1));
    this.updateCurrentNoteDisplay(this.currentNoteIndex);
    this.updateProgress();
  }

  scheduleNextNote() {
    if (!this.isPlaying) return;

    if (this.currentNoteIndex >= this.song.notes.length) {
      if (this.isLooping) {
        this.currentNoteIndex = 0;
      } else {
        this.stop();
        return;
      }
    }

    const note = this.song.notes[this.currentNoteIndex];
    const beatSeconds = 60 / (this.song.tempo || 88);
    const durationSeconds = (note.duration || 0.5) * beatSeconds;

    // Metronome
    if (this.metroToggle.checked && note.jianpu !== "0") {
      this.audio.playMetronomeClick(this.audio.ctx.currentTime, this.currentNoteIndex % 2 === 0);
    }

    // Play note with advanced engine
    this.audio.playNote(note.pitch, durationSeconds);
    this.updateCurrentNoteDisplay(this.currentNoteIndex);
    this.updateProgress();

    // Schedule next
    this.playbackTimer = setTimeout(() => {
      this.currentNoteIndex++;
      this.scheduleNextNote();
    }, durationSeconds * 1000);
  }

  updateCurrentNoteDisplay(index) {
    const note = this.song.notes[index];
    if (!note) return;

    // 1. Text display
    this.curJianpu.textContent = note.jianpu;
    const stringName = note.string === "inner" ? "内弦" : "外弦";
    this.curPitch.textContent = `${note.pitch} (${stringName})`;
    this.curFinger.textContent = `${note.finger} (${note.finger === 0 ? "開放弦" : note.finger + "指"})`;
    this.curBow.textContent = note.bow === "⊓" ? "⊓ (引き弓)" : (note.bow === "V" ? "V (押し弓)" : "−");
    this.curMeasure.textContent = `第 ${note.measure || 1} 小節`;

    // 2. Erhu string & finger visualizer
    this.innerFingers.forEach(f => f.classList.remove("active"));
    this.outerFingers.forEach(f => f.classList.remove("active"));

    const targetMarkers = note.string === "inner" ? this.innerFingers : this.outerFingers;
    targetMarkers.forEach(m => {
      if (parseInt(m.dataset.finger, 10) === note.finger) {
        m.classList.add("active");
      }
    });

    // 3. Score sheet highlight overlay box
    if (note.box && this.showHighlight) {
      const [left, top, width, height] = note.box;
      this.noteCursor.classList.remove("hidden");
      this.noteCursor.style.left = `${left}%`;
      this.noteCursor.style.top = `${top}%`;
      this.noteCursor.style.width = `${width}%`;
      this.noteCursor.style.height = `${height}%`;
    } else {
      this.noteCursor.classList.add("hidden");
    }

    // 4. Update note chips highlight
    const chips = this.notesChipContainer.children;
    for (let i = 0; i < chips.length; i++) {
      chips[i].classList.toggle("active", i === index);
      if (i === index) {
        chips[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }

  updateProgress() {
    const ratio = this.currentNoteIndex / Math.max(1, this.song.notes.length - 1);
    this.progressFill.style.width = `${ratio * 100}%`;

    const beatSeconds = 60 / (this.song.tempo || 88);
    let currentSec = 0;
    for (let i = 0; i < this.currentNoteIndex; i++) {
      currentSec += (this.song.notes[i]?.duration || 1) * beatSeconds;
    }
    this.timeCurrent.textContent = this.formatTime(currentSec);
  }

  updateTotalDurationDisplay() {
    const beatSeconds = 60 / (this.song.tempo || 88);
    let totalSec = 0;
    for (const n of this.song.notes) {
      totalSec += (n.duration || 1) * beatSeconds;
    }
    this.timeTotal.textContent = this.formatTime(totalSec);
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Handle PDF or Image Upload
  async handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    this.targetSheetName.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

    if (file.type === "application/pdf") {
      await this.renderPdf(file);
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.sheetImage.src = event.target.result;
        this.currentImageBase64 = event.target.result;
        this.sheetImage.classList.remove("hidden");
        this.pdfCanvas.classList.add("hidden");
      };
      reader.readAsDataURL(file);
    }
  }

  async renderPdf(file) {
    try {
      const fileData = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: fileData }).promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = this.pdfCanvas;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;

      this.currentImageBase64 = canvas.toDataURL("image/png");
      this.sheetImage.classList.add("hidden");
      this.pdfCanvas.classList.remove("hidden");
      alert(`PDFを読み込みました（全${pdf.numPages}ページ中 1ページ目を表示）。\n「🤖 DeepSeekで譜面解析」から自動演奏データを生成できます！`);
    } catch (err) {
      console.error(err);
      alert("PDFの読み込みに失敗しました: " + err.message);
    }
  }

  // DeepSeek API Recognition
  async runDeepSeekRecognition() {
    const apiKey = this.apiKeyInput.value.trim();
    if (!apiKey) {
      this.showAiError("DeepSeek APIキーを入力してください。");
      return;
    }

    localStorage.setItem("deepseek_api_key", apiKey);

    if (!this.currentImageBase64) {
      this.showAiError("解析対象の楽譜画像またはPDFが読み込まれていません。");
      return;
    }

    this.aiErrorArea.classList.add("hidden");
    this.aiProgressArea.classList.remove("hidden");
    this.runAiBtn.disabled = true;
    this.aiProgressText.textContent = "DeepSeek APIに接続中... (二胡数字譜を解析中)";

    try {
      const model = this.modelSelect.value;
      const systemPrompt = `あなたは中国伝統楽器「二胡（Erhu）」の専門家および楽譜（数字譜・簡譜/Jianpu）の解析AIです。
画像で与えられた二胡の数字譜を解析し、ブラウザで演奏可能なJSONデータを出力してください。

【出力要件】
必ず以下のJSONスキーマに完全準拠した純粋なJSONオブジェクトのみを出力してください（説明文やMarkdownの前置きは不要）:
{
  "title": "曲名 (文字列)",
  "key": "調号 (例: 1=G, 1=D, 1=F)",
  "timeSignature": "拍子 (例: 2/4, 4/4, 3/4)",
  "tempo": 88,
  "notes": [
    {
      "measure": 1,
      "jianpu": "5.", // 数字譜表記 (低音ドットは「5.」、高音ドットは「1^」、休符は「0」)
      "pitch": "D4",  // 英語音名 (C4, D4, E4, F#4, G4, A4, B4, C5, D5 など)
      "string": "inner", // "inner" (内弦) または "outer" (外弦)
      "finger": 0,    // 0(開放弦), 1(人差指), 2(中指), 3(薬指), 4(小指)
      "bow": "⊓",     // "⊓" (引き弓) または "V" (押し弓)
      "duration": 0.5, // 拍数 (四分音符=1.0, 八分音符=0.5, 十六分音符=0.25, 二分音符=2.0)
      "box": [17.5, 28.5, 4.5, 4.0] // [left, top, width, height] 画像上のパーセンテージ概算座標 (0〜100)
    }
  ]
}`;

      // DeepSeek API Request
      // base_url: https://api.deepseek.com/chat/completions
      const requestPayload = {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "この二胡の数字譜画像を解析し、すべての小節・音符を漏れなくJSON形式で抽出してください。"
              },
              {
                type: "image_url",
                image_url: {
                  url: this.currentImageBase64
                }
              }
            ]
          }
        ],
        temperature: 0.1
      };

      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`APIエラー (${response.status}): ${errorText}`);
      }

      const resData = await response.json();
      const content = resData.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("DeepSeekからの応答内容が空でした。");
      }

      // JSON抽出
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AIの応答からJSONデータを抽出できませんでした:\n" + content);
      }

      const parsedSong = JSON.parse(jsonMatch[0]);
      if (!parsedSong.notes || !Array.isArray(parsedSong.notes)) {
        throw new Error("生成されたJSONに 'notes' 配列が含まれていません。");
      }

      // 成功！曲データを読み込む
      this.loadSong(parsedSong);
      this.deepseekModal.classList.add("hidden");
      alert(`🎉 DeepSeekにより楽譜が正常に解析されました！\n曲名: ${parsedSong.title || "不明"}\n認識音符数: ${parsedSong.notes.length}音\n再生ボタン（▶）を押すと演奏が始まります。`);

    } catch (err) {
      console.error(err);
      this.showAiError(err.message);
    } finally {
      this.aiProgressArea.classList.add("hidden");
      this.runAiBtn.disabled = false;
    }
  }

  showAiError(msg) {
    this.aiErrorArea.textContent = msg;
    this.aiErrorArea.classList.remove("hidden");
  }
}

// 起動
window.addEventListener("DOMContentLoaded", () => {
  window.erhuApp = new ErhuApp();
});
