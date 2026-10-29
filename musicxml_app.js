/**
 * 二胡 数字譜 ➔ MusicXML コンバーター & エディタ (JavaScript Engine)
 * - PDF/画像のレンダリング (PDF.js)
 * - DeepSeek API による数字譜高精度解析 ➔ MusicXML 3.1 生成
 * - OpenSheetMusicDisplay (OSMD) による五線譜リアルタイムレンダリング
 * - 音符テーブルエディタ ＆ XMLコード直接エディタの双方向同期
 * - MusicXMLダウンロード (.musicxml) & クリップボードコピー
 * - ブラウザWebAudioによる簡易メロディ試聴再生
 */

// 1. サンプルデータ: 邀請舞曲 (1=G, 2/4拍子) の音符データ
const SAMPLE_NOTES_DATA = [
  // 小節 1: 5. 1 | 1 1 (付点八分5., 十六分1, 八分1, 八分1)
  { measure: 1, jianpu: "5.", step: "D", octave: 4, alter: 0, durationType: "eighth", dot: true, isRest: false, string: "inner", finger: 0, bow: "⊓" },
  { measure: 1, jianpu: "1",  step: "G", octave: 4, alter: 0, durationType: "16th",   dot: false, isRest: false, string: "inner", finger: 3, bow: "⊓" },
  { measure: 1, jianpu: "1",  step: "G", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 3, bow: "V" },
  { measure: 1, jianpu: "1",  step: "G", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 3, bow: "⊓" },

  // 小節 2: 7. 6. | 5. (八分7., 八分6., 四分5.)
  { measure: 2, jianpu: "7.", step: "F", octave: 4, alter: 1, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 2, bow: "V" },
  { measure: 2, jianpu: "6.", step: "E", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 1, bow: "⊓" },
  { measure: 2, jianpu: "5.", step: "D", octave: 4, alter: 0, durationType: "quarter", dot: false, isRest: false, string: "inner", finger: 0, bow: "V" },

  // 小節 3: 5. 2 | 2 2
  { measure: 3, jianpu: "5.", step: "D", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 0, bow: "⊓" },
  { measure: 3, jianpu: "2",  step: "A", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "outer", finger: 0, bow: "V" },
  { measure: 3, jianpu: "2",  step: "A", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "outer", finger: 0, bow: "⊓" },
  { measure: 3, jianpu: "2",  step: "A", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "outer", finger: 0, bow: "V" },

  // 小節 4: 3 2 | 1^
  { measure: 4, jianpu: "3",  step: "B", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "outer", finger: 1, bow: "⊓" },
  { measure: 4, jianpu: "2",  step: "A", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "outer", finger: 0, bow: "V" },
  { measure: 4, jianpu: "1^", step: "G", octave: 5, alter: 0, durationType: "quarter", dot: false, isRest: false, string: "outer", finger: 3, bow: "⊓" },

  // 小節 5: 5. 1 | 1 1
  { measure: 5, jianpu: "5.", step: "D", octave: 4, alter: 0, durationType: "eighth", dot: true, isRest: false, string: "inner", finger: 0, bow: "⊓" },
  { measure: 5, jianpu: "1",  step: "G", octave: 4, alter: 0, durationType: "16th",   dot: false, isRest: false, string: "inner", finger: 3, bow: "⊓" },
  { measure: 5, jianpu: "1",  step: "G", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 3, bow: "V" },
  { measure: 5, jianpu: "1",  step: "G", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 3, bow: "⊓" },

  // 小節 6: 7. 6. | 5.
  { measure: 6, jianpu: "7.", step: "F", octave: 4, alter: 1, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 2, bow: "V" },
  { measure: 6, jianpu: "6.", step: "E", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 1, bow: "⊓" },
  { measure: 6, jianpu: "5.", step: "D", octave: 4, alter: 0, durationType: "quarter", dot: false, isRest: false, string: "inner", finger: 0, bow: "V" },

  // 小節 7: 5. 5. | 6. 7.
  { measure: 7, jianpu: "5.", step: "D", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 0, bow: "⊓" },
  { measure: 7, jianpu: "5.", step: "D", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 0, bow: "V" },
  { measure: 7, jianpu: "6.", step: "E", octave: 4, alter: 0, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 1, bow: "⊓" },
  { measure: 7, jianpu: "7.", step: "F", octave: 4, alter: 1, durationType: "eighth", dot: false, isRest: false, string: "inner", finger: 2, bow: "V" },

  // 小節 8: 1 | 1
  { measure: 8, jianpu: "1",  step: "G", octave: 4, alter: 0, durationType: "half",    dot: false, isRest: false, string: "inner", finger: 3, bow: "⊓" }
];

// 音価に対応する division 比率 (divisions = 4: quarter = 4)
const DURATION_DIVISIONS = {
  "16th": 1,
  "eighth": 2,
  "quarter": 4,
  "half": 8,
  "whole": 16
};

// 調号定義
const KEY_SIGNATURES = {
  "1=C": { fifths: 0, mode: "major" },
  "1=G": { fifths: 1, mode: "major" },
  "1=D": { fifths: 2, mode: "major" },
  "1=A": { fifths: 3, mode: "major" },
  "1=E": { fifths: 4, mode: "major" },
  "1=F": { fifths: -1, mode: "major" },
  "1=Bb": { fifths: -2, mode: "major" }
};

// 各調号における数字譜(1〜7)から音名(step, alter, 標準octave)へのマッピング
const JIANPU_SCALE_MAP = {
  "1=D": {
    "1": { step: "D", alter: 0, octave: 4, string: "inner", finger: 0 },
    "2": { step: "E", alter: 0, octave: 4, string: "inner", finger: 1 },
    "3": { step: "F", alter: 1, octave: 4, string: "inner", finger: 2 },
    "4": { step: "G", alter: 0, octave: 4, string: "inner", finger: 3 },
    "5": { step: "A", alter: 0, octave: 4, string: "outer", finger: 0 },
    "6": { step: "B", alter: 0, octave: 4, string: "outer", finger: 1 },
    "7": { step: "C", alter: 1, octave: 5, string: "outer", finger: 2 }
  },
  "1=G": {
    "1": { step: "G", alter: 0, octave: 4, string: "inner", finger: 3 },
    "2": { step: "A", alter: 0, octave: 4, string: "outer", finger: 0 },
    "3": { step: "B", alter: 0, octave: 4, string: "outer", finger: 1 },
    "4": { step: "C", alter: 0, octave: 5, string: "outer", finger: 2 },
    "5": { step: "D", alter: 0, octave: 5, string: "outer", finger: 3 },
    "6": { step: "E", alter: 0, octave: 5, string: "outer", finger: 4 },
    "7": { step: "F", alter: 1, octave: 5, string: "outer", finger: 4 }
  },
  "1=F": {
    "1": { step: "F", alter: 0, octave: 4, string: "inner", finger: 2 },
    "2": { step: "G", alter: 0, octave: 4, string: "inner", finger: 3 },
    "3": { step: "A", alter: 0, octave: 4, string: "outer", finger: 0 },
    "4": { step: "B", alter: -1, octave: 4, string: "outer", finger: 1 },
    "5": { step: "C", alter: 0, octave: 5, string: "outer", finger: 2 },
    "6": { step: "D", alter: 0, octave: 5, string: "outer", finger: 3 },
    "7": { step: "E", alter: 0, octave: 5, string: "outer", finger: 4 }
  },
  "1=C": {
    "1": { step: "C", alter: 0, octave: 5, string: "outer", finger: 2 },
    "2": { step: "D", alter: 0, octave: 5, string: "outer", finger: 3 },
    "3": { step: "E", alter: 0, octave: 5, string: "outer", finger: 4 },
    "4": { step: "F", alter: 0, octave: 5, string: "outer", finger: 1 },
    "5": { step: "G", alter: 0, octave: 5, string: "outer", finger: 2 },
    "6": { step: "A", alter: 0, octave: 5, string: "outer", finger: 3 },
    "7": { step: "B", alter: 0, octave: 5, string: "outer", finger: 4 }
  },
  "1=Bb": {
    "1": { step: "B", alter: -1, octave: 4, string: "outer", finger: 1 },
    "2": { step: "C", alter: 0, octave: 5, string: "outer", finger: 2 },
    "3": { step: "D", alter: 0, octave: 5, string: "outer", finger: 3 },
    "4": { step: "E", alter: -1, octave: 5, string: "outer", finger: 4 },
    "5": { step: "F", alter: 0, octave: 5, string: "inner", finger: 2 },
    "6": { step: "G", alter: 0, octave: 5, string: "inner", finger: 3 },
    "7": { step: "A", alter: 0, octave: 5, string: "outer", finger: 0 }
  },
  "1=A": {
    "1": { step: "A", alter: 0, octave: 4, string: "outer", finger: 0 },
    "2": { step: "B", alter: 0, octave: 4, string: "outer", finger: 1 },
    "3": { step: "C", alter: 1, octave: 5, string: "outer", finger: 2 },
    "4": { step: "D", alter: 0, octave: 5, string: "outer", finger: 3 },
    "5": { step: "E", alter: 0, octave: 5, string: "outer", finger: 4 },
    "6": { step: "F", alter: 1, octave: 5, string: "outer", finger: 1 },
    "7": { step: "G", alter: 1, octave: 5, string: "outer", finger: 2 }
  },
  "1=E": {
    "1": { step: "E", alter: 0, octave: 4, string: "inner", finger: 1 },
    "2": { step: "F", alter: 1, octave: 4, string: "inner", finger: 2 },
    "3": { step: "G", alter: 1, octave: 4, string: "inner", finger: 3 },
    "4": { step: "A", alter: 0, octave: 4, string: "outer", finger: 0 },
    "5": { step: "B", alter: 0, octave: 4, string: "outer", finger: 1 },
    "6": { step: "C", alter: 1, octave: 5, string: "outer", finger: 2 },
    "7": { step: "D", alter: 1, octave: 5, string: "outer", finger: 3 }
  }
};

class ErhuMusicXmlApp {
  constructor() {
    this.currentPdfDoc = null;
    this.currentImageBase64 = null;
    this.notes = JSON.parse(JSON.stringify(SAMPLE_NOTES_DATA));
    this.meta = {
      title: "邀請舞曲",
      key: "1=G",
      timeSignature: "2/4",
      tempo: 88
    };
    this.osmd = null;
    this.isPlaying = false;
    this.playbackTimer = null;
    this.audioCtx = null;
    this.scoreZoom = window.innerWidth <= 640 ? 0.75 : (window.innerWidth <= 1024 ? 0.88 : 1.0);
    this.resizeTimer = null;

    this.initElements();
    if (this.scoreZoomVal) {
      this.scoreZoomVal.textContent = `${Math.round(this.scoreZoom * 100)}%`;
    }
    this.initEventListeners();
    this.initOSMD();
    this.loadInitialPdfPreview();
    this.loadApiKey();
    this.loadGDriveLibrary();
    this.renderNoteTable();
    this.renderOSMD();
    if (this.xmlCodeArea) {
      this.xmlCodeArea.value = this.generateMusicXml();
    }
    this.checkUrlParamsForGDrive();
  }

