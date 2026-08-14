/**
 * 可愛學期手寫筆記本生成工具 - 核心邏輯 (app.js)
 * Made by 阿剛老師 (https://kentxchang.blogspot.tw)
 * 授權: CC BY-NC-SA 4.0
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================= 預設與狀態管理 =================
  const state = {
    startDate: '',
    endDate: '',
    orientation: 'portrait',
    weekStartDay: 1, // 1: 週一, 0: 週日
    startWeekIndex: 1, // 第 1 週從第幾個日曆週開始
    endWeekIndex: 999, // 最後一週結束於第幾個日曆週
    customWeekTitles: {}, // 使用者手動修改的週次標題快取 { weekKey: "自訂標題" }
    weeklyGlobalQuote: '🌸 Remember to smile every day!', // 全域每週小語
    customWeeklyQuotes: {}, // 使用者個別修改的每週小語快取 { weekKey: "自訂小語" }
    customTimetableLabels: {}, // 課表節次時間自訂文字 { periodIndex: "文字" }
    customTimetableCells: {}, // 課表格子自訂文字 { "row_col": "文字" }
    customTimetableGoal: '', // 課表目標小語
    includes: {
      cover: true,
      timetable: true,
      monthly: true,
      weekly: true,
      grid: true,
      dot: false
    },
    timetablePeriods: 7, // 每日節數 (7, 8, 9)
    gridPages: 2,
    dotPages: 2,
    cover: {
      template: 'cream',
      customBg: null,
      opacity: 40,
      blur: 0,
      title: '2026-2027 學習筆記本',
      subtitle: '每一天都是充滿希望的小冒險 🌸',
      term: '上學期',
      name: '阿剛同學',
      font: 'font-zen'
    },
    theme: 'theme-cream',
    options: {
      showDoodles: true,
      showHabits: true,
      showCorner: true
    },
    zoom: 0.8
  };

  // 封面樣板主題預設圖示與配色裝飾
  const coverTemplates = {
    cream: { icon: '🧸', badge: 'SEMESTER NOTEBOOK', decor: '🧁 🍯 ☕ 🥖' },
    sakura: { icon: '🌸', badge: 'SPRING PLANNER', decor: '🍓 🎀 🍡 🌷' },
    mint: { icon: '🍃', badge: 'DAILY JOURNAL', decor: '🌱 🌿 🥑 🍵' },
    lavender: { icon: '🔮', badge: 'DREAM JOURNAL', decor: '✨ 🌙 🌌 💜' },
    warm: { icon: '🍊', badge: 'HAPPY DAYS', decor: '🌻 🥞 🎈 🍯' },
    minimal: { icon: '✒️', badge: 'MINIMAL STUDY', decor: '📖 ✏️ 📐 ☕' }
  };

  const monthNamesZh = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const monthNamesEn = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const weekDayNames = {
    1: ['週一 MON', '週二 TUE', '週三 WED', '週四 THU', '週五 FRI', '週六 SAT', '週日 SUN'],
    0: ['週日 SUN', '週一 MON', '週二 TUE', '週三 WED', '週四 THU', '週五 FRI', '週六 SAT']
  };

  // ================= DOM 元素快取 =================
  const dom = {
    // 導覽標籤與面板
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // 日期與學期輸入
    inputStartDate: document.getElementById('input-start-date'),
    inputEndDate: document.getElementById('input-end-date'),
    btnFallSem: document.getElementById('btn-fall-sem'),
    btnSpringSem: document.getElementById('btn-spring-sem'),
    btnCurrentMonth: document.getElementById('btn-current-month'),

    // 週次起訖選擇器與小語
    selectStartWeekIdx: document.getElementById('select-start-week-idx'),
    selectEndWeekIdx: document.getElementById('select-end-week-idx'),
    inputWeeklyGlobalQuote: document.getElementById('input-weekly-global-quote'),
    btnApplyQuoteAll: document.getElementById('btn-apply-quote-all'),

    // 方向與設定
    radioOrientations: document.querySelectorAll('input[name="page-orientation"]'),
    selectWeekStart: document.getElementById('select-week-start'),

    // 勾選頁面與頁數
    chkCover: document.getElementById('chk-include-cover'),
    chkTimetable: document.getElementById('chk-include-timetable'),
    selectTimetablePeriods: document.getElementById('select-timetable-periods'),
    chkMonthly: document.getElementById('chk-include-monthly'),
    chkWeekly: document.getElementById('chk-include-weekly'),
    chkGrid: document.getElementById('chk-include-grid'),
    chkDot: document.getElementById('chk-include-dot'),
    inputGridPages: document.getElementById('input-grid-pages'),
    inputDotPages: document.getElementById('input-dot-pages'),

    // 封面設計
    templateCards: document.querySelectorAll('.template-card'),
    coverBgFile: document.getElementById('cover-bg-file'),
    uploadPlaceholder: document.getElementById('upload-placeholder'),
    uploadPreviewWrap: document.getElementById('upload-preview-wrap'),
    uploadImgPreview: document.getElementById('upload-img-preview'),
    btnClearBg: document.getElementById('btn-clear-bg'),
    coverBgOpacity: document.getElementById('cover-bg-opacity'),
    opacityValBadge: document.getElementById('opacity-val-badge'),
    coverBgBlur: document.getElementById('cover-bg-blur'),
    blurValBadge: document.getElementById('blur-val-badge'),
    coverTitle: document.getElementById('cover-title'),
    coverSubtitle: document.getElementById('cover-subtitle'),
    coverTerm: document.getElementById('cover-term'),
    coverName: document.getElementById('cover-name'),
    coverFontStyle: document.getElementById('cover-font-style'),

    // 風格與裝飾
    radioThemes: document.querySelectorAll('input[name="color-theme"]'),
    chkShowDoodles: document.getElementById('chk-show-doodles'),
    chkShowHabits: document.getElementById('chk-show-habits'),
    chkShowCorner: document.getElementById('chk-show-corner'),

    // 匯出與匯入
    btnExportConfig: document.getElementById('btn-export-config'),
    btnImportConfig: document.getElementById('btn-import-config'),
    inputImportFile: document.getElementById('input-import-file'),

    // 操作按鈕
    btnPrint: document.getElementById('btn-print'),
    btnQuickTheme: document.getElementById('btn-quick-theme'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnZoomIn: document.getElementById('btn-zoom-in'),
    btnZoomOut: document.getElementById('btn-zoom-out'),
    btnZoomReset: document.getElementById('btn-zoom-reset'),
    zoomLevelText: document.getElementById('zoom-level'),

    // 預覽與畫布
    pagesViewport: document.getElementById('pages-viewport'),
    pagesCanvas: document.getElementById('pages-canvas'),
    pageQuickNav: document.getElementById('page-quick-nav'),
    badgePageCount: document.getElementById('badge-page-count'),
    badgeOrientation: document.getElementById('badge-orientation'),
    badgeDateRange: document.getElementById('badge-date-range')
  };

  // ================= 初始化預設日期 =================
  function initDefaultDates() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    let start, end;
    // 如果在 6月~11月，預設為上學期 (9/1 ~ 1/31)
    if (currentMonth >= 6 && currentMonth <= 11) {
      start = `${currentYear}-09-01`;
      end = `${currentYear + 1}-01-31`;
      if (dom.coverTerm) dom.coverTerm.value = '上學期';
    } else {
      // 否則預設為下學期 (2/1 ~ 6/30)
      start = `${currentYear}-02-01`;
      end = `${currentYear}-06-30`;
      if (dom.coverTerm) dom.coverTerm.value = '下學期';
    }

    dom.inputStartDate.value = start;
    dom.inputEndDate.value = end;
    state.startDate = start;
    state.endDate = end;
  }

  // ================= 曆法演算邏輯 =================
  function parseDate(str) {
    if (!str) return new Date(NaN);
    const parts = str.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getMonthsInRange(start, end) {
    const months = [];
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (cur <= endMonth) {
      const year = cur.getFullYear();
      const month = cur.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      months.push({
        year,
        month,
        totalDays: lastDay.getDate(),
        firstDayIndex: firstDay.getDay(),
        firstDate: new Date(firstDay),
        lastDate: new Date(lastDay)
      });

      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }

  function getWeeksInRange(start, end, weekStartDay) {
    const weeks = [];
    let cur = new Date(start);

    // 調整至當週的起始日
    const dayOfWeek = cur.getDay();
    let diffToStart = (dayOfWeek - weekStartDay + 7) % 7;
    cur.setDate(cur.getDate() - diffToStart);

    let rawIndex = 1;
    while (cur <= end || weeks.length === 0) {
      const days = [];
      const weekStartDate = new Date(cur);

      for (let i = 0; i < 7; i++) {
        days.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      const weekEndDate = new Date(days[6]);
      const weekKey = `${formatDate(weekStartDate)}_${rawIndex}`;

      weeks.push({
        rawIndex: rawIndex++,
        weekKey: weekKey,
        startDate: weekStartDate,
        endDate: weekEndDate,
        days: days
      });

      // 當整週都在結束日期之後且至少有一週時停止
      if (weekStartDate > end) break;
    }
    return weeks;
  }

  // ================= 更新週次下拉選單 =================
  function updateWeekSelectOptions(weeks) {
    const prevStartVal = parseInt(dom.selectStartWeekIdx.value, 10) || 1;
    const prevEndVal = parseInt(dom.selectEndWeekIdx.value, 10) || weeks.length;

    dom.selectStartWeekIdx.innerHTML = '';
    dom.selectEndWeekIdx.innerHTML = '';

    weeks.forEach((w) => {
      const sStr = `${w.startDate.getMonth() + 1}/${w.startDate.getDate()}`;
      const eStr = `${w.endDate.getMonth() + 1}/${w.endDate.getDate()}`;
      const label = `第 ${w.rawIndex} 個日曆週 (${sStr} ~ ${eStr})`;

      const optStart = document.createElement('option');
      optStart.value = w.rawIndex;
      optStart.textContent = label;
      dom.selectStartWeekIdx.appendChild(optStart);

      const optEnd = document.createElement('option');
      optEnd.value = w.rawIndex;
      optEnd.textContent = label;
      dom.selectEndWeekIdx.appendChild(optEnd);
    });

    // 恢復或設定選取值
    const newStart = Math.min(Math.max(1, prevStartVal), weeks.length);
    const newEnd = Math.min(Math.max(newStart, prevEndVal), weeks.length);

    dom.selectStartWeekIdx.value = newStart;
    dom.selectEndWeekIdx.value = newEnd;

    state.startWeekIndex = newStart;
    state.endWeekIndex = newEnd;
  }

  // ================= 動態注入 @page 列印方向規則 =================
  function updatePrintPageRule(orientation) {
    let styleEl = document.getElementById('dynamic-print-page-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-page-style';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      @page {
        size: A4 ${orientation};
        margin: 0mm !important;
      }
    `;
  }

  // ================= 頁面渲染器 =================
  function renderAll() {
    // 讀取 UI 設定並更新 state
    state.startDate = dom.inputStartDate.value;
    state.endDate = dom.inputEndDate.value;
    state.weekStartDay = parseInt(dom.selectWeekStart.value, 10);
    state.orientation = document.querySelector('input[name="page-orientation"]:checked').value;
    
    // 同步動態 @page 規則
    updatePrintPageRule(state.orientation);
    
    state.includes.cover = dom.chkCover.checked;
    state.includes.timetable = dom.chkTimetable.checked;
    state.timetablePeriods = parseInt(dom.selectTimetablePeriods.value, 10) || 7;
    state.includes.monthly = dom.chkMonthly.checked;
    state.includes.weekly = dom.chkWeekly.checked;
    state.includes.grid = dom.chkGrid.checked;
    state.includes.dot = dom.chkDot.checked;

    state.cover.title = dom.coverTitle.value || '學習筆記本';
    state.cover.subtitle = dom.coverSubtitle.value || '';
    state.cover.term = dom.coverTerm.value || '';
    state.cover.name = dom.coverName.value || '';
    state.cover.font = dom.coverFontStyle.value;
    state.cover.opacity = parseInt(dom.coverBgOpacity.value, 10);
    state.cover.blur = parseInt(dom.coverBgBlur.value, 10);

    state.weeklyGlobalQuote = dom.inputWeeklyGlobalQuote.value || '🌸 Remember to smile every day!';

    state.theme = document.querySelector('input[name="color-theme"]:checked').value;
    state.options.showDoodles = dom.chkShowDoodles.checked;
    state.options.showHabits = dom.chkShowHabits.checked;
    state.options.showCorner = dom.chkShowCorner.checked;

    // 更新畫布 class 與 body 列印 class
    dom.pagesCanvas.className = `pages-canvas ${state.theme} orientation-${state.orientation}`;
    document.body.classList.remove('print-portrait', 'print-landscape');
    document.body.classList.add(`print-${state.orientation}`);

    // 清空畫布與快速導航
    dom.pagesCanvas.innerHTML = '';
    dom.pageQuickNav.innerHTML = '';

    const start = parseDate(state.startDate);
    const end = parseDate(state.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      dom.pagesCanvas.innerHTML = `<div style="padding: 40px; text-align: center; color: #b54a5e; font-weight: bold;">⚠️ 請輸入有效的起始與結束日期（結束日期須晚於起始日期）。</div>`;
      dom.badgePageCount.textContent = '共 0 頁';
      return;
    }

    // 計算週清單並更新下拉選單
    const allWeeks = getWeeksInRange(start, end, state.weekStartDay);
    if (dom.selectStartWeekIdx.options.length !== allWeeks.length) {
      updateWeekSelectOptions(allWeeks);
    } else {
      state.startWeekIndex = parseInt(dom.selectStartWeekIdx.value, 10) || 1;
      state.endWeekIndex = parseInt(dom.selectEndWeekIdx.value, 10) || allWeeks.length;
    }

    let pageNumber = 1;
    const pageIndexList = [];

    // 1. 封面頁
    if (state.includes.cover) {
      const coverEl = createCoverPage(pageNumber);
      dom.pagesCanvas.appendChild(coverEl);
      pageIndexList.push({ title: '🌸 封面', pageNum: pageNumber });
      pageNumber++;
    }

    // 2. 課表頁
    if (state.includes.timetable) {
      const ttEl = createTimetablePage(pageNumber);
      dom.pagesCanvas.appendChild(ttEl);
      pageIndexList.push({ title: '🏫 課表', pageNum: pageNumber });
      pageNumber++;
    }

    // 3. 月計畫頁
    if (state.includes.monthly) {
      const months = getMonthsInRange(start, end);
      months.forEach((m) => {
        const monthEl = createMonthlyPage(m, pageNumber);
        dom.pagesCanvas.appendChild(monthEl);
        pageIndexList.push({ title: `🗓️ ${m.year}/${m.month + 1}月`, pageNum: pageNumber });
        pageNumber++;
      });
    }

    // 4. 週計畫頁
    if (state.includes.weekly) {
      allWeeks.forEach((w) => {
        // 計算教學週次或留空
        let calculatedTitle = '';
        let isConfiguredWeek = false;

        if (w.rawIndex >= state.startWeekIndex && w.rawIndex <= state.endWeekIndex) {
          const teachingWeekNum = w.rawIndex - state.startWeekIndex + 1;
          calculatedTitle = `第 ${teachingWeekNum} 週`;
          isConfiguredWeek = true;
        } else {
          // 未設定在教學週範圍內，留空
          calculatedTitle = '';
          isConfiguredWeek = false;
        }

        // 如果使用者有手動自訂文字，優先採用自訂文字
        const effectiveTitle = (state.customWeekTitles[w.weekKey] !== undefined)
          ? state.customWeekTitles[w.weekKey]
          : calculatedTitle;

        const weekEl = createWeeklyPage(w, pageNumber, effectiveTitle, isConfiguredWeek);
        dom.pagesCanvas.appendChild(weekEl);

        const mLabel = `${w.startDate.getMonth() + 1}/${w.startDate.getDate()}`;
        const navTitle = effectiveTitle ? `📝 ${effectiveTitle} (${mLabel})` : `📝 (${mLabel})`;
        pageIndexList.push({ title: navTitle, pageNum: pageNumber });
        pageNumber++;
      });
    }

    // 5. 附錄方格頁 (多頁支援)
    if (state.includes.grid) {
      const gPages = Math.min(Math.max(1, parseInt(dom.inputGridPages.value, 10) || 1), 50);
      state.gridPages = gPages;
      for (let i = 1; i <= gPages; i++) {
        const gridEl = createGridPage(pageNumber, i, gPages);
        dom.pagesCanvas.appendChild(gridEl);
        const title = gPages > 1 ? `📐 方格 (${i})` : '📐 方格筆記';
        pageIndexList.push({ title, pageNum: pageNumber });
        pageNumber++;
      }
    }

    // 6. 附錄點陣頁 (多頁支援)
    if (state.includes.dot) {
      const dPages = Math.min(Math.max(1, parseInt(dom.inputDotPages.value, 10) || 1), 50);
      state.dotPages = dPages;
      for (let i = 1; i <= dPages; i++) {
        const dotEl = createDotPage(pageNumber, i, dPages);
        dom.pagesCanvas.appendChild(dotEl);
        const title = dPages > 1 ? `✨ 點陣 (${i})` : '✨ 點陣頁';
        pageIndexList.push({ title, pageNum: pageNumber });
        pageNumber++;
      }
    }

    // 更新資訊徽章
    const totalPages = pageNumber - 1;
    dom.badgePageCount.textContent = `共 ${totalPages} 頁`;
    dom.badgeOrientation.textContent = state.orientation === 'portrait' ? '直式 A4' : '橫式 A4';
    dom.badgeDateRange.textContent = `${state.startDate} ~ ${state.endDate}`;

    // 生成快速導覽按鈕
    pageIndexList.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'nav-page-btn';
      btn.textContent = item.title;
      btn.addEventListener('click', () => {
        const targetPage = dom.pagesCanvas.children[item.pageNum - 1];
        if (targetPage) {
          targetPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      dom.pageQuickNav.appendChild(btn);
    });

    applyZoom();
  }

  // ================= 建立裝飾邊框與頁尾通用輔助 =================
  function createCornerDecor() {
    if (!state.options.showCorner) return '';
    return `
      <div class="page-decor-corner corner-tl"></div>
      <div class="page-decor-corner corner-tr"></div>
      <div class="page-decor-corner corner-bl"></div>
      <div class="page-decor-corner corner-br"></div>
    `;
  }

  function createPageFooter(pageNum, customNote = 'Semester Journal ‧ Happy Planning 🌸') {
    return `
      <div class="page-footer-bar">
        <span>${customNote}</span>
        <span>Page ${pageNum}</span>
      </div>
    `;
  }

  // ================= 1. 生成可愛封面頁 =================
  function createCoverPage(pageNum) {
    const page = document.createElement('div');
    page.className = `notebook-page page-cover ${state.options.showCorner ? 'with-corner-border' : ''} ${state.cover.font}`;
    
    const tpl = coverTemplates[state.cover.template] || coverTemplates.cream;

    // 自訂背景或預設背景漸層
    let bgStyle = '';
    if (state.cover.customBg) {
      bgStyle = `background-image: url('${state.cover.customBg}'); opacity: ${state.cover.opacity / 100}; filter: blur(${state.cover.blur}px);`;
    }

    page.innerHTML = `
      ${createCornerDecor()}
      <div class="cover-bg-layer" style="${bgStyle}"></div>
      
      <div class="cover-content-wrap">
        <div class="cover-header-decor">
          <div class="cover-badge-top">${tpl.badge}</div>
          <div class="cover-illustration">${tpl.icon}</div>
        </div>

        <div class="cover-center-card">
          <h1 class="cover-main-title">${escapeHtml(state.cover.title)}</h1>
          <p class="cover-sub-title">${escapeHtml(state.cover.subtitle)}</p>

          <div class="cover-meta-info">
            <div class="meta-row">
              <span class="meta-label">學期 / 年份：</span>
              <span class="meta-value">${escapeHtml(state.cover.term)}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">姓名 / 班級：</span>
              <span class="meta-value">${escapeHtml(state.cover.name)}</span>
            </div>
          </div>
        </div>

        <div class="cover-bottom-doodles">
          ${tpl.decor}
        </div>
      </div>
      ${createPageFooter(pageNum, 'Made with ❤️ for Study & Joy')}
    `;
    return page;
  }

  // ================= 2. 生成學期課表頁 =================
  function createTimetablePage(pageNum) {
    const page = document.createElement('div');
    page.className = `notebook-page page-timetable ${state.options.showCorner ? 'with-corner-border' : ''}`;

    const days = ['星期一 MON', '星期二 TUE', '星期三 WED', '星期四 THU', '星期五 FRI'];
    let headerCols = '<div class="tt-header">節次 / 時間</div>';
    days.forEach(d => {
      headerCols += `<div class="tt-header">${d}</div>`;
    });

    // 預設各節次資訊
    const defaultPeriods = [
      '第 1 節<br><small>08:10-09:00</small>',
      '第 2 節<br><small>09:10-10:00</small>',
      '第 3 節<br><small>10:10-11:00</small>',
      '第 4 節<br><small>11:10-12:00</small>',
      '午休 NOON<br><small>12:00-13:10</small>',
      '第 5 節<br><small>13:20-14:10</small>',
      '第 6 節<br><small>14:20-15:10</small>',
      '第 7 節<br><small>15:20-16:10</small>'
    ];

    if (state.timetablePeriods >= 8) {
      defaultPeriods.push('第 8 節<br><small>16:20-17:10</small>');
    }
    if (state.timetablePeriods >= 9) {
      defaultPeriods.push('第 9 節<br><small>17:20-18:10</small>');
    }

    let cellsHtml = '';
    defaultPeriods.forEach((defP, pIdx) => {
      // 若有自訂文字則使用自訂文字，否則用預設 HTML
      const effectiveLabel = state.customTimetableLabels[pIdx] !== undefined
        ? state.customTimetableLabels[pIdx]
        : defP;

      cellsHtml += `
        <div 
          class="tt-time-col" 
          contenteditable="true" 
          spellcheck="false"
          data-p-idx="${pIdx}" 
          title="點擊可直接修改節次與時間文字"
        >${effectiveLabel}</div>
      `;

      for (let c = 0; c < 5; c++) {
        const cellKey = `${pIdx}_${c}`;
        const cellContent = state.customTimetableCells[cellKey] || '';
        cellsHtml += `
          <div 
            class="tt-cell" 
            contenteditable="true" 
            spellcheck="false"
            data-cell-key="${cellKey}" 
            title="點擊可直接輸入科目或備忘"
          >${escapeHtml(cellContent)}</div>
        `;
      }
    });

    const effectiveGoal = state.customTimetableGoal || '✨ 本學期目標：踏實學習，快樂成長！';
    const gridRowsStyle = `grid-template-rows: 36px repeat(${defaultPeriods.length}, 1fr);`;

    page.innerHTML = `
      ${createCornerDecor()}
      <div class="page-header-ribbon">
        <div class="ribbon-title">
          <span>🎒</span> 學期課程時間表 Class Timetable
        </div>
        <div 
          class="top-goal-pill" 
          contenteditable="true" 
          spellcheck="false" 
          id="tt-goal-pill" 
          title="點擊可修改課表目標標語"
        >${escapeHtml(effectiveGoal)}</div>
      </div>

      <div class="timetable-grid" style="${gridRowsStyle}">
        ${headerCols}
        ${cellsHtml}
      </div>
      ${createPageFooter(pageNum, `Weekly Class Timetable ‧ ${state.timetablePeriods} Periods`)}
    `;

    // 綁定節次文字修改事件
    page.querySelectorAll('.tt-time-col').forEach(col => {
      col.addEventListener('input', (e) => {
        const idx = e.target.dataset.pIdx;
        state.customTimetableLabels[idx] = e.target.innerHTML;
      });
    });

    // 綁定課表格子文字修改事件
    page.querySelectorAll('.tt-cell').forEach(cell => {
      cell.addEventListener('input', (e) => {
        const key = e.target.dataset.cellKey;
        state.customTimetableCells[key] = e.target.innerText;
      });
    });

    // 綁定目標標語修改事件
    const goalEl = page.querySelector('#tt-goal-pill');
    if (goalEl) {
      goalEl.addEventListener('input', (e) => {
        state.customTimetableGoal = e.target.innerText;
      });
    }

    return page;
  }

  // ================= 3. 生成月計畫頁 =================
  function createMonthlyPage(m, pageNum) {
    const page = document.createElement('div');
    page.className = `notebook-page page-monthly ${state.options.showCorner ? 'with-corner-border' : ''}`;

    const weekHeaders = weekDayNames[state.weekStartDay];
    let weekHeaderHtml = '';
    weekHeaders.forEach(w => {
      weekHeaderHtml += `<div class="cal-weekday-header">${w}</div>`;
    });

    // 計算月曆方格
    let firstDayIndex = m.firstDayIndex;
    if (state.weekStartDay === 1) {
      firstDayIndex = (firstDayIndex + 6) % 7; // 週一為 0
    }

    let daysGridHtml = '';
    // 前置空白天數
    for (let i = 0; i < firstDayIndex; i++) {
      daysGridHtml += `<div class="cal-day-cell empty-day"></div>`;
    }

    // 當月天數
    for (let d = 1; d <= m.totalDays; d++) {
      const curDate = new Date(m.year, m.month, d);
      const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;
      daysGridHtml += `
        <div class="cal-day-cell ${isWeekend ? 'weekend' : ''}">
          <span class="cal-day-num">${d}</span>
          <div class="cal-day-lines">
            <div class="cal-mini-line"></div>
            <div class="cal-mini-line"></div>
            <div class="cal-mini-line"></div>
          </div>
        </div>
      `;
    }

    // 補齊後綴方格以達成整齊的整月格子
    const totalFilled = firstDayIndex + m.totalDays;
    const totalSlots = Math.ceil(totalFilled / 7) * 7;
    for (let i = totalFilled; i < totalSlots; i++) {
      daysGridHtml += `<div class="cal-day-cell empty-day"></div>`;
    }

    page.innerHTML = `
      ${createCornerDecor()}
      <div class="monthly-header">
        <div class="monthly-title-group">
          <span class="monthly-big-month">${monthNamesZh[m.month]}</span>
          <span class="monthly-year">${monthNamesEn[m.month]} ${m.year}</span>
        </div>
        <div class="monthly-top-goals">
          <div class="top-goal-pill">🎯 Focus: ____________________</div>
        </div>
      </div>

      <div class="monthly-calendar-container">
        <div class="monthly-calendar-grid">
          <div class="cal-weekdays">
            ${weekHeaderHtml}
          </div>
          <div class="cal-days-grid">
            ${daysGridHtml}
          </div>
        </div>

        <div class="monthly-sidebar">
          <div class="m-side-card">
            <div class="m-side-title">📌 本月重要事項 (Events)</div>
            <div class="m-checklist">
              <div class="m-check-item"><span class="m-box"></span> </div>
              <div class="m-check-item"><span class="m-box"></span> </div>
              <div class="m-check-item"><span class="m-box"></span> </div>
              <div class="m-check-item"><span class="m-box"></span> </div>
              <div class="m-check-item"><span class="m-box"></span> </div>
            </div>
          </div>

          <div class="m-side-card">
            <div class="m-side-title">🌸 備忘與目標 (Notes)</div>
            <div class="m-checklist">
              <div class="m-check-item"><span class="m-box"></span> </div>
              <div class="m-check-item"><span class="m-box"></span> </div>
              <div class="m-check-item"><span class="m-box"></span> </div>
              <div class="m-check-item"><span class="m-box"></span> </div>
            </div>
          </div>
        </div>
      </div>
      ${createPageFooter(pageNum, `Monthly Planner ‧ ${m.year}.${m.month + 1}`)}
    `;
    return page;
  }

  // ================= 4. 生成週計畫頁 (支援可編輯週次) =================
  function createWeeklyPage(w, pageNum, weekTitle, isConfiguredWeek) {
    const page = document.createElement('div');
    page.className = `notebook-page page-weekly ${state.options.showCorner ? 'with-corner-border' : ''}`;

    const zhDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const enDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    let daysHtml = '';
    w.days.forEach(day => {
      const dayNum = day.getDate();
      const dIndex = day.getDay();

      daysHtml += `
        <div class="day-card">
          <div class="day-card-header">
            <div class="day-title-wrap">
              <span class="day-number-pill">${dayNum}</span>
              <span class="day-name-text">${zhDays[dIndex]} <small style="color:var(--page-text-light);font-size:0.75rem;">${enDays[dIndex]}</small></span>
            </div>
            ${state.options.showDoodles ? `
              <div class="day-doodles-bar">
                <span>☀️</span><span>⛅</span><span>🌧️</span><span>😊</span>
              </div>
            ` : ''}
          </div>
          <div class="day-writing-lines">
            <div class="todo-line"><span class="todo-check-circle"></span></div>
            <div class="todo-line"><span class="todo-check-circle"></span></div>
            <div class="todo-line"><span class="todo-check-circle"></span></div>
            <div class="todo-line"><span class="todo-check-circle"></span></div>
            <div class="todo-line"><span class="todo-check-circle"></span></div>
          </div>
        </div>
      `;
    });

    // 第 8 格：每週筆記、Habit Tracker、待辦
    const extraCardHtml = `
      <div class="weekly-extra-card">
        <div>
          <div class="extra-card-title"><span>🌟</span> 本週焦點 (Weekly Focus)</div>
          <div style="border-bottom: 1.5px dashed var(--page-primary); margin: 6px 0 10px; height: 24px;"></div>
        </div>

        ${state.options.showHabits ? `
          <div>
            <div class="extra-card-title" style="font-size:0.82rem; margin-bottom:4px;"><span>🌱</span> 習慣打卡 Habit Tracker</div>
            <div class="habit-tracker-row">
              <span>閱讀 20m</span>
              <div class="habit-dots"><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span></div>
            </div>
            <div class="habit-tracker-row">
              <span>運動喝水</span>
              <div class="habit-dots"><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span></div>
            </div>
            <div class="habit-tracker-row">
              <span>提早就寢</span>
              <div class="habit-dots"><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span><span class="h-dot"></span></div>
            </div>
          </div>
        ` : `
          <div style="flex:1; border:1px dashed var(--page-line); border-radius:6px; background:#fff; margin-top:6px; padding:6px; font-size:0.8rem; color:var(--page-text-light);">
            Memo & Doodles 🌸
          </div>
        `}
      </div>
    `;

    const startStr = `${w.startDate.getFullYear()}.${w.startDate.getMonth() + 1}.${w.startDate.getDate()}`;
    const endStr = `${w.endDate.getMonth() + 1}.${w.endDate.getDate()}`;

    const badgeClass = weekTitle ? 'weekly-badge' : 'weekly-badge empty-week';

    // 決定該週使用的小語 (個別自訂優先，否則用全域預設)
    const effectiveQuote = (state.customWeeklyQuotes[w.weekKey] !== undefined)
      ? state.customWeeklyQuotes[w.weekKey]
      : state.weeklyGlobalQuote;

    page.innerHTML = `
      ${createCornerDecor()}
      <div class="weekly-top-bar">
        <div style="display:flex; align-items:center; gap:12px;">
          <span 
            class="${badgeClass}" 
            contenteditable="true" 
            spellcheck="false"
            data-week-key="${w.weekKey}"
            title="點擊可直接手動修改此處文字"
          >${escapeHtml(weekTitle)}</span>
          <span class="weekly-date-range">${startStr} - ${endStr}</span>
        </div>
        <div 
          class="weekly-focus-box" 
          contenteditable="true" 
          spellcheck="false"
          data-week-key="${w.weekKey}"
          title="點擊可直接修改此週右上角小語"
        >
          ${escapeHtml(effectiveQuote)}
        </div>
      </div>

      <div class="weekly-body-grid">
        ${daysHtml}
        ${extraCardHtml}
      </div>
      ${createPageFooter(pageNum, weekTitle ? `${weekTitle} Planner` : 'Weekly Planner')}
    `;

    // 綁定週次手動修改事件
    const editableBadge = page.querySelector('.weekly-badge');
    if (editableBadge) {
      editableBadge.addEventListener('input', (e) => {
        const text = e.target.innerText.trim();
        state.customWeekTitles[w.weekKey] = text;
        if (text) {
          editableBadge.classList.remove('empty-week');
        } else {
          editableBadge.classList.add('empty-week');
        }
      });
    }

    // 綁定右上角小語個別修改事件
    const editableQuote = page.querySelector('.weekly-focus-box');
    if (editableQuote) {
      editableQuote.addEventListener('input', (e) => {
        const text = e.target.innerText.trim();
        state.customWeeklyQuotes[w.weekKey] = text;
      });
    }

    return page;
  }

  // ================= 5. 生成附錄方格頁 =================
  function createGridPage(pageNum, subIndex = 1, totalSubPages = 1) {
    const page = document.createElement('div');
    page.className = `notebook-page page-grid-notes ${state.options.showCorner ? 'with-corner-border' : ''}`;
    const subLabel = totalSubPages > 1 ? ` (${subIndex}/${totalSubPages})` : '';
    page.innerHTML = `
      ${createCornerDecor()}
      <div class="page-header-ribbon">
        <div class="ribbon-title">
          <span>📐</span> 方格筆記 Grid Notes${subLabel}
        </div>
        <div class="top-goal-pill">Topic: _____________________  Date: ____/____/____</div>
      </div>
      <div class="grid-paper-body"></div>
      ${createPageFooter(pageNum, `Large Grid Paper${subLabel} ‧ Notes & Ideas`)}
    `;
    return page;
  }

  // ================= 6. 生成附錄點陣頁 =================
  function createDotPage(pageNum, subIndex = 1, totalSubPages = 1) {
    const page = document.createElement('div');
    page.className = `notebook-page page-grid-notes ${state.options.showCorner ? 'with-corner-border' : ''}`;
    const subLabel = totalSubPages > 1 ? ` (${subIndex}/${totalSubPages})` : '';
    page.innerHTML = `
      ${createCornerDecor()}
      <div class="page-header-ribbon">
        <div class="ribbon-title">
          <span>✨</span> 點陣筆記 Dot Grid Journal${subLabel}
        </div>
        <div class="top-goal-pill">Topic: _____________________  Date: ____/____/____</div>
      </div>
      <div class="dot-paper-body"></div>
      ${createPageFooter(pageNum, `Large Dot Grid${subLabel} ‧ Bullet Journal`)}
    `;
    return page;
  }

  // ================= 縮放功能 =================
  function applyZoom() {
    dom.pagesCanvas.style.transform = `scale(${state.zoom})`;
    dom.zoomLevelText.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  // ================= 輔助轉義 =================
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ================= 事件監聽綁定 =================

  // 1. 標籤頁切換
  dom.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.tabBtns.forEach(b => b.classList.remove('active'));
      dom.tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

  // 2. 快速學期設定按鈕
  dom.btnFallSem.addEventListener('click', () => {
    const y = new Date().getFullYear();
    dom.inputStartDate.value = `${y}-09-01`;
    dom.inputEndDate.value = `${y + 1}-01-31`;
    dom.coverTerm.value = '上學期';
    renderAll();
  });

  dom.btnSpringSem.addEventListener('click', () => {
    const y = new Date().getFullYear();
    dom.inputStartDate.value = `${y}-02-01`;
    dom.inputEndDate.value = `${y}-06-30`;
    dom.coverTerm.value = '下學期';
    renderAll();
  });

  dom.btnCurrentMonth.addEventListener('click', () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    dom.inputStartDate.value = formatDate(start);
    dom.inputEndDate.value = formatDate(end);
    renderAll();
  });

  // 3. 週次起訖變更
  dom.selectStartWeekIdx.addEventListener('change', () => {
    state.startWeekIndex = parseInt(dom.selectStartWeekIdx.value, 10);
    renderAll();
  });

  dom.selectEndWeekIdx.addEventListener('change', () => {
    state.endWeekIndex = parseInt(dom.selectEndWeekIdx.value, 10);
    renderAll();
  });

  // 4. 輸入變更即時重新渲染
  const autoUpdateInputs = [
    dom.inputStartDate, dom.inputEndDate, dom.selectWeekStart,
    dom.chkCover, dom.chkTimetable, dom.selectTimetablePeriods,
    dom.chkMonthly, dom.chkWeekly, 
    dom.chkGrid, dom.chkDot, dom.inputGridPages, dom.inputDotPages,
    dom.inputWeeklyGlobalQuote,
    dom.coverTitle, dom.coverSubtitle, dom.coverTerm, dom.coverName, dom.coverFontStyle,
    dom.chkShowDoodles, dom.chkShowHabits, dom.chkShowCorner
  ];

  autoUpdateInputs.forEach(input => {
    input.addEventListener('input', renderAll);
    input.addEventListener('change', renderAll);
  });

  // 套用每週小語至全部按鈕
  dom.btnApplyQuoteAll.addEventListener('click', () => {
    state.customWeeklyQuotes = {}; // 清空個別自訂，全部重設為全域小語
    state.weeklyGlobalQuote = dom.inputWeeklyGlobalQuote.value || '🌸 Remember to smile every day!';
    renderAll();
  });

  dom.radioOrientations.forEach(r => r.addEventListener('change', renderAll));
  dom.radioThemes.forEach(r => r.addEventListener('change', renderAll));

  // 5. 封面樣板切換
  dom.templateCards.forEach(card => {
    card.addEventListener('click', () => {
      dom.templateCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.cover.template = card.dataset.template;
      renderAll();
    });
  });

  // 6. 自訂背景圖上傳與調節
  dom.coverBgFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        state.cover.customBg = event.target.result;
        dom.uploadImgPreview.src = event.target.result;
        dom.uploadPlaceholder.classList.add('hidden');
        dom.uploadPreviewWrap.classList.remove('hidden');
        renderAll();
      };
      reader.readAsDataURL(file);
    }
  });

  dom.btnClearBg.addEventListener('click', (e) => {
    e.stopPropagation();
    state.cover.customBg = null;
    dom.coverBgFile.value = '';
    dom.uploadPlaceholder.classList.remove('hidden');
    dom.uploadPreviewWrap.classList.add('hidden');
    renderAll();
  });

  dom.coverBgOpacity.addEventListener('input', (e) => {
    dom.opacityValBadge.textContent = `${e.target.value}%`;
    state.cover.opacity = parseInt(e.target.value, 10);
    renderAll();
  });

  dom.coverBgBlur.addEventListener('input', (e) => {
    dom.blurValBadge.textContent = `${e.target.value}px`;
    state.cover.blur = parseInt(e.target.value, 10);
    renderAll();
  });

  // 7. 縮放控制
  dom.btnZoomIn.addEventListener('click', () => {
    if (state.zoom < 1.4) {
      state.zoom += 0.1;
      applyZoom();
    }
  });

  dom.btnZoomOut.addEventListener('click', () => {
    if (state.zoom > 0.3) {
      state.zoom -= 0.1;
      applyZoom();
    }
  });

  dom.btnZoomReset.addEventListener('click', () => {
    state.zoom = 0.8;
    applyZoom();
  });

  // 8. 隨機配色主題
  dom.btnQuickTheme.addEventListener('click', () => {
    const themeValues = ['theme-cream', 'theme-sakura', 'theme-mint', 'theme-lavender', 'theme-ocean'];
    const currentTheme = document.querySelector('input[name="color-theme"]:checked').value;
    const otherThemes = themeValues.filter(t => t !== currentTheme);
    const nextTheme = otherThemes[Math.floor(Math.random() * otherThemes.length)];
    
    const targetRadio = document.querySelector(`input[name="color-theme"][value="${nextTheme}"]`);
    if (targetRadio) {
      targetRadio.checked = true;
      renderAll();
    }
  });

  // 9. 匯出設定 (Export JSON)
  dom.btnExportConfig.addEventListener('click', () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      state: {
        startDate: state.startDate,
        endDate: state.endDate,
        orientation: state.orientation,
        weekStartDay: state.weekStartDay,
        startWeekIndex: state.startWeekIndex,
        endWeekIndex: state.endWeekIndex,
        includes: state.includes,
        timetablePeriods: state.timetablePeriods,
        gridPages: state.gridPages,
        dotPages: state.dotPages,
        cover: state.cover,
        theme: state.theme,
        options: state.options,
        weeklyGlobalQuote: state.weeklyGlobalQuote,
        customWeekTitles: state.customWeekTitles,
        customWeeklyQuotes: state.customWeeklyQuotes,
        customTimetableLabels: state.customTimetableLabels,
        customTimetableCells: state.customTimetableCells,
        customTimetableGoal: state.customTimetableGoal
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const now = new Date();
    const dateTag = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    a.href = url;
    a.download = `學期手寫筆記本設定檔_${dateTag}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // 10. 匯入設定 (Import JSON)
  dom.btnImportConfig.addEventListener('click', () => {
    dom.inputImportFile.value = '';
    dom.inputImportFile.click();
  });

  dom.inputImportFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        const s = imported.state || imported;

        // 依序還原狀態
        if (s.startDate) dom.inputStartDate.value = s.startDate;
        if (s.endDate) dom.inputEndDate.value = s.endDate;
        if (s.weekStartDay !== undefined) dom.selectWeekStart.value = s.weekStartDay;
        
        if (s.orientation) {
          const radioOri = document.querySelector(`input[name="page-orientation"][value="${s.orientation}"]`);
          if (radioOri) radioOri.checked = true;
        }

        if (s.includes) {
          dom.chkCover.checked = !!s.includes.cover;
          dom.chkTimetable.checked = !!s.includes.timetable;
          dom.chkMonthly.checked = !!s.includes.monthly;
          dom.chkWeekly.checked = !!s.includes.weekly;
          dom.chkGrid.checked = !!s.includes.grid;
          dom.chkDot.checked = !!s.includes.dot;
        }

        if (s.timetablePeriods !== undefined) dom.selectTimetablePeriods.value = s.timetablePeriods;
        if (s.gridPages !== undefined) dom.inputGridPages.value = s.gridPages;
        if (s.dotPages !== undefined) dom.inputDotPages.value = s.dotPages;

        if (s.weeklyGlobalQuote !== undefined) dom.inputWeeklyGlobalQuote.value = s.weeklyGlobalQuote;

        if (s.cover) {
          state.cover = Object.assign({}, state.cover, s.cover);
          dom.coverTitle.value = state.cover.title || '';
          dom.coverSubtitle.value = state.cover.subtitle || '';
          dom.coverTerm.value = state.cover.term || '';
          dom.coverName.value = state.cover.name || '';
          dom.coverFontStyle.value = state.cover.font || 'font-zen';
          dom.coverBgOpacity.value = state.cover.opacity !== undefined ? state.cover.opacity : 40;
          dom.opacityValBadge.textContent = `${dom.coverBgOpacity.value}%`;
          dom.coverBgBlur.value = state.cover.blur !== undefined ? state.cover.blur : 0;
          dom.blurValBadge.textContent = `${dom.coverBgBlur.value}px`;

          // 背景圖片還原
          if (state.cover.customBg) {
            dom.uploadImgPreview.src = state.cover.customBg;
            dom.uploadPlaceholder.classList.add('hidden');
            dom.uploadPreviewWrap.classList.remove('hidden');
          } else {
            dom.uploadPlaceholder.classList.remove('hidden');
            dom.uploadPreviewWrap.classList.add('hidden');
          }

          // 封面樣板卡片 active 還原
          dom.templateCards.forEach(c => {
            if (c.dataset.template === state.cover.template) {
              c.classList.add('active');
            } else {
              c.classList.remove('active');
            }
          });
        }

        if (s.theme) {
          const radioTh = document.querySelector(`input[name="color-theme"][value="${s.theme}"]`);
          if (radioTh) radioTh.checked = true;
        }

        if (s.options) {
          dom.chkShowDoodles.checked = s.options.showDoodles !== false;
          dom.chkShowHabits.checked = s.options.showHabits !== false;
          dom.chkShowCorner.checked = s.options.showCorner !== false;
        }

        // 快取文字還原
        state.customWeekTitles = s.customWeekTitles || {};
        state.customWeeklyQuotes = s.customWeeklyQuotes || {};
        state.customTimetableLabels = s.customTimetableLabels || {};
        state.customTimetableCells = s.customTimetableCells || {};
        state.customTimetableGoal = s.customTimetableGoal || '';

        renderAll();

        // 還原週次起訖選擇器值 (在 renderAll 生成 options 後)
        if (s.startWeekIndex !== undefined) dom.selectStartWeekIdx.value = s.startWeekIndex;
        if (s.endWeekIndex !== undefined) dom.selectEndWeekIdx.value = s.endWeekIndex;
        renderAll();

        alert('🌸 設定檔已成功匯入！已完整套用所有版面與自訂文字設定。');
      } catch (err) {
        console.error(err);
        alert('⚠️ 匯入失敗：請確認所選取的 JSON 檔案格式是否正確。');
      }
    };
    reader.readAsText(file);
  });

  dom.btnRefresh.addEventListener('click', renderAll);

  // 11. 列印與匯出 PDF
  dom.btnPrint.addEventListener('click', () => {
    window.print();
  });

  // 啟動初始化
  initDefaultDates();
  renderAll();
});
