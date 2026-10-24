let currentUser = "Usuario";
let currentEmail = "usuario@gmail.com";
let activeCalcType = "";
let historyData = [];
let appConfig = null;

// Cargar el JSON mediante fetch
document.addEventListener("DOMContentLoaded", () => {
  fetch("calculadoras.json")
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar el archivo JSON");
      return response.json();
    })
    .then((data) => {
      appConfig = data;
      renderApp();
    })
    .catch((error) => console.error("Error cargando el JSON:", error));
});

function renderApp() {
  if (!appConfig) return;
  renderCards(appConfig.modulos);
  renderProfiles(appConfig.perfiles);
}

function renderCards(modulos) {
  const container = document.getElementById("cards-grid");
  if (!container) return;

  container.innerHTML = modulos
    .map(
      (m) => `
    <div class="calc-card" onclick="openCalculator('${m.id}')">
      <i class="fa-solid ${m.icono}"></i>
      <span>${m.titulo}</span>
    </div>
  `
    )
    .join("");
}

function renderProfiles(perfiles) {
  const select = document.getElementById("reg-profile");
  if (!select) return;

  select.innerHTML = perfiles
    .map((p) => `<option value="${p}">${p}</option>`)
    .join("");
}

function switchAuth(type) {
  document.getElementById("view-login")?.classList.remove("active");
  document.getElementById("view-register")?.classList.remove("active");

  if (type === "login") {
    document.getElementById("view-login")?.classList.add("active");
  } else {
    document.getElementById("view-register")?.classList.add("active");
  }
}

document.getElementById("login-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const userVal = document.getElementById("login-user")?.value.replace("@", "");
  currentUser = userVal || "Usuario";
  updateUserHeader();

  document.getElementById("view-login")?.classList.remove("active");
  document.getElementById("view-dashboard")?.classList.add("active");
});

document.getElementById("register-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const pass1 = document.getElementById("reg-pass")?.value;
  const pass2 = document.getElementById("reg-pass-confirm")?.value;

  if (pass1 !== pass2) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  currentUser = document.getElementById("reg-user")?.value || "Nuevo Usuario";
  updateUserHeader();
  alert("Registro exitoso. ¡Bienvenido!");

  document.getElementById("view-register")?.classList.remove("active");
  document.getElementById("view-dashboard")?.classList.add("active");
});

function updateUserHeader() {
  const displayWelcome = document.getElementById("display-welcome");
  const displayUserTop = document.getElementById("display-username-top");
  const profileDisplayName = document.getElementById("profile-display-name");
  const profUser = document.getElementById("prof-user");
  const avatarInitials = document.getElementById("avatar-initials");

  if (displayWelcome) displayWelcome.innerText = `Bienvenido, ${currentUser}`;
  if (displayUserTop) displayUserTop.innerText = currentUser;
  if (profileDisplayName) profileDisplayName.innerText = currentUser;
  if (profUser) profUser.value = currentUser;

  const parts = currentUser.split(" ");
  let initials = parts[0] ? parts[0][0].toUpperCase() : "U";
  if (parts.length > 1 && parts[1][0]) initials += parts[1][0].toUpperCase();
  if (avatarInitials) avatarInitials.innerText = initials;
}

function logout() {
  document.getElementById("view-dashboard")?.classList.remove("active");
  document.getElementById("view-login")?.classList.add("active");
}

function showNav(section) {
  document.getElementById("subview-inicio").style.display = "none";
  document.getElementById("subview-calc-form").style.display = "none";
  document.getElementById("subview-historial").style.display = "none";
  document.getElementById("subview-perfil").style.display = "none";
  document.getElementById("subview-ayuda").style.display = "none";

  const items = document.querySelectorAll(".sidebar-menu li");
  items.forEach((li) => li.classList.remove("active"));

  if (section === "inicio" || section === "calculadora") {
    document.getElementById("subview-inicio").style.display = "block";
    document.getElementById("nav-" + section)?.classList.add("active");
  } else if (section === "historial") {
    document.getElementById("subview-historial").style.display = "block";
    document.getElementById("nav-historial")?.classList.add("active");
    renderHistory();
  } else if (section === "perfil") {
    document.getElementById("subview-perfil").style.display = "block";
    document.getElementById("nav-perfil")?.classList.add("active");
  } else if (section === "ayuda") {
    document.getElementById("subview-ayuda").style.display = "block";
    document.getElementById("nav-ayuda")?.classList.add("active");
  }
}

