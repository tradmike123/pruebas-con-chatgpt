const statusIcons = {
  ok: "✅",
  warn: "⚠️",
  missing: "❌",
  manual: "ℹ️"
};

const checkBtn = document.getElementById("checkBtn");
const retryBtn = document.getElementById("retryBtn");
const statusSummary = document.getElementById("statusSummary");
const resultsContainer = document.getElementById("results");

const downloadButtons = document.querySelectorAll('button[data-link]');
const openFolderBtn = document.getElementById("openFolderBtn");

if (checkBtn) checkBtn.addEventListener("click", runBrowserCheck);
if (retryBtn) retryBtn.addEventListener("click", runBrowserCheck);
if (openFolderBtn) openFolderBtn.addEventListener("click", handleOpenFolderRequest);
downloadButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    window.open(btn.dataset.link, "_blank", "noopener");
  });
});

function runBrowserCheck() {
  const report = buildReport();
  renderReport(report);
}

function buildReport() {
  const categories = [];

  const systemInfo = detectSystemInfo();
  const browserInfo = detectBrowserInfo();
  const webglInfo = detectWebGL();

  categories.push({
    title: "A1) Sistema y permisos",
    items: [
      {
        name: "SO, versión y arquitectura",
        status: systemInfo.summary ? "ok" : "manual",
        detail: systemInfo.summary || "No disponible desde el navegador. Ejecuta el script local para ver el detalle exacto.",
        fix: null
      },
      {
        name: "Usuario con permisos de administrador",
        status: "manual",
        detail: "No se puede verificar desde el navegador. Usa el script PowerShell o bash para confirmarlo.",
        fix: "Ver comandos en la sección inferior."
      },
      {
        name: "Modo ahorro de energía desactivado",
        status: "manual",
        detail: "Revisa la configuración de energía de tu sistema y selecciona el plan de máximo rendimiento.",
        fix: "Windows: Configuración > Sistema > Energía. macOS: Preferencias > Batería."
      }
    ]
  });

  categories.push({
    title: "A2) Hardware mínimo",
    items: buildHardwareItems(systemInfo)
  });

  categories.push({
    title: "A3) Navegador y capacidades in-browser",
    items: buildBrowserItems(browserInfo, webglInfo)
  });

  categories.push({
    title: "A4) Herramientas gratuitas objetivo",
    items: [
      {
        name: "ffmpeg (portable o en PATH)",
        status: "manual",
        detail: "Se detecta desde script local. Asegúrate de tener un binario en /herramientas/ffmpeg/ según tu sistema.",
        fix: "Usa el botón de descarga o coloca el binario en la carpeta del proyecto."
      },
      {
        name: "Audacity (opcional)",
        status: "manual",
        detail: "Descarga la versión portable/ZIP si deseas limpiar voz.",
        fix: "Pulsa el botón DESCARGAR AUDACITY para abrir el sitio oficial."
      },
      {
        name: "Shotcut (opcional)",
        status: "manual",
        detail: "Ideal para edición offline rápida.",
        fix: "Pulsa el botón DESCARGAR SHOTCUT."
      },
      {
        name: "7-Zip / unzip",
        status: "manual",
        detail: "Verifica que tengas una herramienta para extraer archivos. En Windows recomendamos 7-Zip.",
        fix: "Si falta, descarga desde https://www.7-zip.org/."
      }
    ]
  });

  categories.push({
    title: "A5) Carpetas de proyecto",
    items: [
      {
        name: "Estructura base creada",
        status: "manual",
        detail: "El script local crea \nC:/proyectos_pov/ (Windows) o ~/proyectos_pov/ (macOS/Linux) con subcarpetas herramientas/, final/, audio/, video/raw/, subtitles/, research/, pre/, log/.",
        fix: "Ejecuta el bloque mkdir indicado más abajo."
      }
    ]
  });

  categories.push({
    title: "A6) Red",
    items: [
      {
        name: "Ancho de banda mínimo",
        status: "manual",
        detail: "Ejecuta un test de velocidad (ej. speed.cloudflare.com). Recomendado ≥10 Mbps descarga / ≥2 Mbps subida.",
        fix: "Si estás por debajo, activa el modo ligero: 720p, 20 fps, ≤40s."
      }
    ]
  });

  categories.push({
    title: "A7) Resultado",
    items: [
      {
        name: "Resumen",
        status: determineOverallStatus(categories),
        detail: "El estado se actualiza con base en los chequeos de navegador. Completa los campos manuales con el script para obtener un ✅ definitivo.",
        fix: null
      }
    ]
  });

  return categories;
}