  initElements() {
    // Header & Modals
    this.btnOpenApiModal = document.getElementById("btnOpenApiModal");
    this.btnCloseApiModal = document.getElementById("btnCloseApiModal");
    this.btnSaveApiKey = document.getElementById("btnSaveApiKey");
    this.apiModal = document.getElementById("apiModal");
    this.selectAiProvider = document.getElementById("selectAiProvider");
    this.geminiConfigGroup = document.getElementById("geminiConfigGroup");
    this.deepseekConfigGroup = document.getElementById("deepseekConfigGroup");
    this.inputGeminiApiKey = document.getElementById("inputGeminiApiKey");
    this.selectGeminiModel = document.getElementById("selectGeminiModel");
    this.inputApiKey = document.getElementById("inputApiKey");
    this.selectAiModel = document.getElementById("selectAiModel");

    this.btnShowHelp = document.getElementById("btnShowHelp");
    this.btnCloseHelpModal = document.getElementById("btnCloseHelpModal");
    this.btnCloseHelpModalBtn = document.getElementById("btnCloseHelpModalBtn");
    this.helpModal = document.getElementById("helpModal");

    // Google Drive Modal & Elements
    this.btnOpenGDriveModal = document.getElementById("btnOpenGDriveModal");
    this.gdriveModal = document.getElementById("gdriveModal");
    this.btnCloseGDriveModal = document.getElementById("btnCloseGDriveModal");
    this.btnCloseGDriveModalBtn = document.getElementById("btnCloseGDriveModalBtn");
    this.inputGDriveUrl = document.getElementById("inputGDriveUrl");
    this.inputGDriveTitle = document.getElementById("inputGDriveTitle");
    this.btnLoadGDriveUrl = document.getElementById("btnLoadGDriveUrl");
    this.gdriveLoadStatus = document.getElementById("gdriveLoadStatus");
    this.gdriveLibraryList = document.getElementById("gdriveLibraryList");
    this.inputGDriveFolderUrl = document.getElementById("inputGDriveFolderUrl");
    this.btnSaveGDriveFolder = document.getElementById("btnSaveGDriveFolder");
    this.linkOpenGDriveFolder = document.getElementById("linkOpenGDriveFolder");

    // Source preview
    this.fileInput = document.getElementById("fileInput");
    this.musicXmlFileInput = document.getElementById("musicXmlFileInput");
    this.btnLoadSample = document.getElementById("btnLoadSample");
    this.pdfCanvas = document.getElementById("pdfCanvas");
    this.imagePreview = document.getElementById("imagePreview");
    this.fileNameLabel = document.getElementById("fileNameLabel");
    this.pageInfoLabel = document.getElementById("pageInfoLabel");
    this.btnAnalyzeDeepSeek = document.getElementById("btnAnalyzeDeepSeek");
    this.analyzeBtnText = document.getElementById("analyzeBtnText");

    // Target tabs
    this.tabButtons = document.querySelectorAll(".tab-btn");
    this.tabContents = {
      renderedScore: document.getElementById("tabRenderedScore"),
      noteTable: document.getElementById("tabNoteTable"),
      xmlEditor: document.getElementById("tabXmlEditor")
    };

    // Score Rendering
    this.osmdCanvas = document.getElementById("osmdCanvas");
    this.scorePlaceholder = document.getElementById("scorePlaceholder");
    this.btnLoadSampleXml = document.getElementById("btnLoadSampleXml");
    this.btnPlayScore = document.getElementById("btnPlayScore");
    this.btnStopScore = document.getElementById("btnStopScore");
    this.playbackTempo = document.getElementById("playbackTempo");
    this.tempoDisplay = document.getElementById("tempoDisplay");
    this.btnZoomIn = document.getElementById("btnZoomIn");
    this.btnZoomOut = document.getElementById("btnZoomOut");
    this.scoreZoomVal = document.getElementById("scoreZoomVal");

    // Note Table
    this.noteTableBody = document.getElementById("noteTableBody");
    this.metaTitle = document.getElementById("metaTitle");
    this.metaKey = document.getElementById("metaKey");
    this.metaTime = document.getElementById("metaTime");
    this.btnAddNoteRow = document.getElementById("btnAddNoteRow");
    this.btnApplyTableChanges = document.getElementById("btnApplyTableChanges");

    // XML Editor
    this.xmlCodeArea = document.getElementById("xmlCodeArea");
    this.btnFormatXml = document.getElementById("btnFormatXml");
    this.btnApplyXmlCode = document.getElementById("btnApplyXmlCode");

    // Export & Download
    this.btnCopyXml = document.getElementById("btnCopyXml");
    this.btnDownloadXml = document.getElementById("btnDownloadXml");
    this.exportStatusText = document.getElementById("exportStatusText");

    // Loading overlay
    this.aiLoadingOverlay = document.getElementById("aiLoadingOverlay");
    this.aiStatusTitle = document.getElementById("aiStatusTitle");
    this.aiStatusMessage = document.getElementById("aiStatusMessage");
  }

