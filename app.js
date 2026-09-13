const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// Локальный справочник базовых продуктов (КБЖУ на 100г)
const BUILTIN_FOOD_DB = [
  // Молочка и яйца
  { name: "Творог 5%", cals: 121, prot: 16.0, fat: 5.0, carb: 3.0 },
  { name: "Творог 0% (обезжиренный)", cals: 71, prot: 16.5, fat: 0.2, carb: 1.3 },
  { name: "Творог 9%", cals: 159, prot: 14.0, fat: 9.0, carb: 2.0 },
  { name: "Яйцо куриное (1 шт ~55г)", cals: 143, prot: 12.7, fat: 10.9, carb: 0.7 },
  { name: "Яичный белок", cals: 44, prot: 11.1, fat: 0.2, carb: 0.7 },
  { name: "Молоко 2.5%", cals: 52, prot: 2.8, fat: 2.5, carb: 4.7 },
  { name: "Молоко 3.2%", cals: 59, prot: 2.9, fat: 3.2, carb: 4.7 },
  { name: "Йогурт греческий Teos 2%", cals: 66, prot: 8.0, fat: 2.0, carb: 4.2 },
  { name: "Сыр Российский 45%", cals: 350, prot: 24.0, fat: 28.0, carb: 0.0 },
  { name: "Сыр Моцарелла", cals: 280, prot: 18.0, fat: 22.0, carb: 2.2 },
  { name: "Сыр Сулугуни", cals: 285, prot: 19.5, fat: 22.0, carb: 0.0 },
  { name: "Сыр Пармезан", cals: 392, prot: 35.8, fat: 25.8, carb: 3.2 },
  { name: "Кефир 1%", cals: 40, prot: 3.0, fat: 1.0, carb: 4.0 },
  { name: "Кефир 2.5%", cals: 53, prot: 2.9, fat: 2.5, carb: 4.0 },
  { name: "Сметана 15%", cals: 158, prot: 2.6, fat: 15.0, carb: 3.0 },
  { name: "Масло сливочное 82.5%", cals: 748, prot: 0.6, fat: 82.5, carb: 0.8 },

  // Мясо, птица, рыба
  { name: "Куриное филе (грудка варёная / гриль)", cals: 135, prot: 29.0, fat: 2.0, carb: 0.0 },
  { name: "Куриное филе сырое", cals: 110, prot: 23.0, fat: 1.2, carb: 0.0 },
  { name: "Куриное бедро без кожи", cals: 170, prot: 20.0, fat: 10.0, carb: 0.0 },
  { name: "Индейка (филе грудки)", cals: 115, prot: 24.0, fat: 1.5, carb: 0.0 },
  { name: "Говядина постная отварная", cals: 180, prot: 26.0, fat: 8.0, carb: 0.0 },
  { name: "Фарш говяжий нежирный", cals: 215, prot: 20.0, fat: 15.0, carb: 0.0 },
  { name: "Свинина нежирная вырезка", cals: 190, prot: 21.0, fat: 11.0, carb: 0.0 },
  { name: "Лосось / Форель запечённая", cals: 206, prot: 20.0, fat: 13.0, carb: 0.0 },
  { name: "Тунец в собственном соку", cals: 101, prot: 23.5, fat: 0.8, carb: 0.0 },
  { name: "Минтай / Треска филе", cals: 72, prot: 16.0, fat: 0.8, carb: 0.0 },
  { name: "Креветки варёные", cals: 95, prot: 20.5, fat: 1.5, carb: 0.0 },

  // Крупы, гарниры
  { name: "Гречка (крупа сухая)", cals: 310, prot: 12.6, fat: 3.3, carb: 62.0 },
  { name: "Гречка варёная на воде", cals: 105, prot: 4.2, fat: 1.1, carb: 21.3 },
  { name: "Овсяные хлопья (Геркулес сухой)", cals: 350, prot: 12.0, fat: 6.0, carb: 62.0 },
  { name: "Овсяная каша на воде", cals: 88, prot: 3.0, fat: 1.7, carb: 15.0 },
  { name: "Рис белый (сухой)", cals: 344, prot: 6.7, fat: 0.7, carb: 78.0 },
  { name: "Рис варёный", cals: 116, prot: 2.5, fat: 0.3, carb: 25.0 },
  { name: "Макароны тв. сортов (сухие)", cals: 350, prot: 13.0, fat: 1.5, carb: 71.0 },
  { name: "Макароны отварные", cals: 130, prot: 5.0, fat: 0.6, carb: 26.0 },
  { name: "Картофель отварной", cals: 82, prot: 2.0, fat: 0.4, carb: 17.5 },
  { name: "Хлеб цельнозерновой", cals: 215, prot: 9.0, fat: 2.0, carb: 40.0 },
  { name: "Хлеб бородинский / ржаной", cals: 205, prot: 6.8, fat: 1.3, carb: 40.0 },

  // Овощи и фрукты
  { name: "Огурцы свежие", cals: 15, prot: 0.8, fat: 0.1, carb: 3.0 },
  { name: "Помидоры свежие", cals: 20, prot: 0.9, fat: 0.2, carb: 3.9 },
  { name: "Банан (1 шт ~120г)", cals: 89, prot: 1.5, fat: 0.2, carb: 21.8 },
  { name: "Яблоко", cals: 52, prot: 0.3, fat: 0.2, carb: 13.8 },
  { name: "Масло оливковое / растительное", cals: 899, prot: 0.0, fat: 99.9, carb: 0.0 },
  { name: "Протеин сывороточный (1 скуп ~30г)", cals: 380, prot: 75.0, fat: 4.5, carb: 8.0 }
];

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}`;
}

function getTodayIso() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateInitialSchedule() {
  const list = [];
  const baseDate = new Date();

  for (let i = 0; i < 16; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i * 7);

    let dose = 0.25;
    if (i >= 4 && i < 8) dose = 0.5;
    if (i >= 8) dose = 1.0;

    list.push({
      id: Date.now() + i,
      week: i + 1,
      isoDate: d.toISOString(),
      dateStr: `${formatDate(d)}, ${DAYS[d.getDay()]}`,
      dose: dose,
      weight: null,
      done: false,
      doneTime: null
    });
  }
  return list;
}

// ================= СОСТОЯНИЕ (STATE) =================
let state = JSON.parse(localStorage.getItem("semavik_life_data_v2")) || generateInitialSchedule();
let targetWeight = parseFloat(localStorage.getItem("semavik_target_weight")) || null;
let isLight = localStorage.getItem("semavik_theme") === "light";
let chartInstance = null;

let foodLog = JSON.parse(localStorage.getItem("semavik_food_log")) || {};
let foodGoals = JSON.parse(localStorage.getItem("semavik_food_goals")) || {
  cals: 2100,
  p: 140,
  f: 70,
  c: 200
};
let selectedFoodDate = getTodayIso();
let activeTab = "weight";

let currentPickedProduct = null;
let searchDebounceTimeout = null;
let quickAddBase100 = null;

// ================= ТЕМА И ВКЛАДКИ =================
function applyTheme() {
  const themeBtn = document.getElementById("themeBtn");
  if (isLight) {
    document.body.classList.add("light-theme");
    if (themeBtn) themeBtn.innerText = "🌙";
  } else {
    document.body.classList.remove("light-theme");
    if (themeBtn) themeBtn.innerText = "☀️";
  }
}

function toggleTheme() {
  isLight = !isLight;
  localStorage.setItem("semavik_theme", isLight ? "light" : "dark");
  applyTheme();
  renderChart();
}

function switchTab(tab) {
  activeTab = tab;
  const tabBtnW = document.getElementById("tabBtnWeight");
  const tabBtnF = document.getElementById("tabBtnFood");
  const tabContentW = document.getElementById("tabWeightContent");
  const tabContentF = document.getElementById("tabFoodContent");
  const bottomBar = document.getElementById("bottomBarWeight");

  if (!tabBtnW || !tabBtnF || !tabContentW || !tabContentF) return;

  if (tab === "weight") {
    tabBtnW.classList.add("active");
    tabBtnF.classList.remove("active");
    tabContentW.style.display = "flex";
    tabContentF.style.display = "none";
    if (bottomBar) bottomBar.style.display = "flex";
    renderChart();
  } else {
    tabBtnF.classList.add("active");
    tabBtnW.classList.remove("active");
    tabContentF.style.display = "flex";
    tabContentW.style.display = "none";
    if (bottomBar) bottomBar.style.display = "none";
    renderFood();
  }
}

function save() {
  localStorage.setItem("semavik_life_data_v2", JSON.stringify(state));
  if (targetWeight !== null) {
    localStorage.setItem("semavik_target_weight", targetWeight);
  } else {
    localStorage.removeItem("semavik_target_weight");
  }
  localStorage.setItem("semavik_food_log", JSON.stringify(foodLog));
  localStorage.setItem("semavik_food_goals", JSON.stringify(foodGoals));
  render();
}

// ================= ТЕРАПИЯ И ВЕС =================
function changeStartDate(newDateStr) {
  if (!newDateStr) return;
  const [year, month, day] = newDateStr.split("-").map(Number);
  const baseDate = new Date(year, month - 1, day);

  state.forEach((item, index) => {
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + index * 7);
    item.isoDate = nextDate.toISOString();
    item.dateStr = `${formatDate(nextDate)}, ${DAYS[nextDate.getDay()]}`;
  });
  save();
}

function openDateModal() {
  const modal = document.getElementById("dateModal");
  const input = document.getElementById("customDateInput");
  const current = state[0] && state[0].isoDate ? state[0].isoDate.slice(0, 10) : getTodayIso();
  input.value = current;
  modal.classList.add("active");
}

function closeDateModal() {
  document.getElementById("dateModal").classList.remove("active");
}

function applyCustomDate() {
  const val = document.getElementById("customDateInput").value;
  if (val) {
    changeStartDate(val);
    closeDateModal();
  }
}

function openTargetModal() {
  const modal = document.getElementById("targetModal");
  const input = document.getElementById("customTargetInput");
  input.value = targetWeight !== null ? targetWeight : "";
  modal.classList.add("active");
}

function closeTargetModal() {
  document.getElementById("targetModal").classList.remove("active");
}

function applyCustomTarget() {
  const val = document.getElementById("customTargetInput").value;
  targetWeight = val !== "" && !isNaN(val) ? parseFloat(val) : null;
  save();
  closeTargetModal();
}

function toggleWeek(idx) {
  state[idx].done = !state[idx].done;
  if (state[idx].done) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dayMonth = now.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
    state[idx].doneTime = `${time} ${dayMonth}`;
  } else {
    state[idx].doneTime = null;
  }
  save();
}

function updateWeight(idx, val) {
  state[idx].weight = val !== "" && !isNaN(val) ? parseFloat(val) : null;
  save();
}

function updateDose(idx, val) {
  state[idx].dose = parseFloat(val);
  save();
}

function deleteRow(idx) {
  if (state.length <= 1) return;
  if (confirm(`Удалить Неделю ${state[idx].week}?`)) {
    state.splice(idx, 1);
    state.forEach((item, i) => (item.week = i + 1));
    save();
  }
}

function addNewWeek() {
  const lastItem = state[state.length - 1];
  const lastDate = lastItem && lastItem.isoDate ? new Date(lastItem.isoDate) : new Date();

  const nextDate = new Date(lastDate);
  nextDate.setDate(lastDate.getDate() + 7);

  state.push({
    id: Date.now(),
    week: state.length + 1,
    isoDate: nextDate.toISOString(),
    dateStr: `${formatDate(nextDate)}, ${DAYS[nextDate.getDay()]}`,
    dose: lastItem ? lastItem.dose : 0.25,
    weight: null,
    done: false,
    doneTime: null
  });

  save();
  setTimeout(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }, 50);
}

function renderStats() {
  const recorded = state.filter(s => s.weight !== null && !isNaN(s.weight));
  
  const dispStart = document.getElementById("disp-start");
  const dispCurrent = document.getElementById("disp-current");
  const dispTarget = document.getElementById("disp-target");
  const valEl = document.getElementById("disp-diff");
  const badgeEl = document.querySelector(".stat-cell.highlight");
  const titleEl = document.getElementById("disp-diff-title");

  const progressBox = document.getElementById("progressBox");
  const progressText = document.getElementById("progressText");
  const progressRemaining = document.getElementById("progressRemaining");
  const progressBar = document.getElementById("targetProgressBar");

  dispTarget.innerText = targetWeight !== null ? `${targetWeight} кг` : "Задать";

  if (recorded.length === 0) {
    dispStart.innerText = "—";
    dispCurrent.innerText = "—";
    valEl.innerText = "—";
    titleEl.innerText = "Сброшено:";
    badgeEl.classList.remove("danger");
    progressBox.style.display = "none";
    return;
  }

  const startW = recorded[0].weight;
  const currentW = recorded[recorded.length - 1].weight;
  const diff = parseFloat((currentW - startW).toFixed(1));

  dispStart.innerText = `${startW} кг`;
  dispCurrent.innerText = `${currentW} кг`;

  if (diff > 0) {
    badgeEl.classList.add("danger");
    titleEl.innerText = "Набрано:";
    valEl.innerText = `+${diff} кг`;
  } else {
    badgeEl.classList.remove("danger");
    titleEl.innerText = "Сброшено:";
    valEl.innerText = `${diff} кг`;
  }

  if (targetWeight !== null) {
    progressBox.style.display = "flex";
    const totalToLose = startW - targetWeight;

    if (totalToLose > 0) {
      const lostSoFar = startW - currentW;
      let percent = Math.round((lostSoFar / totalToLose) * 100);
      percent = Math.max(0, Math.min(100, percent));
      const remaining = parseFloat((currentW - targetWeight).toFixed(1));
      
      progressText.innerText = `Прогресс: ${percent}%`;
      progressRemaining.innerText = remaining > 0 ? `Осталось: ${remaining} кг` : `Цель достигнута! 🎉`;
      progressBar.style.width = `${percent}%`;
    } else {
      progressBox.style.display = "none";
    }
  } else {
    progressBox.style.display = "none";
  }
}

function renderChart() {
  if (activeTab !== "weight") return;
  const points = state.filter(s => s.weight !== null && !isNaN(s.weight));
  const labels = points.map(s => `Н${s.week} (${s.weight})`);
  const data = points.map(s => s.weight);

  const canvas = document.getElementById("weightChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (chartInstance) chartInstance.destroy();

  const lineColor = isLight ? "#ea580c" : "#38bdf8";
  const tickColor = isLight ? "#9a3412" : "#607282";

  const gradient = ctx.createLinearGradient(0, 0, 0, 140);
  if (isLight) {
    gradient.addColorStop(0, "rgba(234, 88, 12, 0.22)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
  } else {
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.28)");
    gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");
  }

  const datasets = [
    {
      label: "Вес",
      data: data,
      borderColor: lineColor,
      borderWidth: 2.5,
      backgroundColor: gradient,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: lineColor,
      pointBorderColor: isLight ? "#ffffff" : "#121820",
      pointBorderWidth: 2,
      pointRadius: 4.5,
      pointHoverRadius: 6
    }
  ];

  if (targetWeight !== null && data.length > 0) {
    datasets.push({
      label: "Цель",
      data: new Array(data.length).fill(targetWeight),
      borderColor: isLight ? "#dc2626" : "#f43f5e",
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      tension: 0
    });
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isLight ? "#431407" : "#1e293b",
          callbacks: { label: c => `${c.dataset.label || "Вес"}: ${c.parsed.y} кг` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 9 } } },
        y: { display: false }
      }
    }
  });
}

function renderSchedule() {
  const list = document.getElementById("entryList");
  if (!list) return;
  list.innerHTML = "";

  state.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = `entry-row ${item.done ? "" : "pending"}`;

    const btnHtml = item.done
      ? `<button class="action-btn" onclick="toggleWeek(${idx})">✓ ${item.doneTime || "Сделано"}</button>`
      : `<button class="action-btn uncompleted" onclick="toggleWeek(${idx})">Сделать</button>`;

    const labelHtml =
      idx === 0
        ? `Неделя 1 <span class="date-edit-wrapper" onclick="openDateModal()">
            <span class="date-display-text">(${item.dateStr})</span>
           </span>`
        : `Неделя ${item.week} (${item.dateStr})`;

    row.innerHTML = `
      <div class="left-group">
        ${btnHtml}
        <div class="entry-info">
          <span class="entry-label">${labelHtml}</span>
          <select class="dose-select" onchange="updateDose(${idx}, this.value)">
            <option value="0.25" ${item.dose === 0.25 ? "selected" : ""}>0.25 мг</option>
            <option value="0.5" ${item.dose === 0.5 ? "selected" : ""}>0.5 мг</option>
            <option value="1.0" ${item.dose === 1.0 ? "selected" : ""}>1.0 мг</option>
            <option value="1.7" ${item.dose === 1.7 ? "selected" : ""}>1.7 мг</option>
            <option value="2.4" ${item.dose === 2.4 ? "selected" : ""}>2.4 мг</option>
          </select>
        </div>
      </div>
      <div class="right-group">
        <div class="weight-wrap">
          <input 
            type="number" 
            step="0.1" 
            placeholder="—"
            class="weight-val-input" 
            value="${item.weight !== null ? item.weight : ""}" 
            onchange="updateWeight(${idx}, this.value)"
          />
          <span class="weight-unit">кг</span>
        </div>
        <button class="btn-del" onclick="deleteRow(${idx})" title="Удалить">✕</button>
      </div>
    `;
    list.appendChild(row);
  });
}

// ================= ПИТАНИЕ =================
function changeFoodDate(deltaDays) {
  const [y, m, d] = selectedFoodDate.split("-").map(Number);
  const curDate = new Date(y, m - 1, d);
  curDate.setDate(curDate.getDate() + deltaDays);

  const newY = curDate.getFullYear();
  const newM = String(curDate.getMonth() + 1).padStart(2, "0");
  const newD = String(curDate.getDate()).padStart(2, "0");
  selectedFoodDate = `${newY}-${newM}-${newD}`;

  renderFood();
}

function renderFood() {
  const today = getTodayIso();
  const labelEl = document.getElementById("foodDateLabel");
  if (!labelEl) return;

  if (selectedFoodDate === today) {
    labelEl.innerText = "Сегодня";
  } else {
    const [y, m, d] = selectedFoodDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    labelEl.innerText = `${formatDate(dateObj)}, ${DAYS[dateObj.getDay()]}`;
  }

  document.getElementById("foodTargetCals").innerText = foodGoals.cals;
  document.getElementById("foodTargetProtein").innerText = `/ ${foodGoals.p}г`;
  document.getElementById("foodTargetFat").innerText = `/ ${foodGoals.f}г`;
  document.getElementById("foodTargetCarbs").innerText = `/ ${foodGoals.c}г`;

  const dayEntries = foodLog[selectedFoodDate] || [];
  let totalC = 0, totalP = 0, totalF = 0, totalCarbs = 0;

  dayEntries.forEach(item => {
    totalC += item.cals || 0;
    totalP += item.p || 0;
    totalF += item.f || 0;
    totalCarbs += item.c || 0;
  });

  totalC = Math.round(totalC);
  totalP = Math.round(totalP);
  totalF = Math.round(totalF);
  totalCarbs = Math.round(totalCarbs);

  document.getElementById("foodTotalCals").innerText = totalC;
  document.getElementById("foodTotalProtein").innerText = `${totalP}г`;
  document.getElementById("foodTotalFat").innerText = `${totalF}г`;
  document.getElementById("foodTotalCarbs").innerText = `${totalCarbs}г`;

  const remain = foodGoals.cals - totalC;
  const remainEl = document.getElementById("foodRemainCals");
  remainEl.innerText = remain;
  remainEl.style.color = remain >= 0 ? "var(--green-badge)" : "#dc2626";

  const percent = Math.min(100, Math.round((totalC / foodGoals.cals) * 100)) || 0;
  const barEl = document.getElementById("foodCalProgress");
  barEl.style.width = `${percent}%`;
  barEl.style.backgroundColor = totalC > foodGoals.cals ? "#dc2626" : "var(--green-badge)";

  const logList = document.getElementById("foodLogList");
  logList.innerHTML = "";

  if (dayEntries.length === 0) {
    logList.innerHTML = `<div style="text-align: center; color: var(--text-sub); font-size: 0.85rem; padding: 20px;">На этот день записей пока нет</div>`;
    return;
  }

  dayEntries.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "food-item-row";

    // Отображение веса порции
    const weightBadge = (item.grams && !isNaN(item.grams)) ? `${item.grams} г/мл • ` : "";

    row.innerHTML = `
      <div class="food-item-info">
        <span class="food-item-name">${item.name}</span>
        <span class="food-item-sub">${weightBadge}Б: ${item.p}г | Ж: ${item.f}г | У: ${item.c}г</span>
      </div>
      <div class="food-item-right">
        <span class="food-item-cals">${item.cals} ккал</span>
        <button class="btn-del" onclick="deleteFoodEntry(${idx})">✕</button>
      </div>
    `;
    logList.appendChild(row);
  });
}

function deleteFoodEntry(idx) {
  if (!foodLog[selectedFoodDate]) return;
  foodLog[selectedFoodDate].splice(idx, 1);
  save();
  renderFood();
}

function openFoodSearchModal() {
  document.getElementById("foodSearchModal").classList.add("active");
  document.getElementById("foodSearchQuery").value = "";
  document.getElementById("searchResultsList").innerHTML = "";
  document.getElementById("selectedProductBox").style.display = "none";
  currentPickedProduct = null;
}

function closeFoodSearchModal() {
  document.getElementById("foodSearchModal").classList.remove("active");
}

function debounceFoodSearch() {
  clearTimeout(searchDebounceTimeout);
  const q = document.getElementById("foodSearchQuery").value.trim().toLowerCase();
  const container = document.getElementById("searchResultsList");

  if (q.length < 2) {
    container.innerHTML = "";
    document.getElementById("foodSearchLoading").style.display = "none";
    return;
  }

  const localMatches = BUILTIN_FOOD_DB.filter(item => item.name.toLowerCase().includes(q));
  renderSearchResults(localMatches, q);
}

function renderSearchResults(products, currentQuery = "") {
  const container = document.getElementById("searchResultsList");
  container.innerHTML = "";

  if (products.length > 0) {
    products.forEach(p => {
      const item = document.createElement("div");
      item.className = "search-res-item";
      item.innerHTML = `
        <div class="search-res-title">${p.name}</div>
        <div class="search-res-sub">100г: ${p.cals} ккал | Б:${p.prot}г Ж:${p.fat}г У:${p.carb}г</div>
      `;
      item.onclick = () => selectProductFromSearch(p);
      container.appendChild(item);
    });
  }

  const extBtn = document.createElement("div");
  extBtn.style.textAlign = "center";
  extBtn.style.padding = "8px";
  extBtn.innerHTML = `
    <button class="btn-secondary" style="font-size: 0.78rem; width: 100%; border-style: dashed;" onclick="triggerExternalSearch('${currentQuery}')">
      🌐 Искать «${currentQuery}» во внешней базе Open Food Facts
    </button>
  `;
  container.appendChild(extBtn);
}

async function triggerExternalSearch(query) {
  if (!query) return;
  const loader = document.getElementById("foodSearchLoading");
  loader.style.display = "flex";

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15`;
    const res = await fetch(url);
    const data = await res.json();
    loader.style.display = "none";

    const parsed = (data.products || [])
      .filter(p => p.product_name || p.product_name_ru)
      .map(p => {
        const n = p.nutriments || {};
        return {
          name: `${p.product_name_ru || p.product_name} ${p.brands ? `(${p.brands})` : ""}`.trim(),
          cals: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
          prot: parseFloat((n.proteins_100g || 0).toFixed(1)),
          fat: parseFloat((n.fat_100g || 0).toFixed(1)),
          carb: parseFloat((n.carbohydrates_100g || 0).toFixed(1))
        };
      })
      .filter(p => p.cals > 0);

    if (parsed.length === 0) {
      alert("Во внешней базе тоже ничего точного не нашлось. Добавьте продукт через «+ Ввод»!");
      return;
    }

    const container = document.getElementById("searchResultsList");
    container.innerHTML = "";
    parsed.forEach(p => {
      const item = document.createElement("div");
      item.className = "search-res-item";
      item.innerHTML = `
        <div class="search-res-title">${p.name}</div>
        <div class="search-res-sub">100г: ${p.cals} ккал | Б:${p.prot}г Ж:${p.fat}г У:${p.carb}г</div>
      `;
      item.onclick = () => selectProductFromSearch(p);
      container.appendChild(item);
    });
  } catch (e) {
    loader.style.display = "none";
    alert("Ошибка соединения с внешней базой. Воспользуйтесь быстрым вводом.");
  }
}