function buildHardwareItems(systemInfo) {
  const items = [];

  if (systemInfo.cpuCores) {
    const ok = systemInfo.cpuCores >= 4;
    items.push({
      name: `CPU — núcleos detectados (${systemInfo.cpuCores})`,
      status: ok ? "ok" : "missing",
      detail: ok ? "Cumple el mínimo recomendado (≥4 núcleos)." : "Se detectan menos de 4 núcleos. Considera usar un equipo con más núcleos o reforzar con GPU/cloud.",
      fix: ok ? null : "Verifica en el script local que la detección coincida."
    });
  } else {
    items.push({
      name: "CPU — núcleos",
      status: "manual",
      detail: "Tu navegador no expone este dato. Ejecuta el script local para confirmarlo.",
      fix: null
    });
  }

  if (systemInfo.memory) {
    const ok = systemInfo.memory >= 8;
    const warn = systemInfo.memory >= 8 && systemInfo.memory < 16;
    items.push({
      name: `RAM aproximada (${systemInfo.memory} GB)` ,
      status: ok ? (warn ? "warn" : "ok") : "missing",
      detail: ok ? (warn ? "Mínimo cumplido. Sugerimos 16 GB para multitarea fluida." : "Listo para tareas pesadas.") : "Menos de 8 GB detectados. Cierra apps o amplía memoria para evitar cuellos de botella.",
      fix: ok ? null : "Revisa con el script local para confirmar memoria disponible."
    });
  } else {
    items.push({
      name: "RAM",
      status: "manual",
      detail: "No se pudo estimar desde el navegador. Usa el script local para un valor exacto.",
      fix: null
    });
  }

  items.push({
    name: "Espacio libre en disco",
    status: "manual",
    detail: "Verifica que haya ≥10 GB libres en la unidad de trabajo. El script local lo calcula automáticamente.",
    fix: "Usa df/PowerShell según tu plataforma."
  });

  items.push({
    name: "GPU y drivers",
    status: systemInfo.gpu ? "ok" : "manual",
    detail: systemInfo.gpu || "Crea el archivo dxdiag (Windows) o usa herramientas como `glxinfo` para validar que la aceleración esté activa.",
    fix: systemInfo.gpu ? "Abre chrome://gpu para validar WebGL/WebGPU con más detalle." : "Actualiza drivers desde el fabricante si el script detecta problemas."
  });

  return items;
}

function buildBrowserItems(browserInfo, webglInfo) {
  const items = [];

  items.push({
    name: "Navegador",
    status: browserInfo.isModern ? "ok" : "missing",
    detail: browserInfo.description,
    fix: browserInfo.isModern ? null : "Instala la última versión de Chrome o Edge."
  });

  items.push({
    name: "Aceleración por hardware",
    status: webglInfo.hardwareAccelerated ? "ok" : (webglInfo.supported ? "warn" : "missing"),
    detail: webglInfo.hardwareAccelerated
      ? "WebGL se creó correctamente. La aceleración parece activa."
      : webglInfo.supported
        ? "WebGL disponible, pero no se pudo confirmar aceleración. Ve a Configuración > Sistema > 'Usar aceleración de hardware'."
        : "No se pudo crear un contexto WebGL. La aceleración está deshabilitada o el equipo no la soporta.",
    fix: webglInfo.supported
      ? "En Chrome/Edge abre chrome://settings/system y activa 'Usar aceleración de hardware cuando esté disponible'."
      : "Revisa drivers o usa otro navegador compatible."
  });

  items.push({
    name: "WebGL",
    status: webglInfo.supported ? "ok" : "missing",
    detail: webglInfo.supported ? `Renderer: ${webglInfo.renderer}` : "Contexto WebGL no disponible.",
    fix: webglInfo.supported ? null : "Actualiza navegador y drivers; verifica en chrome://gpu."
  });

  items.push({
    name: "WebGPU",
    status: browserInfo.webgpu ? "ok" : "warn",
    detail: browserInfo.webgpu ? "API WebGPU detectada." : "WebGPU no habilitado. Algunas herramientas usarán fallback a WebGL/WebAssembly.",
    fix: browserInfo.webgpu ? null : "En Chrome/Edge habilita chrome://flags/#enable-unsafe-webgpu si tu GPU lo soporta."
  });

  items.push({
    name: "Canvas & WebAudio",
    status: browserInfo.webaudio ? "ok" : "missing",
    detail: browserInfo.webaudio ? "APIs disponibles para prerender y audio en navegador." : "WebAudio no disponible. Actualiza o cambia de navegador.",
    fix: browserInfo.webaudio ? null : "Actualiza a la última versión de Chrome/Edge/Firefox."
  });

  return items;
}

