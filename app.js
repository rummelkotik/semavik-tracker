// Вспомогательные сокращения дней недели
const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

// Функция форматирования даты (ДД.ММ)
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}`;
}

// Генерация начальных 16 недель
function generateInitialSchedule() {
  const list = [];
  const baseDate = new Date(2026, 8, 12); // 12 сентября 2026

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

let state = JSON.parse(localStorage.getItem("semavik_life_data_v2")) || generateInitialSchedule();
let targetWeight = parseFloat(localStorage.getItem("semavik_target_weight")) || null;
let isLight = localStorage.getItem("semavik_theme") === "light";
let chartInstance = null;

function applyTheme() {
  const themeBtn = document.getElementById("themeBtn");
  if (isLight) {
    document.body.classList.add("light-theme");
    themeBtn.innerText = "🌙";
  } else {
    document.body.classList.remove("light-theme");
    themeBtn.innerText = "☀️";
  }
}

function toggleTheme() {
  isLight = !isLight;
  localStorage.setItem("semavik_theme", isLight ? "light" : "dark");
  applyTheme();
  renderChart();
}

function save() {
  localStorage.setItem("semavik_life_data_v2", JSON.stringify(state));
  if (targetWeight !== null) {
    localStorage.setItem("semavik_target_weight", targetWeight);
  } else {
    localStorage.removeItem("semavik_target_weight");
  }
  render();
}

// Смена стартовой даты
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

// Модальное окно выбора даты
function openDateModal() {
  const modal = document.getElementById("dateModal");
  const input = document.getElementById("customDateInput");
  const current = state[0] && state[0].isoDate ? state[0].isoDate.slice(0, 10) : "2026-09-12";
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

// Модальное окно установки цели
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

  const nextWeekNum = state.length + 1;
  const nextDose = lastItem ? lastItem.dose : 0.25;

  state.push({
    id: Date.now(),
    week: nextWeekNum,
    isoDate: nextDate.toISOString(),
    dateStr: `${formatDate(nextDate)}, ${DAYS[nextDate.getDay()]}`,
    dose: nextDose,
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

  // Отображение цели
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

  // Расчёт прогресс-бара, если цель задана
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
  const points = state.filter(s => s.weight !== null && !isNaN(s.weight));
  const labels = points.map(s => `Н${s.week} (${s.weight})`);
  const data = points.map(s => s.weight);

  const canvas = document.getElementById("weightChart");
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

  // Основной датасет реального веса
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

  // Пунктирная линия цели на графике
  if (targetWeight !== null && data.length > 0) {
    const targetLineData = new Array(data.length).fill(targetWeight);
    datasets.push({
      label: "Цель",
      data: targetLineData,
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
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isLight ? "#431407" : "#1e293b",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          displayColors: false,
          callbacks: {
            label: context => `${context.dataset.label || "Вес"}: ${context.parsed.y} кг`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: tickColor,
            font: { size: 9, family: "inherit" }
          }
        },
        y: {
          display: false
        }
      }
    }
  });
}

function render() {
  renderStats();
  renderChart();

  const list = document.getElementById("entryList");
  list.innerHTML = "";

  state.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = `entry-row ${item.done ? "" : "pending"}`;

    const btnHtml = item.done
      ? `<button class="action-btn" onclick="toggleWeek(${idx})">✓ ${item.doneTime || "Сделано"}</button>`
      : `<button class="action-btn uncompleted" onclick="toggleWeek(${idx})">Сделать</button>`;

    const labelHtml =
      idx === 0
        ? `Неделя 1 <span class="date-edit-wrapper" onclick="openDateModal()" title="Нажмите, чтобы изменить дату старта">
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

function exportData() {
  const exportPayload = {
    version: 2,
    targetWeight: targetWeight,
    data: state
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `semavik-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
      }
      save();
    } catch {
      alert("Неверный формат бэкапа");
    }
  };
  reader.readAsText(file);
}

applyTheme();
render();