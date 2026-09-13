const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

const BUILTIN_FOOD_DB = [
  { name: "Творог 5%", cals: 121, prot: 16.0, fat: 5.0, carb: 3.0 },
  { name: "Творог 0%", cals: 71, prot: 16.5, fat: 0.2, carb: 1.3 },
  { name: "Творог 9%", cals: 159, prot: 14.0, fat: 9.0, carb: 2.0 },
  { name: "Яйцо куриное (1 шт)", cals: 143, prot: 12.7, fat: 10.9, carb: 0.7 },
  { name: "Куриное филе грудка", cals: 110, prot: 23.0, fat: 1.2, carb: 0.0 },
  { name: "Индейка филе грудки", cals: 115, prot: 24.0, fat: 1.5, carb: 0.0 },
  { name: "Говядина постная", cals: 180, prot: 26.0, fat: 8.0, carb: 0.0 },
  { name: "Лосось / Форель", cals: 206, prot: 20.0, fat: 13.0, carb: 0.0 },
  { name: "Тунец в с/соку", cals: 101, prot: 23.5, fat: 0.8, carb: 0.0 },
  { name: "Гречка варёная", cals: 105, prot: 4.2, fat: 1.1, carb: 21.3 },
  { name: "Овсяная каша на воде", cals: 88, prot: 3.0, fat: 1.7, carb: 15.0 },
  { name: "Рис варёный", cals: 116, prot: 2.5, fat: 0.3, carb: 25.0 },
  { name: "Макароны отварные", cals: 130, prot: 5.0, fat: 0.6, carb: 26.0 },
  { name: "Огурцы свежие", cals: 15, prot: 0.8, fat: 0.1, carb: 3.0 },
  { name: "Помидоры свежие", cals: 20, prot: 0.9, fat: 0.2, carb: 3.9 },
  { name: "Банан", cals: 89, prot: 1.5, fat: 0.2, carb: 21.8 },
  { name: "Яблоко", cals: 52, prot: 0.3, fat: 0.2, carb: 13.8 }
];

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}`;
}

function getTodayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateInitialSchedule() {
  const list = [];
  const baseDate = new Date();

  for (let i = 0; i < 12; i++) {
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

// ================= СОСТОЯНИЕ =================
let state = [];
try {
  const stored = JSON.parse(localStorage.getItem("semavik_life_data_v2"));
  state = Array.isArray(stored) && stored.length > 0 ? stored : generateInitialSchedule();
} catch (e) {
  state = generateInitialSchedule();
}

let targetWeight = parseFloat(localStorage.getItem("semavik_target_weight")) || null;
let isLight = localStorage.getItem("semavik_theme") === "light";
let chartInstance = null;

let foodLog = JSON.parse(localStorage.getItem("semavik_food_log")) || {};
let foodGoals = JSON.parse(localStorage.getItem("semavik_food_goals")) || { cals: 2100, p: 140, f: 70, c: 200 };
let selectedFoodDate = getTodayIso();
let activeTab = "weight";

let currentPickedProduct = null;
let searchDebounceTimeout = null;
let quickAddBase100 = { cals: 0, prot: 0, fat: 0, carb: 0 };

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

  if (tabBtnW && tabBtnF && tabContentW && tabContentF) {
    if (tab === "weight") {
      tabBtnW.classList.add("active");
      tabBtnF.classList.remove("active");
      tabContentW.style.display = "flex";
      tabContentF.style.display = "none";
      renderChart();
    } else {
      tabBtnF.classList.add("active");
      tabBtnW.classList.remove("active");
      tabContentF.style.display = "flex";
      tabContentW.style.display = "none";
      renderFood();
    }
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

// ================= РАСПИСАНИЕ И ВЕС =================
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
  if (input) input.value = state[0] && state[0].isoDate ? state[0].isoDate.slice(0, 10) : getTodayIso();
  if (modal) modal.classList.add("active");
}

function closeDateModal() {
  const modal = document.getElementById("dateModal");
  if (modal) modal.classList.remove("active");
}

function applyCustomDate() {
  const input = document.getElementById("customDateInput");
  if (input && input.value) {
    changeStartDate(input.value);
    closeDateModal();
  }
}

function openTargetModal() {
  const modal = document.getElementById("targetModal");
  const input = document.getElementById("customTargetInput");
  if (input) input.value = targetWeight !== null ? targetWeight : "";
  if (modal) modal.classList.add("active");
}

function closeTargetModal() {
  const modal = document.getElementById("targetModal");
  if (modal) modal.classList.remove("active");
}

function applyCustomTarget() {
  const input = document.getElementById("customTargetInput");
  if (input) {
    const val = input.value;
    targetWeight = val !== "" && !isNaN(val) ? parseFloat(val) : null;
    save();
    closeTargetModal();
  }
}

function toggleWeek(idx) {
  if (!state[idx]) return;
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
  if (!state[idx]) return;
  state[idx].weight = val !== "" && !isNaN(val) ? parseFloat(val) : null;
  save();
}

function updateDose(idx, val) {
  if (!state[idx]) return;
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
}

function renderStats() {
  const recorded = state.filter(s => s.weight !== null && !isNaN(s.weight));
  
  const dispStart = document.getElementById("disp-start");
  const dispCurrent = document.getElementById("disp-current");
  const dispTarget = document.getElementById("disp-target");
  const valEl = document.getElementById("disp-diff");
  const badgeEl = document.getElementById("badgeDiff") || document.querySelector(".metric-card.success") || document.querySelector(".stat-card.highlight");
  const titleEl = document.getElementById("disp-diff-title");

  const progressBox = document.getElementById("progressBox");
  const progressText = document.getElementById("progressText");
  const progressRemaining = document.getElementById("progressRemaining");
  const progressBar = document.getElementById("targetProgressBar");

  if (dispTarget) {
    dispTarget.innerText = targetWeight !== null ? `${targetWeight} кг` : "Задать";
  }

  if (recorded.length === 0) {
    if (dispStart) dispStart.innerText = "—";
    if (dispCurrent) dispCurrent.innerText = "—";
    if (valEl) valEl.innerText = "—";
    if (titleEl) titleEl.innerText = "Сброшено:";
    if (badgeEl) badgeEl.classList.remove("danger");
    if (progressBox) progressBox.style.display = "none";
    return;
  }

  const startW = recorded[0].weight;
  const currentW = recorded[recorded.length - 1].weight;
  const diff = parseFloat((currentW - startW).toFixed(1));

  if (dispStart) dispStart.innerText = `${startW} кг`;
  if (dispCurrent) dispCurrent.innerText = `${currentW} кг`;

  if (valEl) {
    if (diff > 0) {
      if (badgeEl) badgeEl.classList.add("danger");
      if (titleEl) titleEl.innerText = "Набрано:";
      valEl.innerText = `+${diff} кг`;
    } else {
      if (badgeEl) badgeEl.classList.remove("danger");
      if (titleEl) titleEl.innerText = "Сброшено:";
      valEl.innerText = `${diff} кг`;
    }
  }

  if (targetWeight !== null && progressBox) {
    progressBox.style.display = "flex";
    const totalToLose = startW - targetWeight;

    if (totalToLose > 0) {
      const lostSoFar = startW - currentW;
      let percent = Math.round((lostSoFar / totalToLose) * 100);
      percent = Math.max(0, Math.min(100, percent));
      const remaining = parseFloat((currentW - targetWeight).toFixed(1));
      
      if (progressText) progressText.innerText = `Прогресс: ${percent}%`;
      if (progressRemaining) progressRemaining.innerText = remaining > 0 ? `Осталось: ${remaining} кг` : `Цель достигнута! 🎉`;
      if (progressBar) progressBar.style.width = `${percent}%`;
    } else {
      progressBox.style.display = "none";
    }
  } else if (progressBox) {
    progressBox.style.display = "none";
  }
}

function renderChart() {
  const canvas = document.getElementById("weightChart");
  if (!canvas) return;

  const points = state.filter(s => s.weight !== null && !isNaN(s.weight));
  const labels = points.length > 0 ? points.map(s => `Н${s.week}`) : ["Н1"];
  const data = points.length > 0 ? points.map(s => s.weight) : [null];

  const ctx = canvas.getContext("2d");
  if (chartInstance) chartInstance.destroy();

  // Рыже-красный цвет графика для тёплой светлой темы, бирюзовый для тёмной
  const lineColor = isLight ? "#ea580c" : "#38bdf8";
  const fillColor = isLight ? "rgba(249, 115, 22, 0.15)" : "rgba(56, 189, 248, 0.12)";

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        borderColor: lineColor,
        borderWidth: 2.5,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: lineColor,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { display: true }
      }
    }
  });
}

// ================= ОТРИСОВКА НЕДЕЛЬ =================
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

    const labelHtml = idx === 0
      ? `Неделя 1 <span class="date-edit-wrapper" onclick="openDateModal()">(${item.dateStr})</span>`
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
  selectedFoodDate = `${curDate.getFullYear()}-${String(curDate.getMonth() + 1).padStart(2, "0")}-${String(curDate.getDate()).padStart(2, "0")}`;
  renderFood();
}

function renderFood() {
  const today = getTodayIso();
  const labelEl = document.getElementById("foodDateLabel");
  if (labelEl) {
    if (selectedFoodDate === today) {
      labelEl.innerText = "Сегодня";
    } else {
      const [y, m, d] = selectedFoodDate.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      labelEl.innerText = `${formatDate(dateObj)}, ${DAYS[dateObj.getDay()]}`;
    }
  }

  const targetCalsEl = document.getElementById("foodTargetCals");
  if (targetCalsEl) targetCalsEl.innerText = foodGoals.cals;

  const protGoalEl = document.getElementById("foodTargetProtein");
  if (protGoalEl) protGoalEl.innerText = `/ ${foodGoals.p}г`;

  const fatGoalEl = document.getElementById("foodTargetFat");
  if (fatGoalEl) fatGoalEl.innerText = `/ ${foodGoals.f}г`;

  const carbsGoalEl = document.getElementById("foodTargetCarbs");
  if (carbsGoalEl) carbsGoalEl.innerText = `/ ${foodGoals.c}г`;

  const dayEntries = foodLog[selectedFoodDate] || [];
  let totalC = 0, totalP = 0, totalF = 0, totalCarbs = 0;

  dayEntries.forEach(item => {
    totalC += item.cals || 0;
    totalP += item.p || 0;
    totalF += item.f || 0;
    totalCarbs += item.c || 0;
  });

  const totalCalsEl = document.getElementById("foodTotalCals");
  if (totalCalsEl) totalCalsEl.innerText = Math.round(totalC);

  const totalProtEl = document.getElementById("foodTotalProtein");
  if (totalProtEl) totalProtEl.innerText = `${Math.round(totalP)}г`;

  const totalFatEl = document.getElementById("foodTotalFat");
  if (totalFatEl) totalFatEl.innerText = `${Math.round(totalF)}г`;

  const totalCarbsEl = document.getElementById("foodTotalCarbs");
  if (totalCarbsEl) totalCarbsEl.innerText = `${Math.round(totalCarbs)}г`;

  const remain = foodGoals.cals - Math.round(totalC);
  const remainEl = document.getElementById("foodRemainCals");
  if (remainEl) {
    remainEl.innerText = remain;
    remainEl.style.color = remain >= 0 ? "var(--badge-green, #10b981)" : "var(--badge-red, #ef4444)";
  }

  const percent = Math.min(100, Math.round((totalC / foodGoals.cals) * 100)) || 0;
  const barEl = document.getElementById("foodCalProgress");
  if (barEl) barEl.style.width = `${percent}%`;

  const logList = document.getElementById("foodLogList");
  if (logList) {
    logList.innerHTML = "";
    if (dayEntries.length === 0) {
      logList.innerHTML = `<div style="text-align: center; color: var(--text-muted, #8092a4); font-size: 0.85rem; padding: 20px;">На этот день записей пока нет</div>`;
      return;
    }

    dayEntries.forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "food-item-row";
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
}

function deleteFoodEntry(idx) {
  if (!foodLog[selectedFoodDate]) return;
  foodLog[selectedFoodDate].splice(idx, 1);
  save();
  renderFood();
}

// ================= БЫСТРЫЙ ВВОД =================
function openQuickAddModal(baseData = null) {
  const modal = document.getElementById("quickAddModal");
  if (modal) modal.classList.add("active");
  const gramsEl = document.getElementById("quickAddGrams");
  const hintEl = document.getElementById("quickAddPer100Hint");

  if (baseData) {
    quickAddBase100 = {
      cals: parseFloat(baseData.cals100) || parseFloat(baseData.cals) || 0,
      prot: parseFloat(baseData.prot100) || parseFloat(baseData.prot) || 0,
      fat: parseFloat(baseData.fat100) || parseFloat(baseData.fat) || 0,
      carb: parseFloat(baseData.carb100) || parseFloat(baseData.carb) || 0
    };

    const nameEl = document.getElementById("quickAddName");
    if (nameEl) nameEl.value = baseData.name || "Продукт с фото";
    if (gramsEl) gramsEl.value = parseFloat(baseData.detectedWeight) || 100;

    if (hintEl) {
      hintEl.innerText = `База на 100г: ${quickAddBase100.cals} ккал | Б:${quickAddBase100.prot} Ж:${quickAddBase100.fat} У:${quickAddBase100.carb}`;
    }

    recalcQuickAddPortion();
  } else {
    quickAddBase100 = { cals: 0, prot: 0, fat: 0, carb: 0 };
    const nameEl = document.getElementById("quickAddName");
    if (nameEl) nameEl.value = "";
    if (gramsEl) gramsEl.value = "100";
    const calsEl = document.getElementById("quickAddCals");
    if (calsEl) calsEl.value = "";
    const pEl = document.getElementById("quickAddP");
    if (pEl) pEl.value = "";
    const fEl = document.getElementById("quickAddF");
    if (fEl) fEl.value = "";
    const cEl = document.getElementById("quickAddC");
    if (cEl) cEl.value = "";
    if (hintEl) hintEl.innerText = "на 100г: 0 ккал (Б:0 Ж:0 У:0)";
  }

  setTimeout(() => {
    if (gramsEl) {
      gramsEl.focus();
      gramsEl.select();
    }
  }, 100);
}

function recalcQuickAddPortion() {
  const gramsEl = document.getElementById("quickAddGrams");
  const grams = gramsEl ? (parseFloat(gramsEl.value) || 0) : 0;
  if (!quickAddBase100 || quickAddBase100.cals === 0) return;

  const factor = grams / 100;
  const calsEl = document.getElementById("quickAddCals");
  if (calsEl) calsEl.value = Math.round(quickAddBase100.cals * factor);
  const pEl = document.getElementById("quickAddP");
  if (pEl) pEl.value = parseFloat((quickAddBase100.prot * factor).toFixed(1));
  const fEl = document.getElementById("quickAddF");
  if (fEl) fEl.value = parseFloat((quickAddBase100.fat * factor).toFixed(1));
  const cEl = document.getElementById("quickAddC");
  if (cEl) cEl.value = parseFloat((quickAddBase100.carb * factor).toFixed(1));
}

function closeQuickAddModal() {
  const modal = document.getElementById("quickAddModal");
  if (modal) modal.classList.remove("active");
  quickAddBase100 = { cals: 0, prot: 0, fat: 0, carb: 0 };
}

function applyQuickAdd() {
  const nameEl = document.getElementById("quickAddName");
  const gramsEl = document.getElementById("quickAddGrams");
  const calsEl = document.getElementById("quickAddCals");

  const name = nameEl ? (nameEl.value.trim() || "Приём пищи") : "Приём пищи";
  const grams = gramsEl ? (parseFloat(gramsEl.value) || 100) : 100;
  const cals = calsEl ? parseFloat(calsEl.value) : 0;

  if (isNaN(cals) || cals <= 0) {
    alert("Укажите вес порции или калории");
    return;
  }

  if (!foodLog[selectedFoodDate]) foodLog[selectedFoodDate] = [];
  foodLog[selectedFoodDate].push({
    id: Date.now(),
    name,
    grams,
    cals: Math.round(cals),
    p: parseFloat(document.getElementById("quickAddP")?.value) || 0,
    f: parseFloat(document.getElementById("quickAddF")?.value) || 0,
    c: parseFloat(document.getElementById("quickAddC")?.value) || 0
  });

  save();
  closeQuickAddModal();
  renderFood();
}

// ================= ПОИСК БЛЮД =================
function openFoodSearchModal() {
  const modal = document.getElementById("foodSearchModal");
  if (modal) modal.classList.add("active");
  const queryEl = document.getElementById("foodSearchQuery");
  if (queryEl) queryEl.value = "";
  const listEl = document.getElementById("searchResultsList");
  if (listEl) listEl.innerHTML = "";
  const selBox = document.getElementById("selectedProductBox");
  if (selBox) selBox.style.display = "none";
  currentPickedProduct = null;
}

function closeFoodSearchModal() {
  const modal = document.getElementById("foodSearchModal");
  if (modal) modal.classList.remove("active");
}

function debounceFoodSearch() {
  clearTimeout(searchDebounceTimeout);
  const queryEl = document.getElementById("foodSearchQuery");
  const q = queryEl ? queryEl.value.trim().toLowerCase() : "";
  const container = document.getElementById("searchResultsList");
  if (!container) return;

  if (q.length < 2) {
    container.innerHTML = "";
    return;
  }

  const localMatches = BUILTIN_FOOD_DB.filter(item => item.name.toLowerCase().includes(q));
  container.innerHTML = "";

  localMatches.forEach(p => {
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

function selectProductFromSearch(prod) {
  currentPickedProduct = prod;
  const selBox = document.getElementById("selectedProductBox");
  if (selBox) selBox.style.display = "flex";
  const nameEl = document.getElementById("selectedProdName");
  if (nameEl) nameEl.innerText = prod.name;
  const per100El = document.getElementById("selectedProdPer100");
  if (per100El) per100El.innerText = `на 100г: ${prod.cals} ккал`;
  const gramsEl = document.getElementById("selectedProdGrams");
  if (gramsEl) gramsEl.value = "100";
  updateCalculatedPortion();
}

function updateCalculatedPortion() {
  if (!currentPickedProduct) return;
  const gramsEl = document.getElementById("selectedProdGrams");
  const grams = gramsEl ? (parseFloat(gramsEl.value) || 0) : 0;
  const factor = grams / 100;
  const cals = Math.round(currentPickedProduct.cals * factor);
  const sumEl = document.getElementById("calculatedSummary");
  if (sumEl) sumEl.innerText = `Итого: ${cals} ккал`;
}

function addSelectedProductToLog() {
  if (!currentPickedProduct) return;
  const gramsEl = document.getElementById("selectedProdGrams");
  const grams = gramsEl ? (parseFloat(gramsEl.value) || 0) : 0;
  if (grams <= 0) return;

  const factor = grams / 100;
  if (!foodLog[selectedFoodDate]) foodLog[selectedFoodDate] = [];
  foodLog[selectedFoodDate].push({
    id: Date.now(),
    name: currentPickedProduct.name,
    grams,
    cals: Math.round(currentPickedProduct.cals * factor),
    p: parseFloat((currentPickedProduct.prot * factor).toFixed(1)),
    f: parseFloat((currentPickedProduct.fat * factor).toFixed(1)),
    c: parseFloat((currentPickedProduct.carb * factor).toFixed(1))
  });

  save();
  closeFoodSearchModal();
  renderFood();
}

// ================= GEMINI API =================
function openApiKeyModal() {
  const modal = document.getElementById("apiKeyModal");
  if (modal) modal.classList.add("active");
  const input = document.getElementById("geminiApiKeyInput");
  if (input) input.value = localStorage.getItem("semavik_gemini_key") || "";
}

function closeApiKeyModal() {
  const modal = document.getElementById("apiKeyModal");
  if (modal) modal.classList.remove("active");
}

function saveApiKey() {
  const input = document.getElementById("geminiApiKeyInput");
  const key = input ? input.value.trim() : "";
  if (key) localStorage.setItem("semavik_gemini_key", key);
  else localStorage.removeItem("semavik_gemini_key");
  closeApiKeyModal();
}

function triggerCameraInput() {
  const key = localStorage.getItem("semavik_gemini_key");
  if (!key) {
    openApiKeyModal();
    return;
  }
  const fileInput = document.getElementById("cameraFileInput");
  if (fileInput) fileInput.click();
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
  if (banner) banner.style.display = "flex";

  try {
    const base64DataUrl = await resizeImageToDataUrl(file, 1000, 0.85);
    const base64Clean = base64DataUrl.split(",")[1];

    const promptText = `Внимательно проанализируй фото этикетки или порции блюда.