function renderReport(categories) {
  resultsContainer.innerHTML = "";
  resultsContainer.classList.remove("hidden");
  statusSummary.classList.remove("hidden");

  let missingCount = 0;

  categories.forEach(category => {
    const section = document.createElement("section");
    section.className = "category";

    const title = document.createElement("h3");
    title.textContent = category.title;
    section.appendChild(title);

    const list = document.createElement("ul");
    list.className = "checklist";

    category.items.forEach(item => {
      if (item.status === "missing") missingCount += 1;
      const li = document.createElement("li");

      const header = document.createElement("div");
      header.className = "item-header";

      const icon = document.createElement("span");
      icon.className = "status";
      icon.textContent = statusIcons[item.status] || "ℹ️";

      const name = document.createElement("span");
      name.textContent = item.name;

      header.appendChild(icon);
      header.appendChild(name);
      li.appendChild(header);

      if (item.detail) {
        const detail = document.createElement("div");
        detail.className = "item-details";
        detail.textContent = item.detail;
        li.appendChild(detail);
      }

      if (item.fix) {
        const fix = document.createElement("div");
        fix.className = "fix-actions";
        if (item.fix.startsWith("http")) {
          const link = document.createElement("a");
          link.href = item.fix;
          link.target = "_blank";
          link.rel = "noopener";
          link.textContent = "Abrir recurso";
          fix.appendChild(link);
        } else {
          fix.textContent = item.fix;
        }
        li.appendChild(fix);
      }

      list.appendChild(li);
    });

    section.appendChild(list);
    resultsContainer.appendChild(section);
  });

  if (missingCount === 0) {
    statusSummary.textContent = "Estado: LISTO — completa los pasos marcados con ℹ️ para un 100% de cobertura.";
  } else {
    statusSummary.textContent = `Estado: FALTAN ${missingCount} COSA(S) — revisa los elementos marcados con ❌.`;
  }
}

function detectSystemInfo() {
  const info = {
    summary: null,
    cpuCores: navigator.hardwareConcurrency || null,
    memory: navigator.deviceMemory ? Math.round(navigator.deviceMemory) : null,
    gpu: null
  };

  const uaData = navigator.userAgentData;
  if (uaData) {
    const brands = uaData.brands ? uaData.brands.map(b => `${b.brand} ${b.version}`).join(", ") : "";
    const platform = uaData.platform || "";
    const arch = uaData.architecture || "";
    info.summary = `${platform} ${brands}`.trim();
    if (arch) info.summary += ` — ${arch}`;
  } else {
    info.summary = navigator.userAgent;
  }

  const webgl = detectWebGL();
  if (webgl.supported) {
    info.gpu = `GPU detectada: ${webgl.renderer}`;
  }

  return info;
}

function detectBrowserInfo() {
  const uaData = navigator.userAgentData;
  let browserName = "Desconocido";
  let version = "";

  if (uaData && Array.isArray(uaData.brands)) {
    const brand = uaData.brands.find(b => /Chrome|Chromium|Edge|Opera|Firefox/i.test(b.brand));
    if (brand) {
      browserName = brand.brand;
      version = brand.version;
    }
  } else {
    const ua = navigator.userAgent;
    const match = ua.match(/(Chrome|Edg|Firefox|Safari)\/([\d.]+)/);
    if (match) {
      browserName = match[1].replace("Edg", "Edge");
      version = match[2];
    }
  }

  const isModern = /Chrome|Chromium|Edg|Firefox/i.test(browserName) && (!!version && parseInt(version, 10) >= 110);

  return {
    description: `${browserName} ${version}`.trim() || navigator.userAgent,
    isModern,
    webgpu: "gpu" in navigator,
    webaudio: "AudioContext" in window || "webkitAudioContext" in window
  };
}

function detectWebGL() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!context) {
    return {
      supported: false,
      hardwareAccelerated: false,
      renderer: "No disponible"
    };
  }

  const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
  const renderer = debugInfo ? context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : context.getParameter(context.RENDERER);
  const vendor = debugInfo ? context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : context.getParameter(context.VENDOR);

  const hardwareAccelerated = renderer && !/swiftshader|software|llvmpipe/i.test(renderer);

  return {
    supported: true,
    hardwareAccelerated,
    renderer: `${vendor} — ${renderer}`
  };
}

function determineOverallStatus(categories) {
  for (const category of categories) {
    for (const item of category.items) {
      if (item.status === "missing") {
        return "missing";
      }
    }
  }
  return "ok";
}

function handleOpenFolderRequest() {
  const platform = navigator.userAgentData?.platform || navigator.platform || "";
  let folderHint = "C:/proyectos_pov";

  if (/Mac|iPhone|iPad/i.test(platform)) {
    folderHint = "~/proyectos_pov";
  } else if (/Linux/i.test(platform)) {
    folderHint = "~/proyectos_pov";
  }

  alert(`Por seguridad el navegador no puede abrir carpetas locales. Abre manualmente la ruta ${folderHint} o ejecútala desde el script local.`);
}