function selectProductFromSearch(prod) {
  currentPickedProduct = prod;
  document.getElementById("selectedProductBox").style.display = "flex";
  document.getElementById("selectedProdName").innerText = prod.name;
  document.getElementById("selectedProdPer100").innerText = `на 100г: ${prod.cals} ккал (Б:${prod.prot} Ж:${prod.fat} У:${prod.carb})`;
  document.getElementById("selectedProdGrams").value = "100";
  updateCalculatedPortion();
}

function updateCalculatedPortion() {
  if (!currentPickedProduct) return;
  const grams = parseFloat(document.getElementById("selectedProdGrams").value) || 0;
  const factor = grams / 100;
  const cals = Math.round(currentPickedProduct.cals * factor);
  const p = (currentPickedProduct.prot * factor).toFixed(1);
  const f = (currentPickedProduct.fat * factor).toFixed(1);
  const c = (currentPickedProduct.carb * factor).toFixed(1);

  document.getElementById("calculatedSummary").innerText = `Итого: ${cals} ккал (Б: ${p}г, Ж: ${f}г, У: ${c}г)`;
}

function addSelectedProductToLog() {
  if (!currentPickedProduct) return;
  const grams = parseFloat(document.getElementById("selectedProdGrams").value) || 0;
  if (grams <= 0) return;

  const factor = grams / 100;
  const item = {
    id: Date.now(),
    name: currentPickedProduct.name,
    grams: grams,
    cals: Math.round(currentPickedProduct.cals * factor),
    p: parseFloat((currentPickedProduct.prot * factor).toFixed(1)),
    f: parseFloat((currentPickedProduct.fat * factor).toFixed(1)),
    c: parseFloat((currentPickedProduct.carb * factor).toFixed(1))
  };

  if (!foodLog[selectedFoodDate]) foodLog[selectedFoodDate] = [];
  foodLog[selectedFoodDate].push(item);
  save();
  closeFoodSearchModal();
  renderFood();
}