Найди таблицу пищевой ценности СТРОГО НА 100 ГРАММ (или 100 мл).
Также определи номинальный вес/объём упаковки, если он указан.
Верни ответ СТРОГО в формате JSON без markdown разметки:
{
  "name": "краткое русское название",
  "detectedWeight": число_веса_или_100,
  "cals100": число_калорий_на_100г,
  "prot100": число_белков_на_100г,
  "fat100": число_жиров_на_100г,
  "carb100": число_углеводов_на_100г
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            { inline_data: { mime_type: "image/jpeg", data: base64Clean } }
          ]
        }]
      })
    });

    const data = await res.json();
    if (banner) banner.style.display = "none";

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
      alert("Не удалось распознать данные. Попробуйте сфотографировать этикетку ближе.");
    }
  } catch (err) {
    if (banner) banner.style.display = "none";
    alert(`Ошибка сканирования: ${err.message}`);
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
        let w = img.width, h = img.height;
        if (w > maxDimension || h > maxDimension) {
          if (w > h) { h = Math.round((h * maxDimension) / w); w = maxDimension; }
          else { w = Math.round((w * maxDimension) / h); h = maxDimension; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
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

// ================= ЦЕЛИ КБЖУ И БЭКАП =================
function openCalGoalModal() {
  const modal = document.getElementById("calGoalModal");
  if (modal) modal.classList.add("active");
  const calsEl = document.getElementById("goalInputCals");
  if (calsEl) calsEl.value = foodGoals.cals;
  const pEl = document.getElementById("goalInputProtein");
  if (pEl) pEl.value = foodGoals.p;
  const fEl = document.getElementById("goalInputFat");
  if (fEl) fEl.value = foodGoals.f;
  const cEl = document.getElementById("goalInputCarbs");
  if (cEl) cEl.value = foodGoals.c;
}

function closeCalGoalModal() {
  const modal = document.getElementById("calGoalModal");
  if (modal) modal.classList.remove("active");
}

function applyCalGoals() {
  const calsEl = document.getElementById("goalInputCals");
  const pEl = document.getElementById("goalInputProtein");
  const fEl = document.getElementById("goalInputFat");
  const cEl = document.getElementById("goalInputCarbs");

  foodGoals.cals = calsEl ? (parseFloat(calsEl.value) || 2100) : 2100;
  foodGoals.p = pEl ? (parseFloat(pEl.value) || 140) : 140;
  foodGoals.f = fEl ? (parseFloat(fEl.value) || 70) : 70;
  foodGoals.c = cEl ? (parseFloat(cEl.value) || 200) : 200;

  save();
  closeCalGoalModal();
  renderFood();
}

function exportData() {
  const blob = new Blob([JSON.stringify({ state, targetWeight, foodLog, foodGoals }, null, 2)], { type: "application/json" });
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
      if (parsed.state) state = parsed.state;
      if (parsed.targetWeight !== undefined) targetWeight = parsed.targetWeight;
      if (parsed.foodLog) foodLog = parsed.foodLog;
      if (parsed.foodGoals) foodGoals = parsed.foodGoals;
      save();
    } catch {
      alert("Неверный формат файла бэкапа");
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

// Запуск после загрузки DOM
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme();
    render();
  });
} else {
  applyTheme();
  render();
}