function openCalculator(type) {
  activeCalcType = type;
  document.getElementById("subview-inicio").style.display = "none";
  document.getElementById("subview-calc-form").style.display = "block";
  document.getElementById("result-box").style.display = "none";

  const inputsContainer = document.getElementById("dynamic-inputs");
  if (!inputsContainer) return;
  inputsContainer.innerHTML = "";

  const title = document.getElementById("calc-module-title");
  const label = document.getElementById("calc-section-label");

  const itemConfig = appConfig?.modulos?.find((m) => m.id === type);
  if (itemConfig) {
    if (title) title.innerText = itemConfig.etiquetaMuestra;
    if (label) label.innerText = itemConfig.etiquetaDatos;
  }

  if (type === "muro") {
    inputsContainer.innerHTML = `
      <div class="form-group">
        <label>Espesor del muro (cm)</label>
        <select id="input-espesor">
          <option value="12">12 cm (Tabique)</option>
          <option value="20">20 cm (Muro Carga)</option>
          <option value="30">30 cm (Ancho)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Largo del muro (m)</label>
        <input type="number" id="input-largo" placeholder="Ej: 5.0" step="0.1">
      </div>
      <div class="form-group">
        <label>Altura del muro (m)</label>
        <input type="number" id="input-altura" placeholder="Ej: 2.6" step="0.1">
      </div>
    `;
  } else if (type === "viga") {
    inputsContainer.innerHTML = `
      <div class="form-group">
        <label>Largo de la viga (m)</label>
        <input type="number" id="input-largo" placeholder="Ej: 4.0" step="0.1">
      </div>
      <div class="form-group">
        <label>Ancho de sección (m)</label>
        <input type="number" id="input-ancho" value="0.20" step="0.01">
      </div>
      <div class="form-group">
        <label>Alto de sección (m)</label>
        <input type="number" id="input-alto" value="0.30" step="0.01">
      </div>
    `;
  } else if (type === "columna") {
    inputsContainer.innerHTML = `
      <div class="form-group">
        <label>Largo/Alto de la columna (m)</label>
        <input type="number" id="input-largo" placeholder="Ej: 3.0" step="0.1">
      </div>
      <div class="form-group">
        <label>Lado A (m)</label>
        <input type="number" id="input-ancho" value="0.25" step="0.01">
      </div>
      <div class="form-group">
        <label>Lado B (m)</label>
        <input type="number" id="input-alto" value="0.25" step="0.01">
      </div>
    `;
  } else if (type === "contrapiso") {
    inputsContainer.innerHTML = `
      <div class="form-group">
        <label>Espesor (m)</label>
        <input type="number" id="input-espesor" value="0.10" step="0.01">
      </div>
      <div class="form-group">
        <label>Ancho (m)</label>
        <input type="number" id="input-ancho" placeholder="Ej: 4.0" step="0.1">
      </div>
      <div class="form-group">
        <label>Largo (m)</label>
        <input type="number" id="input-largo" placeholder="Ej: 5.0" step="0.1">
      </div>
    `;
  } else if (type === "techo") {
    inputsContainer.innerHTML = `
      <div class="form-group">
        <label>Espesor losa (m)</label>
        <input type="number" id="input-espesor" value="0.12" step="0.01">
      </div>
      <div class="form-group">
        <label>Ancho (m)</label>
        <input type="number" id="input-ancho" placeholder="Ej: 6.0" step="0.1">
      </div>
      <div class="form-group">
        <label>Largo (m)</label>
        <input type="number" id="input-largo" placeholder="Ej: 8.0" step="0.1">
      </div>
    `;
  } else if (type === "piso") {
    inputsContainer.innerHTML = `
      <div class="form-group">
        <label>Ancho del área (m)</label>
        <input type="number" id="input-ancho" placeholder="Ej: 4.0" step="0.1">
      </div>
      <div class="form-group">
        <label>Largo del área (m)</label>
        <input type="number" id="input-largo" placeholder="Ej: 5.0" step="0.1">
      </div>
    `;
  } else if (type === "pintura") {
    inputsContainer.innerHTML = `
      <div class="form-group">
        <label>Superficie del muro (m²)</label>
        <input type="number" id="input-superficie" placeholder="Ej: 25.0" step="0.1">
      </div>
      <div class="form-group">
        <label>Número de Manos</label>
        <input type="number" id="input-manos" value="2" min="1">
      </div>
    `;
  }
}

function clearCalcInputs() {
  const inputs = document.querySelectorAll("#dynamic-inputs input");
  inputs.forEach((i) => (i.value = ""));
  document.getElementById("result-box").style.display = "none";
}