  initEventListeners() {
    // AI Provider Switcher
    if (this.selectAiProvider) {
      this.selectAiProvider.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "gemini") {
          this.geminiConfigGroup.classList.remove("hidden");
          this.deepseekConfigGroup.classList.add("hidden");
          if (this.analyzeBtnText) this.analyzeBtnText.textContent = "GeminiでMusicXMLを生成";
        } else {
          this.geminiConfigGroup.classList.add("hidden");
          this.deepseekConfigGroup.classList.remove("hidden");
          if (this.analyzeBtnText) this.analyzeBtnText.textContent = "DeepSeekでMusicXMLを生成";
        }
      });
    }

    // API Modal
    this.btnOpenApiModal.addEventListener("click", () => this.apiModal.classList.remove("hidden"));
    this.btnCloseApiModal.addEventListener("click", () => this.apiModal.classList.add("hidden"));
    this.btnSaveApiKey.addEventListener("click", () => {
      const provider = this.selectAiProvider ? this.selectAiProvider.value : "gemini";
      localStorage.setItem("ai_provider", provider);

      // Save Gemini configs
      const geminiKey = this.inputGeminiApiKey.value.trim();
      const geminiModel = this.selectGeminiModel.value;
      localStorage.setItem("gemini_api_key", geminiKey);
      localStorage.setItem("gemini_model", geminiModel);

      // Save DeepSeek configs
      const dsKey = this.inputApiKey.value.trim();
      const dsModel = this.selectAiModel.value;
      localStorage.setItem("deepseek_api_key", dsKey);
      localStorage.setItem("deepseek_model", dsModel);

      this.apiModal.classList.add("hidden");
      this.updateAnalyzeButtonLabel();
      alert(`AI設定を保存しました（現在の優先: ${provider === "gemini" ? "Google Gemini" : "DeepSeek"}）`);
    });

    // Help Modal
    this.btnShowHelp.addEventListener("click", () => this.helpModal.classList.remove("hidden"));
    this.btnCloseHelpModal.addEventListener("click", () => this.helpModal.classList.add("hidden"));
    this.btnCloseHelpModalBtn.addEventListener("click", () => this.helpModal.classList.add("hidden"));

    // Google Drive Modal
    if (this.btnOpenGDriveModal && this.gdriveModal) {
      this.btnOpenGDriveModal.addEventListener("click", () => {
        this.renderGDriveLibraryList();
        this.gdriveModal.classList.remove("hidden");
      });
    }
    if (this.btnCloseGDriveModal) {
      this.btnCloseGDriveModal.addEventListener("click", () => this.gdriveModal.classList.add("hidden"));
    }
    if (this.btnCloseGDriveModalBtn) {
      this.btnCloseGDriveModalBtn.addEventListener("click", () => this.gdriveModal.classList.add("hidden"));
    }
    if (this.btnLoadGDriveUrl) {
      this.btnLoadGDriveUrl.addEventListener("click", () => {
        const url = this.inputGDriveUrl ? this.inputGDriveUrl.value.trim() : "";
        const title = this.inputGDriveTitle ? this.inputGDriveTitle.value.trim() : "";
        this.loadMusicXmlFromGDrive(url, title, true);
      });
    }
    if (this.btnSaveGDriveFolder) {
      this.btnSaveGDriveFolder.addEventListener("click", () => {
        const folderUrl = this.inputGDriveFolderUrl ? this.inputGDriveFolderUrl.value.trim() : "";
        if (folderUrl) {
          localStorage.setItem("erhu_gdrive_folder_url", folderUrl);
          if (this.linkOpenGDriveFolder) this.linkOpenGDriveFolder.href = folderUrl;
          alert("共有GoogleドライブのフォルダURLを保存しました！");
        }
      });
    }

    // File Input (PDF / Image)
    this.fileInput.addEventListener("change", (e) => this.handleFileUpload(e));
    this.btnLoadSample.addEventListener("click", () => {
      this.loadInitialPdfPreview();
      this.loadSampleData();
    });

    // Responsive resize handler for OSMD & DevTools device switching
    window.addEventListener("resize", () => {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (this.osmd && this.tabContents.renderedScore && this.tabContents.renderedScore.classList.contains("active")) {
          try {
            this.osmd.render();
          } catch (e) {
            // Ignore transient resize errors
          }
        }
      }, 200);
    });

    // Unlock WebAudio on first touch/click for iOS / iPadOS / Android
    const unlockAudio = () => {
      this.initAudio();
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("touchstart", unlockAudio, { passive: true });
    window.addEventListener("click", unlockAudio, { passive: true });

    // MusicXML File Import (.musicxml / .xml)
    if (this.musicXmlFileInput) {
      this.musicXmlFileInput.addEventListener("change", (e) => this.handleMusicXmlImport(e));
    }

    // AI Analyze Button
    this.btnAnalyzeDeepSeek.addEventListener("click", () => this.runAiMusicXmlConversion());

    // Tabs
    this.tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.tabButtons.forEach(b => b.classList.remove("active"));
        Object.values(this.tabContents).forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        const tabKey = btn.dataset.tab;
        if (this.tabContents[tabKey]) {
          this.tabContents[tabKey].classList.add("active");
          if (tabKey === "renderedScore") {
            this.renderOSMD();
          } else if (tabKey === "noteTable") {
            this.renderNoteTable();
          } else if (tabKey === "xmlEditor") {
            this.xmlCodeArea.value = this.generateMusicXml();
          }
        }
      });
    });

    // Sample XML Load button
    this.btnLoadSampleXml.addEventListener("click", () => {
      this.loadSampleData();
    });

    // Playback
    this.btnPlayScore.addEventListener("click", () => this.togglePlayback());
    this.btnStopScore.addEventListener("click", () => this.stopPlayback());
    this.playbackTempo.addEventListener("input", (e) => {
      this.meta.tempo = parseInt(e.target.value, 10);
      this.tempoDisplay.textContent = `${this.meta.tempo} BPM`;
    });

    // Zoom
    this.btnZoomIn.addEventListener("click", () => this.adjustZoom(0.15));
    this.btnZoomOut.addEventListener("click", () => this.adjustZoom(-0.15));

    // Note Table Actions
    this.btnAddNoteRow.addEventListener("click", () => this.addNoteRow());
    this.btnApplyTableChanges.addEventListener("click", () => this.applyTableToXml());
    if (this.metaKey) {
      this.metaKey.addEventListener("change", () => {
        this.meta.key = this.normalizeKey(this.metaKey.value);
        this.normalizeAllNotes(true);
        this.renderNoteTable();
      });
    }

    // XML Editor Actions
    this.btnApplyXmlCode.addEventListener("click", () => this.applyXmlCode());
    this.btnFormatXml.addEventListener("click", () => this.formatXmlInEditor());

    // Export & Download
    this.btnCopyXml.addEventListener("click", () => this.copyXmlToClipboard());
    this.btnDownloadXml.addEventListener("click", () => this.downloadMusicXmlFile());
  }

  loadApiKey() {
    const provider = localStorage.getItem("ai_provider") || "gemini";
    if (this.selectAiProvider) this.selectAiProvider.value = provider;

    const geminiKey = localStorage.getItem("gemini_api_key");
    const geminiModel = localStorage.getItem("gemini_model") || "gemini-2.5-flash";
    if (geminiKey && this.inputGeminiApiKey) this.inputGeminiApiKey.value = geminiKey;
    if (geminiModel && this.selectGeminiModel) this.selectGeminiModel.value = geminiModel;

    const dsKey = localStorage.getItem("deepseek_api_key");
    const dsModel = localStorage.getItem("deepseek_model") || "deepseek-chat";
    if (dsKey && this.inputApiKey) this.inputApiKey.value = dsKey;
    if (dsModel && this.selectAiModel) this.selectAiModel.value = dsModel;

    // Toggle modal section display
    if (provider === "gemini") {
      if (this.geminiConfigGroup) this.geminiConfigGroup.classList.remove("hidden");
      if (this.deepseekConfigGroup) this.deepseekConfigGroup.classList.add("hidden");
    } else {
      if (this.geminiConfigGroup) this.geminiConfigGroup.classList.add("hidden");
      if (this.deepseekConfigGroup) this.deepseekConfigGroup.classList.remove("hidden");
    }

    this.updateAnalyzeButtonLabel();
  }

  updateAnalyzeButtonLabel() {
    const provider = localStorage.getItem("ai_provider") || (this.selectAiProvider ? this.selectAiProvider.value : "gemini");
    if (this.analyzeBtnText) {
      this.analyzeBtnText.textContent = provider === "gemini" ? "GeminiでMusicXMLを生成" : "DeepSeekでMusicXMLを生成";
    }
  }

  // Handle direct import of MusicXML (.musicxml, .xml) files
  async handleMusicXmlImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const xmlText = await file.text();
      if (!xmlText.includes("<score-partwise") && !xmlText.includes("<score-timewise")) {
        throw new Error("選択されたファイルは有効なMusicXML形式（<score-partwise>）ではありません。");
      }
      await this.loadDirectMusicXml(xmlText, file.name);
      alert(`✅ MusicXMLファイル「${file.name}」を正常にインポートしました！`);
    } catch (err) {
      alert("MusicXMLの読み込みに失敗しました: " + err.message);
    } finally {
      e.target.value = ""; // Reset file input
    }
  }

  // Google Drive Shared File & Library Management
  extractGDriveFileId(urlOrId) {
    if (!urlOrId) return null;
    const str = String(urlOrId).trim();
    // Match /file/d/FILE_ID or /d/FILE_ID
    const fileMatch = str.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
    if (fileMatch) return fileMatch[1];
    // Match ?id=FILE_ID or &id=FILE_ID
    const idParamMatch = str.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
    if (idParamMatch) return idParamMatch[1];
    // Raw file ID
    if (/^[a-zA-Z0-9_-]{18,}$/.test(str)) return str;
    return null;
  }

  loadGDriveLibrary() {
    try {
      const saved = localStorage.getItem("erhu_gdrive_library");
      this.gdriveLibrary = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.gdriveLibrary = [];
    }
    const folderUrl = localStorage.getItem("erhu_gdrive_folder_url");
    if (folderUrl) {
      if (this.inputGDriveFolderUrl) this.inputGDriveFolderUrl.value = folderUrl;
      if (this.linkOpenGDriveFolder) this.linkOpenGDriveFolder.href = folderUrl;
    }
    this.renderGDriveLibraryList();
  }

  saveGDriveLibraryItem(fileId, title, originalUrl) {
    if (!this.gdriveLibrary) this.gdriveLibrary = [];
    const existingIdx = this.gdriveLibrary.findIndex(item => item.fileId === fileId);
    const entry = {
      fileId,
      title: title || "Googleドライブ楽譜",
      url: originalUrl || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      updatedAt: new Date().toLocaleDateString("ja-JP")
    };
    if (existingIdx >= 0) {
      this.gdriveLibrary[existingIdx] = entry;
    } else {
      this.gdriveLibrary.unshift(entry);
    }
    localStorage.setItem("erhu_gdrive_library", JSON.stringify(this.gdriveLibrary));
    this.renderGDriveLibraryList();
  }

  deleteGDriveLibraryItem(fileId) {
    this.gdriveLibrary = (this.gdriveLibrary || []).filter(item => item.fileId !== fileId);
    localStorage.setItem("erhu_gdrive_library", JSON.stringify(this.gdriveLibrary));
    this.renderGDriveLibraryList();
  }

  copyShareableAppUrl(fileId, title) {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?gdrive=${encodeURIComponent(fileId)}&title=${encodeURIComponent(title || "")}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert(`🔗 練習メンバー共有用のダイレクト読込URLをコピーしました！\n\n${shareUrl}\n\nこのURLをLINEやメールで共有すると、開いた瞬間にGoogleドライブから「${title || "楽譜"}」が自動読み込みされます。`);
    }).catch(() => {
      prompt("以下の共有用URLをコピーしてください:", shareUrl);
    });
  }

  renderGDriveLibraryList() {
    if (!this.gdriveLibraryList) return;
    if (!this.gdriveLibrary || this.gdriveLibrary.length === 0) {
      this.gdriveLibraryList.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 14px;">
          まだ登録された共有ファイルはありません。<br>上の欄からGoogleドライブの共有リンクを読み込むと、ここに自動登録され次回から1クリックで開けます。
        </div>`;
      return;
    }

    this.gdriveLibraryList.innerHTML = this.gdriveLibrary.map((item, idx) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.07); gap: 8px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 150px;">
          <strong style="color: var(--accent-gold); font-size: 0.92rem;">🎵 ${this.escapeXml(item.title)}</strong>
          <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 6px;">(${item.updatedAt || ""})</span>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button class="btn btn-xs btn-primary" onclick="window.musicXmlApp.loadMusicXmlFromGDrive('${item.fileId}', '${this.escapeXml(item.title)}', false)">🎼 読込</button>
          <button class="btn btn-xs btn-secondary" title="開くだけでこの曲が自動読込される共有URLをコピー" onclick="window.musicXmlApp.copyShareableAppUrl('${item.fileId}', '${this.escapeXml(item.title)}')">🔗 共有URL</button>
          <a href="${this.escapeXml(item.url)}" target="_blank" rel="noopener" class="btn btn-xs btn-ghost" title="Googleドライブで元ファイルを開く" style="text-decoration:none;">↗</a>
          <button class="btn btn-xs btn-ghost" title="リストから削除" onclick="window.musicXmlApp.deleteGDriveLibraryItem('${item.fileId}')">🗑</button>
        </div>
      </div>
    `).join("");
  }

  async fetchWithTimeout(url, timeoutMs = 4500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async fetchGDriveFileText(fileId, rawInputUrl) {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const userContentUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;
    const geminiKey = localStorage.getItem("gemini_api_key") || (this.inputGeminiApiKey ? this.inputGeminiApiKey.value.trim() : "");

    const candidateFetchers = [];
    // 1. If direct raw XML URL was pasted (e.g. GitHub / web server / direct CORS link)
    if (rawInputUrl && /^https?:\/\//i.test(rawInputUrl) && !rawInputUrl.includes("drive.google.com")) {
      candidateFetchers.push(async () => {
        const r = await this.fetchWithTimeout(rawInputUrl, 5000);
        return r.ok ? await r.text() : null;
      });
    }
    // 2. Google Drive API v3 (supports CORS natively when API key has Drive API enabled)
    if (geminiKey && fileId) {
      candidateFetchers.push(async () => {
        const r = await this.fetchWithTimeout(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${geminiKey}`, 4500);
        return r.ok ? await r.text() : null;
      });
    }
    // 3. AllOrigins JSON wrapper (handles Google Drive 302 redirects cleanly with CORS *)
    if (fileId) {
      candidateFetchers.push(async () => {
        const r = await this.fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(downloadUrl)}`, 5000);
        if (!r.ok) return null;
        const data = await r.json();
        if (!data || !data.contents) return null;
        // Handle base64 data URI if returned by allorigins
        if (data.contents.startsWith("data:")) {
          const base64Part = data.contents.split(",")[1];
          if (base64Part) {
            const binStr = atob(base64Part);
            const bytes = Uint8Array.from(binStr, c => c.charCodeAt(0));
            return new TextDecoder("utf-8").decode(bytes);
          }
        }
        return data.contents;
      });
      candidateFetchers.push(async () => {
        const r = await this.fetchWithTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(userContentUrl)}`, 4500);
        return r.ok ? await r.text() : null;
      });
      candidateFetchers.push(async () => {
        const r = await this.fetchWithTimeout(`https://corsproxy.io/?url=${encodeURIComponent(downloadUrl)}`, 4500);
        return r.ok ? await r.text() : null;
      });
      candidateFetchers.push(async () => {
        const r = await this.fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(downloadUrl)}`, 4500);
        return r.ok ? await r.text() : null;
      });
    }

    let permissionError = false;
    for (const fetcher of candidateFetchers) {
      try {
        const text = await fetcher();
        if (!text) continue;
        if (text.includes("<score-partwise") || text.includes("<score-timewise")) {
          return text;
        }
        if (text.includes("accounts.google.com") || text.includes("ServiceLogin") || text.includes("<!DOCTYPE html>")) {
          permissionError = true;
        }
      } catch (err) {
        // Continue to next fallback
      }
    }

    if (permissionError) {
      throw new Error("Googleドライブの共有権限が「制限付き」になっているか、フォルダのURLが指定されています。\n・ファイルの共有設定を『一般的なアクセス：リンクを知っている全員』に変更するか、\n・下の「📁 端末／Googleドライブアプリからファイルを選択」から直接 .musicxml ファイルを選択してください。");
    }
    throw new Error("ブラウザのセキュリティ制限(CORS)または通信エラーによりURLから直接取得できませんでした。\n下の「📁 端末／Googleドライブアプリからファイルを選択」ボタンから、Googleドライブ内の .musicxml ファイルを直接選択してください（100%確実に読み込めます）。");
  }

  async loadMusicXmlFromGDrive(urlOrId, customTitle = "", saveToList = true) {
    if (!urlOrId) {
      alert("Googleドライブの共有リンク（URL）またはファイルIDを入力してください。");
      return;
    }

    if (String(urlOrId).includes("/folders/")) {
      if (this.inputGDriveFolderUrl) this.inputGDriveFolderUrl.value = urlOrId;
      localStorage.setItem("erhu_gdrive_folder_url", urlOrId);
      if (this.linkOpenGDriveFolder) this.linkOpenGDriveFolder.href = urlOrId;
      if (this.gdriveLoadStatus) {
        this.gdriveLoadStatus.innerHTML = `💡 入力されたURLは<strong>「フォルダ」</strong>のURLです。共有フォルダとして登録しました！<br>ファイルを読み込むには、下の<strong>「📁 端末／Googleドライブアプリからファイルを選択」</strong>を押すか、個別ファイルの共有リンクを貼り付けてください。`;
        this.gdriveLoadStatus.classList.remove("hidden");
      }
      return;
    }

    const fileId = this.extractGDriveFileId(urlOrId);
    if (!fileId && !/^https?:\/\//i.test(urlOrId)) {
      alert("有効なGoogleドライブのファイル共有URL（例: https://drive.google.com/file/d/XXXX/view?usp=sharing）を入力してください。");
      return;
    }

    if (this.gdriveLoadStatus) {
      this.gdriveLoadStatus.textContent = "⏳ GoogleドライブからMusicXMLデータを読み込んでいます...";
      this.gdriveLoadStatus.classList.remove("hidden");
    }

    try {
      const xmlText = await this.fetchGDriveFileText(fileId, urlOrId);
      const displayName = customTitle || "Googleドライブ共有楽譜";
      await this.loadDirectMusicXml(xmlText, displayName);

      const finalTitle = customTitle || this.meta.title || "Googleドライブ共有楽譜";
      if (customTitle) {
        this.meta.title = customTitle;
        if (this.metaTitle) this.metaTitle.value = customTitle;
      }

      if (fileId && saveToList) {
        this.saveGDriveLibraryItem(fileId, finalTitle, urlOrId);
      }

      if (this.gdriveLoadStatus) {
        this.gdriveLoadStatus.textContent = `✅ 「${finalTitle}」を読み込みました！`;
      }
      if (this.gdriveModal) {
        this.gdriveModal.classList.add("hidden");
      }
    } catch (err) {
      if (this.gdriveLoadStatus) {
        this.gdriveLoadStatus.innerHTML = `⚠️ ${err.message.replace(/\n/g, "<br>")}`;
        this.gdriveLoadStatus.classList.remove("hidden");
      }
      // Do not use blocking alert() if playback is currently running so we never freeze audio
      if (!this.isPlaying && this.gdriveModal && this.gdriveModal.classList.contains("hidden")) {
        alert("Googleドライブからの読み込み案内:\n" + err.message);
      }
    }
  }

  checkUrlParamsForGDrive() {
    try {
      const params = new URLSearchParams(window.location.search);
      const gdriveId = params.get("gdrive");
      const title = params.get("title") || "";
      if (gdriveId) {
        setTimeout(() => {
          this.loadMusicXmlFromGDrive(gdriveId, title, true);
        }, 400);
      }
    } catch (e) {
      console.warn("URL param check warning:", e);
    }
  }

  async loadDirectMusicXml(xmlText, fileName = "インポート楽譜") {
    this.rawImportedXml = xmlText;
    this.fileNameLabel.textContent = `${fileName} (MusicXML直接インポート)`;
    this.pageInfoLabel.textContent = "MusicXML";

    // Extract title if present
    const titleMatch = xmlText.match(/<work-title>([\s\S]*?)<\/work-title>/i);
    if (titleMatch && titleMatch[1]) {
      this.meta.title = titleMatch[1].trim();
      if (this.metaTitle) this.metaTitle.value = this.meta.title;
    }

    // Try extracting key
    const fifthsMatch = xmlText.match(/<fifths>([-\d]+)<\/fifths>/i);
    if (fifthsMatch) {
      const fifths = parseInt(fifthsMatch[1], 10);
      const keyMap = { 0: "1=C", 1: "1=G", 2: "1=D", 3: "1=A", 4: "1=E", "-1": "1=F", "-2": "1=Bb" };
      this.meta.key = keyMap[fifths] || "1=D";
      if (this.metaKey) this.metaKey.value = this.meta.key;
    }

    // Parse MusicXML notes into this.notes so Note Table & Playback stay in sync
    this.parseMusicXmlToNotes(xmlText);

    // Update XML Editor
    if (this.xmlCodeArea) {
      this.xmlCodeArea.value = xmlText;
    }

    // Render directly in OSMD
    if (!this.osmd) this.initOSMD();
    await this.osmd.load(xmlText);
    this.osmd.zoom = this.scoreZoom;
    this.osmd.render();

    if (this.scorePlaceholder) {
      this.scorePlaceholder.classList.add("hidden");
    }
    this.exportStatusText.textContent = `楽譜描画完了 (MusicXMLインポート): ${this.meta.title}`;
  }

  // Parse MusicXML string into internal notes array & metadata
  parseMusicXmlToNotes(xmlText) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");
      if (xmlDoc.querySelector("parsererror")) return;

      // Time signature
      const beatsEl = xmlDoc.querySelector("time > beats");
      const beatTypeEl = xmlDoc.querySelector("time > beat-type");
      if (beatsEl && beatTypeEl) {
        this.meta.timeSignature = this.normalizeTimeSignature(`${beatsEl.textContent.trim()}/${beatTypeEl.textContent.trim()}`);
        if (this.metaTime) this.metaTime.value = this.meta.timeSignature;
      }

      // Tempo
      const soundTempoEl = xmlDoc.querySelector("sound[tempo]");
      const perMinEl = xmlDoc.querySelector("metronome > per-minute");
      if (soundTempoEl && soundTempoEl.getAttribute("tempo")) {
        this.meta.tempo = parseInt(soundTempoEl.getAttribute("tempo"), 10) || 88;
      } else if (perMinEl && perMinEl.textContent) {
        this.meta.tempo = parseInt(perMinEl.textContent.trim(), 10) || 88;
      }
      if (this.playbackTempo) this.playbackTempo.value = this.meta.tempo;
      if (this.tempoDisplay) this.tempoDisplay.textContent = `${this.meta.tempo} BPM`;

      // Parse first part (melody) into note table
      const firstPart = xmlDoc.querySelector("part");
      if (!firstPart) return;

      const parsedNotes = [];
      let currentDivisions = 1;
      const measures = firstPart.querySelectorAll("measure");
      measures.forEach((measureEl, mIdx) => {
        const measureNum = parseInt(measureEl.getAttribute("number"), 10) || (mIdx + 1);
        const divEl = measureEl.querySelector("attributes > divisions");
        if (divEl && divEl.textContent) {
          currentDivisions = parseInt(divEl.textContent.trim(), 10) || currentDivisions;
        }

        // Iterate direct children of measure and stop if <backup> is encountered (skip secondary voices in same part)
        let hitBackup = false;
        Array.from(measureEl.children).forEach(childEl => {
          const tag = childEl.tagName ? childEl.tagName.toLowerCase() : "";
          if (tag === "backup") {
            hitBackup = true;
            return;
          }
          if (hitBackup || tag !== "note") return;
          const noteEl = childEl;

          // Skip secondary chord notes, grace notes, or voice !== 1
          if (noteEl.querySelector("chord") || noteEl.querySelector("grace")) return;
          const voiceEl = noteEl.querySelector("voice");
          if (voiceEl && voiceEl.textContent.trim() !== "1") return;

          const isRest = !!noteEl.querySelector("rest");
          const durEl = noteEl.querySelector("duration");
          const rawDur = durEl ? parseFloat(durEl.textContent.trim()) : null;
          const exactBeats = (rawDur !== null && currentDivisions > 0) ? (rawDur / currentDivisions) : null;

          // If this note is the continuation of a tie (<tie type="stop"/> without <tie type="start"/>), add its beats to the previous note so playback never breaks!
          const tieStop = noteEl.querySelector('tie[type="stop"], tied[type="stop"]');
          const tieStart = noteEl.querySelector('tie[type="start"], tied[type="start"]');
          if (tieStop && !tieStart && parsedNotes.length > 0) {
            const prevNote = parsedNotes[parsedNotes.length - 1];
            if (!prevNote.isRest) {
              prevNote.beats = (prevNote.beats || 1.0) + (exactBeats || 1.0);
              return;
            }
          }

          const typeEl = noteEl.querySelector("type");
          const rawType = typeEl ? typeEl.textContent.trim().toLowerCase() : "";
          let durationType = "quarter";
          if (rawType.includes("16")) durationType = "16th";
          else if (rawType.includes("eighth") || rawType.includes("8")) durationType = "eighth";
          else if (rawType.includes("quarter")) durationType = "quarter";
          else if (rawType.includes("half")) durationType = "half";
          else if (rawType.includes("whole")) durationType = "whole";
          else if (exactBeats !== null) {
            if (exactBeats <= 0.3) durationType = "16th";
            else if (exactBeats <= 0.6) durationType = "eighth";
            else if (exactBeats <= 1.6) durationType = "quarter";
            else if (exactBeats <= 3.2) durationType = "half";
            else durationType = "whole";
          }

          const dot = !!noteEl.querySelector("dot");
          const downBow = !!noteEl.querySelector("down-bow");
          const upBow = !!noteEl.querySelector("up-bow");
          const bow = downBow ? "⊓" : (upBow ? "V" : "");

          const fingerEl = noteEl.querySelector("fingering");
          const finger = fingerEl ? (parseInt(fingerEl.textContent.trim(), 10) || 0) : 0;

          const stringEl = noteEl.querySelector("string");
          const stringVal = stringEl && stringEl.textContent.trim() === "2" ? "outer" : "inner";

          if (isRest) {
            parsedNotes.push({
              measure: measureNum,
              jianpu: "0",
              step: "rest",
              octave: 4,
              alter: 0,
              durationType,
              dot,
              beats: exactBeats,
              isRest: true,
              string: stringVal,
              finger: 0,
              bow
            });
          } else {
            const stepEl = noteEl.querySelector("pitch > step");
            const alterEl = noteEl.querySelector("pitch > alter");
            const octaveEl = noteEl.querySelector("pitch > octave");
            const accEl = noteEl.querySelector("accidental");

            let step = stepEl ? stepEl.textContent.trim().toUpperCase() : "D";
            let alter = alterEl ? (parseInt(alterEl.textContent.trim(), 10) || 0) : null;
            let octave = octaveEl ? (parseInt(octaveEl.textContent.trim(), 10) || 4) : 4;

            // If alter was omitted in XML, check accidental tag or key signature diatonic defaults
            if (alter === null) {
              if (accEl) {
                const accText = accEl.textContent.trim().toLowerCase();
                if (accText === "sharp") alter = 1;
                else if (accText === "flat") alter = -1;
                else alter = 0;
              } else {
                alter = this.getDefaultAlterForKey(step, this.meta.key);
              }
            }

            // Ensure pitch is not below Erhu's physical lowest note D4 (MIDI 62)
            const semitones = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
            let midiVal = 12 * (octave + 1) + (semitones[step] ?? 0) + (alter || 0);
            if (midiVal < 62) {
              octave += 1;
              midiVal += 12;
            }

            const jianpu = this.pitchToJianpu(step, alter, octave, this.meta.key);
            const erhuPos = this.getErhuPositionByPitch(step, alter, octave);

            parsedNotes.push({
              measure: measureNum,
              jianpu,
              step,
              octave,
              alter,
              durationType,
              dot,
              beats: exactBeats,
              isRest: false,
              string: erhuPos.string,
              finger: erhuPos.finger,
              bow: bow || "⊓"
            });
          }
        });
      });

      if (parsedNotes.length > 0) {
        this.notes = parsedNotes;
        this.renderNoteTable();
      }
    } catch (e) {
      console.warn("Could not parse MusicXML into note table:", e);
    }
  }

  // Get default diatonic alter for a step in a given key (when <alter> is omitted)
  getDefaultAlterForKey(step, key) {
    const normKey = this.normalizeKey(key);
    const scale = JIANPU_SCALE_MAP[normKey];
    if (!scale) return 0;
    for (const deg of Object.values(scale)) {
      if (deg.step === step) return deg.alter;
    }
    return 0;
  }

  // Convert (step, alter, octave, key) -> Jianpu string (e.g. "3" for F#4 in 1=D)
  pitchToJianpu(step, alter, octave, key) {
    const normKey = this.normalizeKey(key);
    const scale = JIANPU_SCALE_MAP[normKey] || JIANPU_SCALE_MAP["1=D"];
    const semitones = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
    const targetMidi = 12 * (octave + 1) + (semitones[step] ?? 0) + (alter || 0);

    // Find closest degree in scale
    for (let deg = 1; deg <= 7; deg++) {
      const info = scale[String(deg)];
      const baseMidi = 12 * (info.octave + 1) + semitones[info.step] + info.alter;
      const diff = targetMidi - baseMidi;
      const mod = ((diff % 12) + 12) % 12;
      if (mod === 0) {
        const octShift = Math.round(diff / 12);
        if (octShift < 0) return `${deg}${".".repeat(Math.abs(octShift))}`;
        if (octShift > 0) return `${deg}${"^".repeat(octShift)}`;
        return String(deg);
      }
    }
    // Fallback if chromatic accidental note
    for (let deg = 1; deg <= 7; deg++) {
      const info = scale[String(deg)];
      if (info.step === step) {
        const octShift = octave - info.octave;
        const prefix = alter > info.alter ? "#" : (alter < info.alter ? "b" : "");
        const suffix = octShift < 0 ? "." : (octShift > 0 ? "^" : "");
        return `${prefix}${deg}${suffix}`;
      }
    }
    return "1";
  }

  // Physical Erhu 1st-position string (inner=D4, outer=A4) and finger (0-4) from sounding pitch
  getErhuPositionByPitch(step, alter = 0, octave = 4) {
    const semitones = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
    const midi = 12 * ((parseInt(octave, 10) || 4) + 1) + (semitones[step] ?? 2) + (parseInt(alter, 10) || 0);

    // Inner string (D4 = 62 to G#4 = 68)
    if (midi <= 62) return { string: "inner", finger: 0 }; // D4 (開放弦)
    if (midi <= 64) return { string: "inner", finger: 1 }; // Eb4 / E4 (1指)
    if (midi <= 66) return { string: "inner", finger: 2 }; // F4 / F#4 (2指)
    if (midi <= 68) return { string: "inner", finger: 3 }; // G4 / G#4 (3指)

    // Outer string (A4 = 69 and above)
    if (midi === 69) return { string: "outer", finger: 0 }; // A4 (開放弦)
    if (midi <= 71) return { string: "outer", finger: 1 };  // Bb4 / B4 (1指)
    if (midi <= 73) return { string: "outer", finger: 2 };  // C5 / C#5 (2指)
    if (midi <= 75) return { string: "outer", finger: 3 };  // D5 / Eb5 (3指)
    if (midi <= 78) return { string: "outer", finger: 4 };  // E5 / F5 / F#5 (4指)
    return { string: "outer", finger: 3 };                  // G5+ (ポジション移動)
  }

  getErhuFingeringFromJianpu(jianpu, key) {
    const normKey = this.normalizeKey(key);
    const scale = JIANPU_SCALE_MAP[normKey] || JIANPU_SCALE_MAP["1=D"];
    const m = String(jianpu || "1").match(/([1-7])/);
    const deg = m ? m[1] : "1";
    const info = scale[deg] || { step: "D", alter: 0, octave: 4, string: "inner", finger: 0 };
    return this.getErhuPositionByPitch(info.step, info.alter, info.octave);
  }

  // Parse step string (e.g. "F#", "Bb", "C#4", "F") and optional alter into { step, alter }
  parseStepAndAlter(rawStep, rawAlter = 0) {
    if (!rawStep || rawStep === "rest") {
      return { step: "rest", alter: 0 };
    }
    const str = String(rawStep).trim();
    const match = str.match(/^([A-Ga-g])\s*([#♯b♭+-]?)/);
    if (!match) {
      return { step: "D", alter: 0 };
    }
    const step = match[1].toUpperCase();
    const acc = match[2];
    let alter = parseInt(rawAlter, 10) || 0;
    if (acc === "#" || acc === "♯" || acc === "+") {
      alter = 1;
    } else if (acc === "b" || acc === "♭" || acc === "-") {
      alter = -1;
    }
    return { step, alter };
  }

  // Format { step, alter } into display pitch name for Note Table (e.g. "F#", "Bb", "C")
  getDisplayPitchName(n) {
    if (n.isRest || n.step === "rest" || n.jianpu === "0") return "rest";
    const { step, alter } = this.parseStepAndAlter(n.step, n.alter);
    if (alter === 1) return `${step}#`;
    if (alter === -1) return `${step}b`;
    return step;
  }

  // Normalize a single note object using its jianpu and current key
  normalizeNote(n, forceFromJianpu = false) {
    if (!n) return n;
    const jianpuStr = String(n.jianpu ?? "").trim();
    if (n.isRest || n.step === "rest" || jianpuStr === "0") {
      n.isRest = true;
      n.step = "rest";
      n.alter = 0;
      n.jianpu = "0";
      return n;
    }

    // 1. Parse any embedded '#' or 'b' in n.step (e.g. "F#" -> step: "F", alter: 1)
    const parsed = this.parseStepAndAlter(n.step, n.alter);
    n.step = parsed.step;
    n.alter = parsed.alter;

    // 2. Enforce exact pitch, octave, string, and finger from Jianpu scale mapping for the current key
    const normKey = this.normalizeKey(this.meta.key);
    const scale = JIANPU_SCALE_MAP[normKey];
    const degMatch = jianpuStr.match(/^([#♯b♭]?)([1-7])([.・^]*)$/);
    if (scale && degMatch) {
      const accPrefix = degMatch[1];
      const deg = degMatch[2];
      const octDots = degMatch[3] || "";
      const expected = scale[deg];
      if (expected) {
        let expectedAlter = expected.alter;
        if (accPrefix === "#" || accPrefix === "♯") expectedAlter += 1;
        else if (accPrefix === "b" || accPrefix === "♭") expectedAlter -= 1;

        let octShift = 0;
        for (const ch of octDots) {
          if (ch === ".") octShift -= 1;
          else if (ch === "^" || ch === "・") octShift += 1;
        }

        // Check physical Erhu lower bound: D4 (MIDI 62) is the lowest possible pitch on Erhu.
        // If a "." makes the note lower than D4 (e.g. "2." in 1=G or "1." in 1=D), it is a rhythmic dot (付点), NOT a low-octave dot!
        const semitones = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
        let targetOctave = expected.octave + octShift;
        const candidateMidi = 12 * (targetOctave + 1) + (semitones[expected.step] ?? 0) + expectedAlter;
        if (octShift < 0 && candidateMidi < 62) {
          n.dot = true;
          octShift = 0;
          targetOctave = expected.octave;
          n.jianpu = `${accPrefix}${deg}`;
        }

        n.step = expected.step;
        n.alter = expectedAlter;
        n.octave = targetOctave;

        const erhuPos = this.getErhuPositionByPitch(n.step, n.alter, n.octave);
        n.string = erhuPos.string;
        n.finger = erhuPos.finger;
        return n;
      }
    }

    // Fallback: ensure string & finger match physical pitch
    const erhuPos = this.getErhuPositionByPitch(n.step, n.alter, n.octave);
    n.string = erhuPos.string;
    n.finger = erhuPos.finger;
    return n;
  }

  normalizeAllNotes(forceFromJianpu = false) {
    if (!Array.isArray(this.notes)) return;
    this.notes.forEach(n => this.normalizeNote(n, forceFromJianpu));
  }

  initOSMD() {
    if (window.opensheetmusicdisplay) {
      try {
        this.osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(this.osmdCanvas, {
          autoResize: true,
          backend: "svg",
          drawTitle: true,
          drawSubtitle: true,
          drawComposer: true,
          drawCredits: false,
          drawPartNames: true,
          drawingParameters: "compacttight"
        });
      } catch (err) {
        console.error("OSMD init error:", err);
      }
    }
  }

  async loadInitialPdfPreview() {
    this.fileNameLabel.textContent = "あい二胡2-9.pdf (収録曲: 邀請舞曲)";
    this.pageInfoLabel.textContent = "1 / 1 ページ";

    // Try fetching page_0.png first
    try {
      const resp = await fetch("page_0.png");
      if (resp.ok) {
        const blob = await resp.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.src = e.target.result;
          this.currentImageBase64 = e.target.result;
          this.imagePreview.classList.remove("hidden");
          this.pdfCanvas.classList.add("hidden");
        };
        reader.readAsDataURL(blob);
        return;
      }
    } catch (e) {
      console.warn("Could not load page_0.png directly, will try PDF fallback", e);
    }

    // Fallback: render PDF using PDF.js
    try {
      const pdfResp = await fetch("あい二胡2-9.pdf");
      const pdfBytes = await pdfResp.arrayBuffer();
      const pdfDoc = await window.pdfjsLib.getDocument({ data: pdfBytes }).promise;
      this.currentPdfDoc = pdfDoc;
      await this.renderPdfPage(1);
    } catch (e) {
      console.error("Failed to load initial PDF:", e);
    }
  }

  async handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Also allow MusicXML (.musicxml / .xml) if selected via the general file button
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith(".musicxml") || lowerName.endsWith(".xml") || file.type.includes("xml")) {
      await this.handleMusicXmlImport(e);
      return;
    }

    this.fileNameLabel.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

    if (file.type === "application/pdf") {
      try {
        const fileData = await file.arrayBuffer();
        this.currentPdfDoc = await window.pdfjsLib.getDocument({ data: fileData }).promise;
        this.pageInfoLabel.textContent = `1 / ${this.currentPdfDoc.numPages} ページ`;
        await this.renderPdfPage(1);
      } catch (err) {
        alert("PDFの読み込みに失敗しました: " + err.message);
      }
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.imagePreview.src = event.target.result;
        this.currentImageBase64 = event.target.result;
        this.imagePreview.classList.remove("hidden");
        this.pdfCanvas.classList.add("hidden");
        this.pageInfoLabel.textContent = "画像ファイル";
      };
      reader.readAsDataURL(file);
    }
  }

  async renderPdfPage(pageNum) {
    if (!this.currentPdfDoc) return;
    const page = await this.currentPdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = this.pdfCanvas;
    const ctx = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    this.currentImageBase64 = canvas.toDataURL("image/png");
    this.pdfCanvas.classList.remove("hidden");
    this.imagePreview.classList.add("hidden");
  }

  loadSampleData() {
    this.notes = JSON.parse(JSON.stringify(SAMPLE_NOTES_DATA));
    this.meta = {
      title: "邀請舞曲",
      key: "1=G",
      timeSignature: "2/4",
      tempo: 88
    };
    this.metaTitle.value = this.meta.title;
    this.metaKey.value = this.meta.key;
    this.metaTime.value = this.meta.timeSignature;
    this.renderOSMD();
    this.renderNoteTable();
    this.xmlCodeArea.value = this.generateMusicXml();
    this.scorePlaceholder.classList.add("hidden");
  }

  // Generate MusicXML 3.1 String from internal notes data
  generateMusicXml() {
    const normKey = this.normalizeKey(this.meta.key);
    const keyInfo = KEY_SIGNATURES[normKey] || { fifths: 2, mode: "major" };
    const normTime = this.normalizeTimeSignature(this.meta.timeSignature);
    const [beats, beatType] = normTime.split("/").map(Number);
    const divisions = 4; // quarter note = 4

    // Group notes by measure
    const measureMap = new Map();
    this.notes.forEach(n => {
      const m = n.measure || 1;
      if (!measureMap.has(m)) measureMap.set(m, []);
      measureMap.get(m).push(n);
    });

    let measuresXml = "";
    measureMap.forEach((mNotes, mNum) => {
      measuresXml += `    <measure number="${mNum}">\n`;

      // 1st measure contains attributes (key, time, clef)
      if (mNum === 1) {
        measuresXml += `      <attributes>\n`;
        measuresXml += `        <divisions>${divisions}</divisions>\n`;
        measuresXml += `        <key>\n`;
        measuresXml += `          <fifths>${keyInfo.fifths}</fifths>\n`;
        measuresXml += `          <mode>${keyInfo.mode}</mode>\n`;
        measuresXml += `        </key>\n`;
        measuresXml += `        <time>\n`;
        measuresXml += `          <beats>${beats}</beats>\n`;
        measuresXml += `          <beat-type>${beatType}</beat-type>\n`;
        measuresXml += `        </time>\n`;
        measuresXml += `        <clef>\n`;
        measuresXml += `          <sign>G</sign>\n`;
        measuresXml += `          <line>2</line>\n`;
        measuresXml += `        </clef>\n`;
        measuresXml += `      </attributes>\n`;
        measuresXml += `      <direction placement="above">\n`;
        measuresXml += `        <direction-type>\n`;
        measuresXml += `          <metronome>\n`;
        measuresXml += `            <beat-unit>quarter</beat-unit>\n`;
        measuresXml += `            <per-minute>${this.meta.tempo || 88}</per-minute>\n`;
        measuresXml += `          </metronome>\n`;
        measuresXml += `        </direction-type>\n`;
        measuresXml += `        <sound tempo="${this.meta.tempo || 88}"/>\n`;
        measuresXml += `      </direction>\n`;
      }

      // Notes inside measure
      mNotes.forEach(n => {
        let rawType = String(n.durationType || "").toLowerCase();
        let safeType = "eighth";
        if (rawType.includes("16") || rawType.includes("sixteenth")) safeType = "16th";
        else if (rawType.includes("eight") || rawType.includes("8")) safeType = "eighth";
        else if (rawType.includes("quarter") || rawType.includes("4")) safeType = "quarter";
        else if (rawType.includes("half") || rawType.includes("2")) safeType = "half";
        else if (rawType.includes("whole") || rawType.includes("全")) safeType = "whole";

        let baseDiv = DURATION_DIVISIONS[safeType] || 2;
        let noteDiv = n.dot ? Math.floor(baseDiv * 1.5) : baseDiv;

        measuresXml += `      <note>\n`;
        if (n.isRest || n.step === "rest" || n.jianpu === "0") {
          measuresXml += `        <rest/>\n`;
        } else {
          this.normalizeNote(n);
          const { step: stepChar, alter: altNum } = this.parseStepAndAlter(n.step, n.alter);
          let octNum = parseInt(n.octave, 10) || 4;

          measuresXml += `        <pitch>\n`;
          measuresXml += `          <step>${stepChar}</step>\n`;
          if (altNum !== 0) {
            measuresXml += `          <alter>${altNum}</alter>\n`;
          }
          measuresXml += `          <octave>${octNum}</octave>\n`;
          measuresXml += `        </pitch>\n`;
        }
        measuresXml += `        <duration>${noteDiv}</duration>\n`;
        measuresXml += `        <type>${safeType}</type>\n`;
        if (n.dot) {
          measuresXml += `        <dot/>\n`;
        }

        // Erhu fingering & bow directions
        if (n.bow || n.finger !== undefined) {
          measuresXml += `        <notations>\n`;
          measuresXml += `          <technical>\n`;
          if (n.bow === "⊓") {
            measuresXml += `            <down-bow/>\n`;
          } else if (n.bow === "V") {
            measuresXml += `            <up-bow/>\n`;
          }
          if (n.finger !== undefined && n.finger !== null) {
            measuresXml += `            <fingering>${n.finger}</fingering>\n`;
          }
          if (n.string) {
            measuresXml += `            <string>${n.string === "inner" ? "1" : "2"}</string>\n`;
          }
          measuresXml += `          </technical>\n`;
          measuresXml += `        </notations>\n`;
        }

        measuresXml += `      </note>\n`;
      });

      measuresXml += `    </measure>\n`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${this.escapeXml(this.meta.title)}</work-title>
  </work>
  <identification>
    <creator type="composer">中国民間曲 / 二胡数字譜</creator>
    <encoding>
      <software>Erhu Jianpu MusicXML Converter</software>
      <encoding-date>${new Date().toISOString().split("T")[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>二胡 (Erhu)</part-name>
      <score-instrument id="P1-I1">
        <instrument-name>二胡</instrument-name>
      </score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>111</midi-program> <!-- GM Fiddle / Erhu -->
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">
${measuresXml}  </part>
</score-partwise>`;

    return xml;
  }

  escapeXml(unsafe) {
    return (unsafe || "").replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  // Normalize Key format (e.g. "1=D", "D", "1=D(1 5弦)", "D major", "1 = G", "G調" -> "1=D" / "1=G")
  normalizeKey(rawKey) {
    if (!rawKey) return "1=D";
    const str = String(rawKey)
      .replace(/＝/g, "=")
      .replace(/\s+/g, "")
      .toUpperCase();
    if (str.includes("1=BB") || str.includes("1=B♭") || str.includes("BB") || str.includes("B♭") || str.includes("変ロ")) return "1=Bb";
    if (str.includes("1=D") || str.includes("D調") || str.includes("ニ長") || str.includes("15弦") || str.startsWith("D")) return "1=D";
    if (str.includes("1=G") || str.includes("G調") || str.includes("ト長") || str.includes("52弦") || str.includes("5.2弦") || str.startsWith("G")) return "1=G";
    if (str.includes("1=F") || str.includes("F調") || str.includes("ヘ長") || str.includes("63弦") || str.includes("6.3弦") || str.startsWith("F")) return "1=F";
    if (str.includes("1=C") || str.includes("C調") || str.includes("ハ長") || str.includes("26弦") || str.startsWith("C")) return "1=C";
    if (str.includes("1=A") || str.includes("A調") || str.includes("イ長") || str.startsWith("A")) return "1=A";
    return "1=D";
  }

  // Normalize Time Signature (e.g. "2/4", "3/4", "4/4", "6/8")
  normalizeTimeSignature(rawTime) {
    if (!rawTime) return "2/4";
    const match = String(rawTime).match(/(\d+)\s*\/\s*(\d+)/);
    if (match) return `${match[1]}/${match[2]}`;
    return "2/4";
  }

  // Render MusicXML to OSMD
  async renderOSMD() {
    // 1. Always hide the placeholder immediately
    if (this.scorePlaceholder) {
      this.scorePlaceholder.classList.add("hidden");
    }

    if (!this.osmd) {
      this.initOSMD();
    }

    try {
      const xmlString = this.generateMusicXml();
      if (!this.osmd) {
        throw new Error("OSMDライブラリが初期化できませんでした。");
      }

      await this.osmd.load(xmlString);
      this.osmd.zoom = this.scoreZoom;
      this.osmd.render();

      if (this.scorePlaceholder) {
        this.scorePlaceholder.classList.add("hidden");
      }
      this.exportStatusText.textContent = `楽譜描画完了: ${this.notes.length}音符 / ${this.meta.title}`;
    } catch (err) {
      console.error("OSMD render error:", err);
      // If error occurs, inform user in status without blocking the whole page
      this.exportStatusText.textContent = `描画警告: ${err.message} (音符リストやXMLコードは利用可能です)`;
      if (this.scorePlaceholder) {
        this.scorePlaceholder.classList.add("hidden");
      }
    }
  }

  adjustZoom(delta) {
    this.scoreZoom = Math.max(0.4, Math.min(2.5, this.scoreZoom + delta));
    this.scoreZoomVal.textContent = `${Math.round(this.scoreZoom * 100)}%`;
    if (this.osmd) {
      this.osmd.zoom = this.scoreZoom;
      this.osmd.render();
    }
  }

  // Render Note Table for interactive manual editing
  renderNoteTable() {
    this.metaTitle.value = this.meta.title;
    this.metaKey.value = this.meta.key;
    this.metaTime.value = this.meta.timeSignature;

    this.normalizeAllNotes(false);

    const pitchOptions = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B", "rest"];

    this.noteTableBody.innerHTML = "";
    this.notes.forEach((n, idx) => {
      const displayPitch = this.getDisplayPitchName(n);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="number" class="table-input" value="${n.measure}" data-field="measure" min="1" style="width: 45px;"></td>
        <td><input type="text" class="table-input" value="${n.jianpu}" data-field="jianpu" style="width: 55px; font-weight: bold; color: var(--accent-gold);"></td>
        <td>
          <select class="table-select" data-field="step">
            ${pitchOptions.map(s => `<option value="${s}" ${s === displayPitch ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
        <td><input type="number" class="table-input" value="${n.octave}" data-field="octave" min="2" max="6" style="width: 45px;"></td>
        <td>
          <select class="table-select" data-field="durationType">
            <option value="16th" ${n.durationType === "16th" ? "selected" : ""}>16分</option>
            <option value="eighth" ${n.durationType === "eighth" ? "selected" : ""}>8分</option>
            <option value="quarter" ${n.durationType === "quarter" ? "selected" : ""}>4分</option>
            <option value="half" ${n.durationType === "half" ? "selected" : ""}>2分</option>
            <option value="whole" ${n.durationType === "whole" ? "selected" : ""}>全音符</option>
          </select>
        </td>
        <td><input type="checkbox" ${n.dot ? "checked" : ""} data-field="dot"></td>
        <td><input type="checkbox" ${n.isRest ? "checked" : ""} data-field="isRest"></td>
        <td>
          <select class="table-select" data-field="string">
            <option value="inner" ${n.string === "inner" ? "selected" : ""}>内弦(D)</option>
            <option value="outer" ${n.string === "outer" ? "selected" : ""}>外弦(A)</option>
          </select>
        </td>
        <td><input type="number" class="table-input" value="${n.finger ?? 0}" data-field="finger" min="0" max="4" style="width: 40px;"></td>
        <td>
          <select class="table-select" data-field="bow">
            <option value="⊓" ${n.bow === "⊓" ? "selected" : ""}>⊓ 引き</option>
            <option value="V" ${n.bow === "V" ? "selected" : ""}>V 押し</option>
            <option value="" ${!n.bow ? "selected" : ""}>−</option>
          </select>
        </td>
        <td><button class="btn btn-xs btn-ghost text-danger" title="削除" onclick="window.musicXmlApp.deleteNoteRow(${idx})">🗑</button></td>
      `;

      // Attach change listeners to update object
      tr.querySelectorAll("[data-field]").forEach(input => {
        input.addEventListener("change", (e) => {
          const field = e.target.dataset.field;
          let val = e.target.value;
          if (field === "dot" || field === "isRest") {
            val = e.target.checked;
            this.notes[idx][field] = val;
            if (field === "isRest" && val) {
              this.notes[idx].step = "rest";
              this.notes[idx].alter = 0;
              this.notes[idx].jianpu = "0";
              this.renderNoteTable();
            }
          } else if (field === "measure" || field === "octave" || field === "finger") {
            this.notes[idx][field] = parseInt(val, 10);
          } else if (field === "step") {
            if (val === "rest") {
              this.notes[idx].isRest = true;
              this.notes[idx].step = "rest";
              this.notes[idx].alter = 0;
              this.notes[idx].jianpu = "0";
            } else {
              const { step, alter } = this.parseStepAndAlter(val, 0);
              this.notes[idx].isRest = false;
              this.notes[idx].step = step;
              this.notes[idx].alter = alter;
              this.notes[idx].jianpu = this.pitchToJianpu(step, alter, this.notes[idx].octave, this.meta.key);
            }
            this.renderNoteTable();
          } else if (field === "jianpu") {
            this.notes[idx].jianpu = val;
            this.normalizeNote(this.notes[idx], true);
            this.renderNoteTable();
          } else {
            this.notes[idx][field] = val;
          }
        });
      });

      this.noteTableBody.appendChild(tr);
    });
  }

  addNoteRow() {
    const lastNote = this.notes[this.notes.length - 1] || { measure: 1, step: "D", octave: 4 };
    const newNote = {
      measure: lastNote.measure,
      jianpu: "1",
      step: "D",
      octave: 4,
      alter: 0,
      durationType: "quarter",
      dot: false,
      isRest: false,
      string: "inner",
      finger: 0,
      bow: "⊓"
    };
    this.normalizeNote(newNote, true);
    this.notes.push(newNote);
    this.renderNoteTable();
  }

  deleteNoteRow(idx) {
    if (this.notes.length <= 1) {
      alert("これ以上音符を削除できません。");
      return;
    }
    this.notes.splice(idx, 1);
    this.renderNoteTable();
  }

  applyTableToXml() {
    this.meta.title = this.metaTitle.value.trim() || "無題";
    this.meta.key = this.normalizeKey(this.metaKey.value);
    this.meta.timeSignature = this.metaTime.value;
    this.rawImportedXml = null;

    this.normalizeAllNotes(false);
    this.renderOSMD();
    this.xmlCodeArea.value = this.generateMusicXml();
    alert("テーブルの変更をMusicXMLに反映しました！「五線譜プレビュー」で確認できます。");
  }

  applyXmlCode() {
    const rawXml = this.xmlCodeArea.value;
    if (!rawXml.trim()) return;

    try {
      this.rawImportedXml = rawXml;
      this.parseMusicXmlToNotes(rawXml);
      if (this.osmd) {
        this.osmd.load(rawXml).then(() => {
          this.osmd.render();
          this.scorePlaceholder.classList.add("hidden");
          alert("XMLコードを楽譜プレビューおよび音符リストに適用しました！");
        });
      }
    } catch (e) {
      alert("XML構文エラー: " + e.message);
    }
  }

  formatXmlInEditor() {
    this.xmlCodeArea.value = this.generateMusicXml();
  }

  // Dispatch AI conversion based on selected provider (Gemini or DeepSeek)
  async runAiMusicXmlConversion() {
    const provider = localStorage.getItem("ai_provider") || (this.selectAiProvider ? this.selectAiProvider.value : "gemini");
    if (provider === "gemini") {
      await this.runGeminiMusicXmlConversion();
    } else {
      await this.runDeepSeekMusicXmlConversion();
    }
  }

  // Google Gemini API Direct MusicXML Conversion (High Precision for Multi-Part / Jianpu)
  async runGeminiMusicXmlConversion() {
    const apiKey = localStorage.getItem("gemini_api_key") || (this.inputGeminiApiKey ? this.inputGeminiApiKey.value.trim() : "");
    if (!apiKey) {
      this.apiModal.classList.remove("hidden");
      alert("Google Gemini APIキーを設定してください。\nGoogle AI Studio (aistudio.google.com) から無料で即座に取得できます。");
      return;
    }

    if (!this.currentImageBase64) {
      alert("解析対象の数字譜（PDFまたは画像）が読み込まれていません。");
      return;
    }

    const model = localStorage.getItem("gemini_model") || "gemini-2.5-flash";

    this.aiLoadingOverlay.classList.remove("hidden");
    this.aiStatusTitle.textContent = "Google Gemini AIで数字譜を解析中...";
    this.aiStatusMessage.textContent = "数字譜の音程、音価、運指、および多重奏（二胡I / 二胡II）の構造を解析しMusicXMLを生成しています...";

    // Separate base64 data and mime type
    const match = this.currentImageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      this.aiLoadingOverlay.classList.add("hidden");
      alert("画像データのエンコード形式が不正です。");
      return;
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const promptText = `あなたは中国民族楽器「二胡（Erhu）」の最高権威であり、「数字譜（簡譜 / Jianpu）」から国際標準「MusicXML 3.1 / 4.0」への変換スペシャリストです。

添付された二胡数字譜の画像を精密に解析し、直接完全な「MusicXML 3.1（または4.0）」コードを生成してください。

【重要な楽譜構造ルール】
1. 二重奏・アンサンブル（二段譜）の厳密な判定:
   - もし楽譜が「上段（二胡I / 主旋律）」と「下段（二胡II / 伴奏）」の2段並びになっている場合、必ず別々のパートとして <part id="P1">（二胡 I）と <part id="P2">（二胡 II）に分離してください。
   - 上段と下段の音符を1つのパートに混ぜてはいけません。
   - 単一パート（独奏）の場合は、<part id="P1">（二胡）のみで出力してください。

2. 二胡の調号と音名・オクターブ・運指ルール（第1ポジション厳守）:
   ※ 二胡の最低音は内弦開放弦の D4 です（D4未満の音は存在しません）。また、国際式音名では C（ド）からオクターブ番号が 4 → 5 に上がる点に特に注意してください！
   - 1=D (1 5弦): Dメジャー
     1=D4(内弦0指), 2=E4(内弦1指), 3=F#4(内弦2指), 4=G4(内弦3指), 5=A4(外弦0指), 6=B4(外弦1指), 7=C#5(外弦2指), 1^=D5(外弦3指), 2^=E5(外弦4指)
   - 1=G (5. 2弦): Gメジャー ※1は内弦3指(G4)であり、0指ではありません！また 4, 5, 6, 7 はオクターブ5になります！
     5.=D4(内弦0指), 6.=E4(内弦1指), 7.=F#4(内弦2指), 1=G4(内弦3指), 2=A4(外弦0指), 3=B4(外弦1指), 4=C5(外弦2指), 5=D5(外弦3指), 6=E5(外弦4指), 7=F#5(外弦4指), 1^=G5(外弦4指)
   - 1=F (6. 3弦): Fメジャー
     6.=D4(内弦0指), 7.=E4(内弦1指), 1=F4(内弦2指), 2=G4(内弦3指), 3=A4(外弦0指), 4=Bb4(外弦1指), 5=C5(外弦2指), 6=D5(外弦3指), 7=E5(外弦4指)
   - 1=C (2 6弦): Cメジャー
     2.=D4(内弦0指), 3.=E4(内弦1指), 4.=F4(内弦2指), 5.=G4(内弦3指), 6.=A4(外弦0指), 7.=B4(外弦1指), 1=C5(外弦2指), 2=D5(外弦3指), 3=E5(外弦4指)
   - 1=Bb (3. 7.弦): 変ロ長調
     3.=D4(内弦0指), 4.=Eb4(内弦1指), 5.=F4(内弦2指), 6.=G4(内弦3指), 7.=A4(外弦0指), 1=Bb4(外弦1指), 2=C5(外弦2指), 3=D5(外弦3指), 4=Eb5(外弦4指)

3. オクターブ記号と付点の区別（超重要）:
   - 数字の真下の点: 1オクターブ下（1=G調における 5.=D4, 6.=E4, 7.=F#4 のみ。1=G調の 1, 2, 3, 4 に下点は存在しません）
   - 数字の真上の点: 1オクターブ上
   - 数字の右横の点（例: 「2. 3 2」の「2.」など）: 付点音符（リズムが1.5倍、<dot/>タグ）であり、低音オクターブではありません！絶対に1オクターブ下げないでください。

4. 音価（リズム）と小節線の整合性:
   - 数字のみ（下線なし）: 四分音符 (quarter)
   - 下線1本: 八分音符 (eighth)
   - 下線2本: 十六分音符 (16th)
   - 伸ばし棒「-」: 1拍延長（例: 「1 -」は二分音符）
   - 付点「.」: 音価1.5倍
   - 「0」: 休符 (<rest/>)
   - 指定された拍子（2/4拍子なら1小節に2拍分、4/4拍子なら4拍分）にぴったり合致するよう、各小節のdurationとnote typeを厳密に計算してください。

5. 運指・弓記号（可能な限り付与）:
   - ⊓: <down-bow/>
   - V: <up-bow/>
   - 運指: <fingering>0</fingering> (0:開放弦, 1:人差指, 2:中指, 3:薬指, 4:小指)

【出力形式】
- 余計な解説、挨拶、前置き、Markdownのコードブロックは一切含めず、
  <?xml version="1.0" encoding="UTF-8"?> から始まる完全で有効な MusicXML コードのみを出力してください。
  （コードブロック記号の囲みも不要です。純粋なXMLコードのみを出力してください）`;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192
        }
      };

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Gemini API エラー (${resp.status}): ${errorText}`);
      }

      const resData = await resp.json();
      let rawContent = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawContent) throw new Error("Geminiからの応答が空でした。");

      // Clean markdown code blocks if AI wrapped them
      let xmlContent = rawContent.replace(/```xml\s*/gi, "").replace(/```\s*$/g, "").trim();

      // Ensure starts with xml tag or score-partwise
      const xmlStartIdx = xmlContent.indexOf("<?xml");
      const scoreStartIdx = xmlContent.indexOf("<score-partwise");
      const startIndex = xmlStartIdx !== -1 ? xmlStartIdx : scoreStartIdx;

      if (startIndex === -1) {
        throw new Error("生成されたデータ内にMusicXMLタグが見つかりませんでした。");
      }

      const endIndex = xmlContent.lastIndexOf("</score-partwise>");
      if (endIndex !== -1) {
        xmlContent = xmlContent.substring(startIndex, endIndex + "</score-partwise>".length);
      } else {
        xmlContent = xmlContent.substring(startIndex);
      }

      // Load into OSMD and Editor
      await this.loadDirectMusicXml(xmlContent, "Gemini生成楽譜");
      this.rawImportedXml = xmlContent;

      alert("🎉 Google GeminiによるMusicXML生成が成功しました！\n五線譜プレビューに美しくレンダリングされました。\n「XMLコード」タブや「MusicXMLをダウンロード」からMuseScore等でも開けます。");
    } catch (err) {
      console.error("Gemini API Error:", err);
      alert("Gemini解析中にエラーが発生しました:\n" + err.message);
    } finally {
      this.aiLoadingOverlay.classList.add("hidden");
    }
  }

  // DeepSeek API Conversion to MusicXML (Improved with Multi-part guidance)
  async runDeepSeekMusicXmlConversion() {
    const apiKey = localStorage.getItem("deepseek_api_key") || this.inputApiKey.value.trim();
    if (!apiKey) {
      this.apiModal.classList.remove("hidden");
      alert("まずはDeepSeek APIキーを設定してください。");
      return;
    }

    if (!this.currentImageBase64) {
      alert("解析対象の数字譜（PDFまたは画像）が読み込まれていません。");
      return;
    }

    const model = localStorage.getItem("deepseek_model") || "deepseek-chat";

    this.aiLoadingOverlay.classList.remove("hidden");
    this.aiStatusTitle.textContent = "DeepSeek AIで数字譜を解析中...";
    this.aiStatusMessage.textContent = "調号、拍子、小節線、数字（音名・オクターブ・音価・運指）をMusicXML構造へ高精度変換しています...";

    const promptText = `あなたは中国民族楽器「二胡（Erhu）」の専門家、および「数字譜（簡譜 / Jianpu）」から国際標準「MusicXML 3.1」への変換スペシャリストです。

添付された二胡数字譜の画像を精密に解析し、正確なMusicXML 3.1用JSONデータを生成してください。

【注意：重奏（2段譜）の扱い】
楽譜が上段（主旋律）と下段（伴奏）の2段になっている場合は、まず「上段（二胡I/主旋律）」のメロディを正確に優先して小節ごとに抽出してください。上段と下段の音符を混同して1つの小節に詰め込まないでください。

【二胡数字譜のルール】
1. 調号と音名・オクターブ・運指 (Key Signature):
   ※二胡の最低音は内弦開放の D4 です。また C（ド）からオクターブ番号が 4 → 5 に上がることに注意してください。
   - 1=D: 1=D4(inner,finger:0), 2=E4(inner,1), 3=F#4(inner,2), 4=G4(inner,3), 5=A4(outer,0), 6=B4(outer,1), 7=C#5(outer,2), 1^=D5(outer,3), 2^=E5(outer,4)
   - 1=G: 5.=D4(inner,finger:0), 6.=E4(inner,1), 7.=F#4(inner,2), 1=G4(inner,finger:3 ※0ではありません), 2=A4(outer,0), 3=B4(outer,1), 4=C5(outer,2 ※octave:5), 5=D5(outer,3 ※octave:5), 6=E5(outer,4 ※octave:5), 7=F#5(outer,4)
   - 1=F: 6.=D4(inner,0), 7.=E4(inner,1), 1=F4(inner,2), 2=G4(inner,3), 3=A4(outer,0), 4=Bb4(outer,1), 5=C5(outer,2), 6=D5(outer,3), 7=E5(outer,4)
2. オクターブ記号と付点の区別:
   - 数字の真下の点（5., 6., 7. など）のみ jianpu に "." を付けてください (例: "5.")。
   - 数字の真上の点（高音）は jianpu に "^" を付けてください (例: "1^")。
   - 数字の右横の点（例: ふるさと「2. 3 2」の付点四分音符「2.」など）はリズムの付点なので、jianpu は "2" とし、"dot": true に設定してください（jianpu に "." を書くと低音と誤認されます）。
3. 音価（リズム）:
   - 下線なし: 四分音符 (quarter)
   - 下線1本: 八分音符 (eighth)
   - 下線2本: 十六分音符 (16th)
   - 伸ばし棒「-」: 二分音符や全音符へ加算
   - 付点「.」: 音価を1.5倍
   - 「0」: 休符 (rest)
4. 二胡運指・弓記号:
   - ⊓: 引き弓 (down-bow)
   - V: 押し弓 (up-bow)
   - 0: 開放弦, 1: 人差指, 2: 中指, 3: 薬指, 4: 小指

【出力フォーマット】
以下のJSON形式で漏れなく全小節の音符を出力してください:
{
  "title": "曲名",
  "key": "1=D",
  "timeSignature": "2/4",
  "tempo": 88,
  "notes": [
    {
      "measure": 1,
      "jianpu": "1",
      "step": "D",
      "octave": 4,
      "alter": 0,
      "durationType": "quarter",
      "dot": false,
      "isRest": false,
      "string": "inner",
      "finger": 0,
      "bow": "⊓"
    }
  ]
}
説明文や前置きは含めず、純粋なJSONのみを返してください。`;

    try {
      const requestPayload = {
        model: model,
        max_tokens: 4096,
        messages: [
          { role: "system", content: "You are a professional music engraver and Erhu Jianpu specialist. Always return valid, well-formed JSON." },
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              {
                type: "image_url",
                image_url: { url: this.currentImageBase64 }
              }
            ]
          }
        ],
        temperature: 0.1
      };

      const resp = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`DeepSeek API (${resp.status}): ${errorText}`);
      }

      const resData = await resp.json();
      const content = resData.choices?.[0]?.message?.content;
      if (!content) throw new Error("DeepSeekからの応答が空でした。");

      // Robust parse with automatic recovery
      const parsed = this.cleanAndParseJson(content);

      if (parsed.notes && Array.isArray(parsed.notes)) {
        this.rawImportedXml = null; // Clear raw imported xml
        this.meta.title = parsed.title || this.meta.title || "二胡楽譜";
        this.meta.key = this.normalizeKey(parsed.key);
        this.meta.timeSignature = this.normalizeTimeSignature(parsed.timeSignature);
        this.meta.tempo = parseInt(parsed.tempo, 10) || 88;
        this.notes = parsed.notes;
        this.normalizeAllNotes(false);

        if (this.scorePlaceholder) {
          this.scorePlaceholder.classList.add("hidden");
        }

        this.renderNoteTable();
        await this.renderOSMD();
        this.xmlCodeArea.value = this.generateMusicXml();

        alert(`🎉 DeepSeek解析成功！\n曲名: ${this.meta.title}\n調号: ${this.meta.key} / 拍子: ${this.meta.timeSignature}\n認識音符数: ${this.notes.length}音\n\n「五線譜プレビュー」「音符リスト編集」「XMLコード」のいずれでも内容を確認・修正できます。`);
      } else {
        throw new Error("JSON内に音符配列 (notes) が見つかりませんでした。");
      }
    } catch (err) {
      console.error(err);
      alert("DeepSeek解析中にエラーが発生しました:\n" + err.message);
    } finally {
      this.aiLoadingOverlay.classList.add("hidden");
    }
  }

  // Robust JSON cleaner & parser for AI responses (handles trailing commas, unescaped characters, truncations)
  cleanAndParseJson(rawContent) {
    if (!rawContent) throw new Error("応答データが空です。");

    // 1. Remove markdown code fences if present (```json ... ```)
    let cleaned = rawContent.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();

    // 2. Extract substring from first '{' to last '}'
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace === -1) throw new Error("JSONの開始括弧 '{' が見つかりませんでした。");
    
    let lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace === -1 || lastBrace < firstBrace) {
      cleaned = cleaned.substring(firstBrace) + "\n  ]\n}";
    } else {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 3. Try standard parse first
    try {
      return JSON.parse(cleaned);
    } catch (e1) {
      console.warn("First JSON parse attempt failed, trying repairs:", e1.message);
    }

    // 4. Repair step: remove trailing commas before } or ]
    let repaired = cleaned
      .replace(/,\s*([\]}])/g, "$1") // trailing commas
      .replace(/,\s*$/gm, "");       // trailing comma at line end

    try {
      return JSON.parse(repaired);
    } catch (e2) {
      console.warn("Second parse attempt after removing trailing commas failed:", e2.message);
    }

    // 5. Repair step: Truncation recovery in notes array
    const lastCompleteObjIdx = repaired.lastIndexOf("}");
    if (lastCompleteObjIdx > 0) {
      const truncatedRecovery = repaired.substring(0, lastCompleteObjIdx + 1) + "\n  ]\n}";
      try {
        const result = JSON.parse(truncatedRecovery);
        if (result && result.notes) return result;
      } catch (e3) {
        console.warn("Truncation recovery attempt failed:", e3.message);
      }
    }

    // 6. Regex item-by-item extraction fallback (100% resilient)
    console.warn("Falling back to regex note extraction...");
    const titleMatch = rawContent.match(/"title"\s*:\s*"([^"]+)"/);
    const keyMatch = rawContent.match(/"key"\s*:\s*"([^"]+)"/);
    const timeMatch = rawContent.match(/"timeSignature"\s*:\s*"([^"]+)"/);
    const tempoMatch = rawContent.match(/"tempo"\s*:\s*(\d+)/);

    const notes = [];
    const noteBlockRegex = /\{[^{}]*"measure"\s*:\s*(\d+)[^{}]*"step"\s*:\s*"([^"]+)"[^{}]*\}/g;
    let match;
    while ((match = noteBlockRegex.exec(rawContent)) !== null) {
      try {
        const noteObj = JSON.parse(match[0]);
        notes.push(noteObj);
      } catch (err) {
        // Skip individual unparseable note
      }
    }

    if (notes.length > 0) {
      return {
        title: titleMatch ? titleMatch[1] : "二胡楽譜",
        key: keyMatch ? keyMatch[1] : "1=D",
        timeSignature: timeMatch ? timeMatch[1] : "2/4",
        tempo: tempoMatch ? parseInt(tempoMatch[1], 10) : 88,
        notes: notes
      };
    }

    throw new Error("JSON構文の修復に失敗しました。AIの出力形式をご確認ください。");
  }

  // Audio Playback using WebAudio (with iOS/iPadOS/Android unlock support)
  async initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === "suspended") {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn("AudioContext resume warning:", e);
      }
    }
    // Play silent 1-frame buffer to unlock audio on mobile Safari / iPad
    try {
      const buffer = this.audioCtx.createBuffer(1, 1, 22050);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx.destination);
      source.start(0);
    } catch (e) {
      // Ignore if not needed
    }
  }

  stepToFrequency(step, octave, alter = 0) {
    const semitones = { "C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11 };
    const parsed = this.parseStepAndAlter(step, alter);
    const baseMidi = 12 * ((parseInt(octave, 10) || 4) + 1) + (semitones[parsed.step] ?? 0) + (parsed.alter || 0);
    return 440 * Math.pow(2, (baseMidi - 69) / 12);
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.stopPlayback();
    } else {
      this.startPlayback();
    }
  }

  async startPlayback() {
    this.stopPlayback();
    await this.initAudio();
    if (!this.notes || this.notes.length === 0) {
      this.loadSampleData();
    }
    this.isPlaying = true;
    this.btnPlayScore.textContent = "⏸ 一時停止";

    let noteIdx = 0;
    let expectedNextTime = performance.now();

    const playNext = async () => {
      if (!this.isPlaying || noteIdx >= this.notes.length) {
        this.stopPlayback();
        return;
      }

      if (this.audioCtx && this.audioCtx.state === "suspended") {
        try {
          await this.audioCtx.resume();
        } catch (e) {
          // Ignore
        }
      }

      const n = this.notes[noteIdx];
      const beatSec = 60 / (this.meta.tempo || 88);

      let durationFactor = 0.5;
      if (typeof n.beats === "number" && n.beats > 0) {
        durationFactor = n.beats;
      } else {
        if (n.durationType === "16th") durationFactor = 0.25;
        else if (n.durationType === "eighth") durationFactor = 0.5;
        else if (n.durationType === "quarter") durationFactor = 1.0;
        else if (n.durationType === "half") durationFactor = 2.0;
        else if (n.durationType === "whole") durationFactor = 4.0;
        if (n.dot) durationFactor *= 1.5;
      }

      const durationSec = Math.max(0.08, durationFactor * beatSec);

      if (!n.isRest && n.step !== "rest" && n.jianpu !== "0") {
        const freq = this.stepToFrequency(n.step, n.octave, n.alter);
        // Keep bow articulation gap tiny (max 25ms) so half/whole notes never cut off early with a silent pause
        const toneDuration = Math.max(0.06, durationSec - Math.min(0.025, durationSec * 0.05));
        this.playSynthesizedTone(freq, toneDuration);
      }

      noteIdx++;
      expectedNextTime += durationSec * 1000;
      const delayMs = Math.max(10, expectedNextTime - performance.now());
      this.playbackTimer = setTimeout(playNext, delayMs);
    };

    playNext();
  }

  stopPlayback() {
    this.isPlaying = false;
    this.btnPlayScore.textContent = "▶ 再生";
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  playSynthesizedTone(freq, duration) {
    if (!this.audioCtx || !Number.isFinite(freq) || freq <= 0) return;
    const ctx = this.audioCtx;
    const t = ctx.currentTime;
    const safeDur = Math.max(0.06, duration);

    const oscMain = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const vibratoLfo = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    oscMain.type = "sawtooth";
    oscSub.type = "triangle";
    oscMain.frequency.setValueAtTime(freq, t);
    oscSub.frequency.setValueAtTime(freq * 2, t);

    // Subtle Erhu vibrato (揉弦) on sustained notes so long notes sound alive and never feel frozen
    vibratoLfo.frequency.setValueAtTime(5.2, t);
    vibratoGain.gain.setValueAtTime(freq * 0.012, t);
    vibratoLfo.connect(vibratoGain);
    vibratoGain.connect(oscMain.frequency);

    // Warm Erhu body resonance filter
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2800, t);

    // Smooth bow envelope without premature cutoff
    const attack = Math.min(0.035, safeDur * 0.25);
    const release = Math.min(0.035, safeDur * 0.25);
    const sustainEnd = Math.max(t + attack, t + safeDur - release);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + attack);
    gain.gain.setValueAtTime(0.26, sustainEnd);
    gain.gain.linearRampToValueAtTime(0.0001, t + safeDur);

    oscMain.connect(filter);
    oscSub.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    oscMain.start(t);
    oscSub.start(t);
    vibratoLfo.start(t + Math.min(0.12, safeDur * 0.5));

    oscMain.stop(t + safeDur);
    oscSub.stop(t + safeDur);
    vibratoLfo.stop(t + safeDur);

    // Clean up audio nodes after completion to prevent memory/audio glitches
    oscMain.onended = () => {
      try {
        oscMain.disconnect();
        oscSub.disconnect();
        vibratoLfo.disconnect();
        vibratoGain.disconnect();
        filter.disconnect();
        gain.disconnect();
      } catch (e) {
        // Ignore
      }
    };
  }

  // Switch to index.html while passing current song & notes via localStorage bridge
  switchToTraditionalPlayer() {
    this.stopPlayback();
    try {
      if (this.notes && this.notes.length > 0) {
        const semitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        const convertedNotes = this.notes.map(n => {
          let dur = 0.5;
          if (typeof n.beats === "number" && n.beats > 0) {
            dur = n.beats;
          } else {
            if (n.durationType === "16th") dur = 0.25;
            else if (n.durationType === "eighth") dur = 0.5;
            else if (n.durationType === "quarter") dur = 1.0;
            else if (n.durationType === "half") dur = 2.0;
            else if (n.durationType === "whole") dur = 4.0;
            if (n.dot) dur *= 1.5;
          }
          if (n.isRest || n.step === "rest" || n.jianpu === "0") {
            return {
              measure: n.measure || 1,
              jianpu: "0",
              pitch: "rest",
              midi: 60,
              string: n.string || "inner",
              finger: 0,
              bow: n.bow || "",
              duration: dur
            };
          }
          const parsed = this.parseStepAndAlter(n.step, n.alter);
          const acc = parsed.alter === 1 ? "#" : (parsed.alter === -1 ? "b" : "");
          const oct = parseInt(n.octave, 10) || 4;
          const pitch = `${parsed.step}${acc}${oct}`;
          const midi = 12 * (oct + 1) + (semitones[parsed.step] ?? 2) + (parsed.alter || 0);
          return {
            measure: n.measure || 1,
            jianpu: n.jianpu || "1",
            pitch,
            midi,
            string: n.string || "inner",
            finger: n.finger ?? 0,
            bow: n.bow || "⊓",
            duration: dur
          };
        });
        const bridgeSong = {
          title: this.meta.title || "二胡楽譜",
          key: this.meta.key || "1=D",
          timeSignature: this.meta.timeSignature || "2/4",
          tempo: this.meta.tempo || 88,
          notes: convertedNotes
        };
        localStorage.setItem("erhu_shared_song_bridge", JSON.stringify(bridgeSong));
      }
    } catch (e) {
      console.warn("Could not save bridge song:", e);
    }
    window.location.href = "index.html";
  }

  // Export handlers
  copyXmlToClipboard() {
    const xml = this.rawImportedXml || this.generateMusicXml();
    navigator.clipboard.writeText(xml).then(() => {
      alert("MusicXMLデータをクリップボードにコピーしました！");
    }).catch(err => {
      alert("コピーに失敗しました: " + err.message);
    });
  }

  downloadMusicXmlFile() {
    const xml = this.rawImportedXml || this.generateMusicXml();
    const safeTitle = (this.meta.title || "二胡楽譜").replace(/[/\\?%*:|"<>]/g, "_");
    const blob = new Blob([xml], { type: "application/vnd.recordare.musicxml+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle}.musicxml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.musicXmlApp = new ErhuMusicXmlApp();
});