// ================= ИИ-СКАНЕР GEMINI VISION =================
function openApiKeyModal() {
  const modal = document.getElementById("apiKeyModal");
  const input = document.getElementById("geminiApiKeyInput");
  input.value = localStorage.getItem("semavik_gemini_key") || "";
  modal.classList.add("active");
}

function closeApiKeyModal() {
  document.getElementById("apiKeyModal").classList.remove("active");
}

function saveApiKey() {
  const key = document.getElementById("geminiApiKeyInput").value.trim();
  if (key) {
    localStorage.setItem("semavik_gemini_key", key);
  } else {
    localStorage.removeItem("semavik_gemini_key");
  }
  closeApiKeyModal();
}

function triggerCameraInput() {
  const key = localStorage.getItem("semavik_gemini_key");
  if (!key) {
    openApiKeyModal();
    return;
  }
  document.getElementById("cameraFileInput").click();
}

async function handleNutritionPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const apiKey = localStorage.getItem("semavik_gemini_key");
  if (!apiKey) {
    openApiKeyModal();
    return;
  }

  const banner = document.getElementById("aiScanLoader");
  const status = document.getElementById("aiScanStatus");
  banner.style.display = "flex";
  status.innerText = "Подготовка фото...";

  try {
    const base64DataUrl = await resizeImageToDataUrl(file, 1000, 0.85);
    const base64Clean = base64DataUrl.split(",")[1];

    status.innerText = "ИИ анализирует состав, КБЖУ и объём...";

    const promptText = `Внимательно проанализируй фото упаковки/блюда.
Найди таблицу пищевой ценности СТРОГО НА 100 ГРАММ (или 100 мл).
Также посмотри, указан ли на банке/пачке номинальный объём или вес нетто (например: 330 мл, 500 мл, 200 г).
Верни ответ СТРОГО в формате JSON без разметки:
{
  "name": "краткое русское название продукта",
  "detectedWeight": число_номинального_веса_упаковки_или_100,
  "cals100": число_калорий_строго_на_100г,
  "prot100": число_белков_на_100г,
  "fat100": число_жиров_на_100г,
  "carb100": число_углеводов_на_100г
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Clean
              }
            }
          ]
        }
      ]
    };

    const modelsToTry = [
      "models/gemini-2.5-flash",
      "models/gemini-2.0-flash",
      "models/gemini-3.6-flash",
      "models/gemini-1.5-flash"
    ];

    let data = null;
    let lastError = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });

        if (res.ok) {
          data = await res.json();
          break;
        }

        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${res.status}`;
        lastError = errMsg;

        const match = errMsg.match(/use\s+(models\/[\w\.\-]+)/i);
        if (match && match[1] && !modelsToTry.includes(match[1])) {
          modelsToTry.splice(i + 1, 0, match[1]);
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    banner.style.display = "none";

    if (!data) {
      throw new Error(lastError || "Не удалось получить ответ от моделей Gemini");
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    if (cleanJson) {
      const parsed = JSON.parse(cleanJson);
      openQuickAddModal({
        name: parsed.name || "Продукт с фото",
        detectedWeight: parsed.detectedWeight || 100,
        cals100: parsed.cals100 || 0,
        prot100: parsed.prot100 || 0,
        fat100: parsed.fat100 || 0,
        carb100: parsed.carb100 || 0
      });
    } else {
      alert("Не удалось извлечь данные о калориях. Попробуйте сделать фото ближе к таблице.");
    }
  } catch (err) {
    banner.style.display = "none";
    console.error("Gemini Vision Error:", err);
    alert(`Ошибка ИИ-сканера: ${err.message}`);
  } finally {
    event.target.value = "";
  }
}

function resizeImageToDataUrl(file, maxDimension, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ================= БЫСТРЫЙ ВВОД С АВТОПЕРЕСЧЁТОМ ПОРЦИИ =================
function openQuickAddModal(baseData = null) {
  document.getElementById("quickAddModal").classList.add("active");
  const gramsEl = document.getElementById("quickAddGrams");
  const hintEl = document.getElementById("quickAddPer100Hint");

  if (baseData) {
    // Жёстко фиксируем базу строго на 100 грамм
    quickAddBase100 = {
      cals: parseFloat(baseData.cals100) || parseFloat(baseData.cals) || 0,
      prot: parseFloat(baseData.prot100) || parseFloat(baseData.prot) || 0,
      fat: parseFloat(baseData.fat100) || parseFloat(baseData.fat) || 0,
      carb: parseFloat(baseData.carb100) || parseFloat(baseData.carb) || 0
    };

    document.getElementById("quickAddName").value = baseData.name || "Продукт с фото";
    
    // Если на пачке распознался номинальный вес (например, 330мл банка), ставим его, иначе 100
    const startGrams = parseFloat(baseData.detectedWeight) || 100;
    gramsEl.value = startGrams;

    if (hintEl) {
      hintEl.innerText = `База на 100г: ${quickAddBase100.cals} ккал | Б:${quickAddBase100.prot} Ж:${quickAddBase100.fat} У:${quickAddBase100.carb}`;
    }

    // Сразу производим расчёт под текущие граммы
    recalcQuickAddPortion();
  } else {
    // Ручной ввод с нуля
    quickAddBase100 = { cals: 0, prot: 0, fat: 0, carb: 0 };
    document.getElementById("quickAddName").value = "";
    gramsEl.value = "100";
    document.getElementById("quickAddCals").value = "";
    document.getElementById("quickAddP").value = "";
    document.getElementById("quickAddF").value = "";
    document.getElementById("quickAddC").value = "";
    if (hintEl) hintEl.innerText = "Вручную укажите граммы и итоговый калораж";
  }

  // Фокус сразу на поле граммов, чтобы можно было сразу вбивать цифры с клавиатуры
  setTimeout(() => {
    gramsEl.focus();
    gramsEl.select();
  }, 100);
}

// Пересчёт: Калории = (База_на_100 * Введённые_Граммы) / 100
function recalcQuickAddPortion() {
  const grams = parseFloat(document.getElementById("quickAddGrams").value) || 0;
  
  // Если базу ещё не задали (ручной ввод), расчёт не ломаем
  if (!quickAddBase100 || quickAddBase100.cals === 0) return;

  const factor = grams / 100;
  document.getElementById("quickAddCals").value = Math.round(quickAddBase100.cals * factor);
  document.getElementById("quickAddP").value = parseFloat((quickAddBase100.prot * factor).toFixed(1));
  document.getElementById("quickAddF").value = parseFloat((quickAddBase100.fat * factor).toFixed(1));
  document.getElementById("quickAddC").value = parseFloat((quickAddBase100.carb * factor).toFixed(1));
}

function closeQuickAddModal() {
  document.getElementById("quickAddModal").classList.remove("active");
  quickAddBase100 = { cals: 0, prot: 0, fat: 0, carb: 0 };
}

function applyQuickAdd() {
  const nameEl = document.getElementById("quickAddName");
  const gramsEl = document.getElementById("quickAddGrams");
  const calsEl = document.getElementById("quickAddCals");

  const name = (nameEl && nameEl.value.trim()) ? nameEl.value.trim() : "Приём пищи";
  const grams = parseFloat(gramsEl.value) || 100;
  const cals = parseFloat(calsEl.value);

  if (isNaN(cals) || cals <= 0) {
    alert("Укажите вес порции или калории");
    return;
  }

  const p = parseFloat(document.getElementById("quickAddP").value) || 0;
  const f = parseFloat(document.getElementById("quickAddF").value) || 0;
  const c = parseFloat(document.getElementById("quickAddC").value) || 0;

  if (!foodLog[selectedFoodDate]) foodLog[selectedFoodDate] = [];
  
  foodLog[selectedFoodDate].push({
    id: Date.now(),
    name: name,
    grams: grams,
    cals: Math.round(cals),
    p: p,
    f: f,
    c: c
  });

  save();
  closeQuickAddModal();
  renderFood();
}

function openCalGoalModal() {
  document.getElementById("calGoalModal").classList.add("active");
  document.getElementById("goalInputCals").value = foodGoals.cals;
  document.getElementById("goalInputProtein").value = foodGoals.p;
  document.getElementById("goalInputFat").value = foodGoals.f;
  document.getElementById("goalInputCarbs").value = foodGoals.c;
}

function closeCalGoalModal() {
  document.getElementById("calGoalModal").classList.remove("active");
}

function applyCalGoals() {
  foodGoals.cals = parseFloat(document.getElementById("goalInputCals").value) || 2100;
  foodGoals.p = parseFloat(document.getElementById("goalInputProtein").value) || 140;
  foodGoals.f = parseFloat(document.getElementById("goalInputFat").value) || 70;
  foodGoals.c = parseFloat(document.getElementById("goalInputCarbs").value) || 200;

  save();
  closeCalGoalModal();
  renderFood();
}

function exportData() {
  const exportPayload = {
    version: 3,
    targetWeight: targetWeight,
    data: state,
    foodLog: foodLog,
    foodGoals: foodGoals
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `semavik-backup-${getTodayIso()}.json`;
  a.click();
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const parsed = JSON.parse(evt.target.result);
      if (Array.isArray(parsed)) {
        state = parsed;
      } else if (parsed && parsed.data) {
        state = parsed.data;
        targetWeight = parsed.targetWeight !== undefined ? parsed.targetWeight : null;
        if (parsed.foodLog) foodLog = parsed.foodLog;
        if (parsed.foodGoals) foodGoals = parsed.foodGoals;
      }
      save();
      renderFood();
    } catch {
      alert("Неверный формат бэкапа");
    }
  };
  reader.readAsText(file);
}

function render() {
  renderStats();
  renderChart();
  renderSchedule();
  renderFood();
}

applyTheme();
render();