function executeCalculation() {
  let resultHTML = "";
  let summaryText = "";

  if (activeCalcType === "muro") {
    const largo = parseFloat(document.getElementById("input-largo")?.value) || 0;
    const altura = parseFloat(document.getElementById("input-altura")?.value) || 0;
    if (largo <= 0 || altura <= 0) return alert("Ingrese dimensiones válidas.");

    const area = largo * altura;
    const ladrillos = Math.ceil(area * 36);
    const cementoBolsas = (area * 0.25).toFixed(1);
    const arenaM3 = (area * 0.02).toFixed(2);

    resultHTML = `
      • Área Total: <strong>${area.toFixed(2)} m²</strong><br>
      • Ladrillos necesarios: <strong>${ladrillos} unidades</strong> (Aprox)<br>
      • Cemento: <strong>${cementoBolsas} bolsas (50kg)</strong><br>
      • Arena fina: <strong>${arenaM3} m³</strong>
    `;
    summaryText = `${ladrillos} ladrillos, ${cementoBolsas} bolsas cemento`;
  } else if (activeCalcType === "viga" || activeCalcType === "columna") {
    const largo = parseFloat(document.getElementById("input-largo")?.value) || 0;
    const ancho = parseFloat(document.getElementById("input-ancho")?.value) || 0;
    const alto = parseFloat(document.getElementById("input-alto")?.value) || 0;
    if (largo <= 0 || ancho <= 0 || alto <= 0) return alert("Ingrese dimensiones válidas.");

    const vol = largo * ancho * alto;
    const cemento = Math.ceil(vol * 7.5);
    const arena = (vol * 0.45).toFixed(2);
    const grava = (vol * 0.85).toFixed(2);

    resultHTML = `
      • Volumen de hormigón: <strong>${vol.toFixed(2)} m³</strong><br>
      • Cemento: <strong>${cemento} bolsas</strong><br>
      • Arena: <strong>${arena} m³</strong><br>
      • Grava/Triturado: <strong>${grava} m³</strong>
    `;
    summaryText = `Vol: ${vol.toFixed(2)}m³, Cemento: ${cemento} bolsas`;
  } else if (activeCalcType === "contrapiso" || activeCalcType === "techo") {
    const esp = parseFloat(document.getElementById("input-espesor")?.value) || 0;
    const ancho = parseFloat(document.getElementById("input-ancho")?.value) || 0;
    const largo = parseFloat(document.getElementById("input-largo")?.value) || 0;
    if (esp <= 0 || ancho <= 0 || largo <= 0) return alert("Ingrese dimensiones válidas.");

    const area = ancho * largo;
    const vol = area * esp;
    const cemento = Math.ceil(vol * 6);
    resultHTML = `
      • Área de cobertura: <strong>${area.toFixed(2)} m²</strong><br>
      • Volumen de vaciado: <strong>${vol.toFixed(2)} m³</strong><br>
      • Cemento estimado: <strong>${cemento} bolsas</strong>
    `;
    summaryText = `Área: ${area.toFixed(2)}m², Vol: ${vol.toFixed(2)}m³`;
  } else if (activeCalcType === "piso") {
    const ancho = parseFloat(document.getElementById("input-ancho")?.value) || 0;
    const largo = parseFloat(document.getElementById("input-largo")?.value) || 0;
    if (ancho <= 0 || largo <= 0) return alert("Ingrese dimensiones válidas.");

    const areaNeto = ancho * largo;
    const areaConDesperdicio = (areaNeto * 1.1).toFixed(2);
    const peganteBolsas = Math.ceil(areaNeto / 4);

    resultHTML = `
      • Área neta: <strong>${areaNeto.toFixed(2)} m²</strong><br>
      • Cerámica/Porcelanato (+10% desp.): <strong>${areaConDesperdicio} m²</strong><br>
      • Pegante para cerámico: <strong>${peganteBolsas} bolsas</strong>
    `;
    summaryText = `Piso: ${areaConDesperdicio} m² con desperdicio`;
  } else if (activeCalcType === "pintura") {
    const sup = parseFloat(document.getElementById("input-superficie")?.value) || 0;
    const manos = parseInt(document.getElementById("input-manos")?.value) || 2;
    if (sup <= 0) return alert("Ingrese una superficie válida.");

    const totalArea = sup * manos;
    const litros = (totalArea / 10).toFixed(1);
    const galones = (litros / 3.785).toFixed(1);

    resultHTML = `
      • Superficie total a aplicar: <strong>${totalArea.toFixed(2)} m²</strong> (${manos} manos)<br>
      • Cantidad de Pintura: <strong>${litros} Litros</strong> (~${galones} Galones)
    `;
    summaryText = `Pintura: ${litros} L (${galones} gal)`;
  }

  const resBox = document.getElementById("result-box");
  if (resBox) resBox.style.display = "block";
  const resText = document.getElementById("result-text");
  if (resText) resText.innerHTML = resultHTML;

  const dateStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  historyData.unshift({
    time: dateStr,
    type: document.getElementById("calc-module-title")?.innerText || "Cálculo",
    summary: summaryText,
  });
}

function renderHistory() {
  const tbody = document.getElementById("history-rows");
  if (!tbody) return;
  if (historyData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No hay cálculos registrados.</td></tr>`;
    return;
  }

  let html = "";
  historyData.forEach((item) => {
    html += `
      <tr>
        <td>${item.time}</td>
        <td><strong>${item.type}</strong></td>
        <td>Ejecutado por ${currentUser}</td>
        <td style="color: var(--accent-orange);">${item.summary}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function saveProfile() {
  const newEmail = document.getElementById("prof-email")?.value;
  const newUser = document.getElementById("prof-user")?.value;

  if (newUser && newUser.trim() !== "") {
    currentUser = newUser;
    currentEmail = newEmail;
    updateUserHeader();
    alert("Perfil actualizado correctamente.");
  }
}

function filterCalculators() {
  const q = document.getElementById("search-input")?.value.toLowerCase() || "";
  const cards = document.querySelectorAll("#cards-grid .calc-card");

  showNav("inicio");
  cards.forEach((card) => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(q) ? "flex" : "none";
  });
}