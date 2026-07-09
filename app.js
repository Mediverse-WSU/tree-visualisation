const state = {
  root: null,
  focusId: null,
  treeRoot: null,
  treeFocusId: null,
  classicTreemapRoot: null,
  dcRoot: null,
  dcFocusId: null,
  dcDrillId: null,
  search: "",
  chartType: "tree",
  dcProperties: null,
  settings: {
    breakLabels: false,
    labelLength: 24,
    cueMode: "simple",
    drawTypes: true,
    displayDistance: 46,
    treeCueLength: 8,
    maxImageHeight: 82,
    weightOne: 25,
    weightTwo: 80,
    minRatio: 0.7,
    maxRatio: 2.2,
    labelColor: "#172033",
  },
};

const els = {};
const svgNS = "http://www.w3.org/2000/svg";
const DOI_DATASETS = [
  { label: "2811.xml", path: "data/2811.xml" },
  { label: "3137_filesystem.xml", path: "data/3137_filesystem.xml" },
  { label: "6814_filesystem.xml", path: "data/6814_filesystem.xml" },
  { label: "CategoryAustralia_6254.xml", path: "data/CategoryAustralia_6254.xml" },
  { label: "CategoryUSA_20289.xml", path: "data/CategoryUSA_20289.xml" },
  { label: "Safety events ontology New.xml", path: "data/Safety events ontology New.xml" },
  { label: "WSU courses.xml", path: "data/WSU courses.xml" },
];
const CLASSIC_TREEMAP_DATASETS = [
  { label: "simple1.tm3", path: "data/classic-treemap/simple1.tm3" },
  { label: "simple2.tm3", path: "data/classic-treemap/simple2.tm3" },
  { label: "election-with-hierarchy.tm3", path: "data/classic-treemap/election-with-hierarchy.tm3" },
  { label: "election-no-hierarchy.tm3", path: "data/classic-treemap/election-no-hierarchy.tm3" },
  { label: "43causesofdeath-65plus.tm3", path: "data/classic-treemap/43causesofdeath-65plus.tm3" },
  { label: "Firearms.tm3", path: "data/classic-treemap/Firearms.tm3" },
  { label: "projectReport_with_hierarchy.tm3", path: "data/classic-treemap/projectReport_with_hierarchy.tm3" },
  { label: "projectReport_no_hierarchy.tm3", path: "data/classic-treemap/projectReport_no_hierarchy.tm3" },
  { label: "census.tm3", path: "data/classic-treemap/census.tm3" },
  { label: "nba-with-hierarchy.tm3", path: "data/classic-treemap/nba-with-hierarchy.tm3" },
  { label: "nba-no-hierarchy.tm3", path: "data/classic-treemap/nba-no-hierarchy.tm3" },
];
const DC_DATASETS = [
  { label: "671_java.xml", path: "data/dc-treemap/filesystem/671_java.xml" },
  { label: "672.xml", path: "data/dc-treemap/filesystem/672.xml" },
  { label: "778.xml", path: "data/dc-treemap/filesystem/778.xml" },
  { label: "changed name 778.xml", path: "data/dc-treemap/filesystem/changed name 778.xml" },
  { label: "3409.xml", path: "data/dc-treemap/filesystem/3409.xml" },
  { label: "5410.xml", path: "data/dc-treemap/filesystem/5410.xml" },
  { label: "144460.xml", path: "data/dc-treemap/filesystem/144460.xml" },
];
const DC_PROPERTIES = [
  { label: "Default polygon", path: "data/dc-treemap/properties.dat" },
  {
    label: "Rectangle",
    path: "data/dc-treemap/properties_rect.dat",
    container: [
      { x: 0, y: 0 },
      { x: 1400, y: 0 },
      { x: 1400, y: 900 },
      { x: 0, y: 900 },
    ],
  },
  { label: "Triangle", path: "data/dc-treemap/properties_triangle.dat" },
  { label: "6-point concave", path: "data/dc-treemap/properties_6_concave.dat" },
  { label: "8-point polygon", path: "data/dc-treemap/properties_8_c.dat" },
];
const SAMPLE_PRESETS = [
  { label: "Small weighted tree", levels: 2, maxChildren: 3, weighted: true },
  { label: "Medium weighted tree", levels: 3, maxChildren: 4, weighted: true },
  { label: "Large weighted tree", levels: 4, maxChildren: 5, weighted: true },
  { label: "Small unweighted tree", levels: 2, maxChildren: 3, weighted: false },
  { label: "Medium unweighted tree", levels: 3, maxChildren: 4, weighted: false },
  { label: "Wide category-style tree", levels: 3, maxChildren: 7, weighted: true },
];
const DEFAULT_SAMPLE_INDEX = 5;
const DEFAULT_DOI_DATASET_INDEX = 0;
const DOI_VISIBLE_LIMIT = 280;
const DOI_CHILD_LIMIT = 70;
const DOI_SEARCH_LIMIT = 120;

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  populateDcProperties();
  populateDoiDatasets();
  populateClassicTreemapDatasets();
  populateDcDatasets();
  bindEvents();
  state.treeRoot = createSampleTreeFromPreset(SAMPLE_PRESETS[DEFAULT_SAMPLE_INDEX]);
  state.treeFocusId = state.treeRoot.id;
  state.root = state.treeRoot;
  state.focusId = state.treeFocusId;
  state.dcProperties = defaultDcProperties();
  updateChartControls();
  render();
  loadSelectedDcProperty();
  els.doiDatasetSelect.value = String(DEFAULT_DOI_DATASET_INDEX);
  loadSelectedDoiDataset();
});

function bindElements() {
  [
    "xmlFile",
    "treeChartTab",
    "classicTreemapChartTab",
    "dcTreemapChartTab",
    "doiDatasetField",
    "doiDatasetSelect",
    "classicTreemapDatasetField",
    "classicTreemapDatasetSelect",
    "dcDatasetField",
    "dcDatasetSelect",
    "dcPropertyField",
    "dcPropertySelect",
    "treeViewPanel",
    "exportBtn",
    "cueMode",
    "drawTypes",
    "displayDistance",
    "treeCueLength",
    "maxImageHeight",
    "searchInput",
    "drillUpBtn",
    "chartPath",
    "treeMeta",
    "treeSvg",
    "canvasWrap",
    "statusbar",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  [els.treeChartTab, els.classicTreemapChartTab, els.dcTreemapChartTab].forEach((tab) => {
    tab.addEventListener("click", () => setChartType(tab.dataset.chart));
  });

  els.doiDatasetSelect.addEventListener("change", () => {
    if (els.doiDatasetSelect.value) loadSelectedDoiDataset();
  });

  els.classicTreemapDatasetSelect.addEventListener("change", () => {
    if (els.classicTreemapDatasetSelect.value) loadSelectedClassicTreemapDataset();
  });

  els.dcDatasetSelect.addEventListener("change", () => {
    if (els.dcDatasetSelect.value) loadSelectedDcDataset();
  });

  els.dcPropertySelect.addEventListener("change", () => loadSelectedDcProperty());

  els.drillUpBtn.addEventListener("click", () => drillUp());

  els.xmlFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".tm3")) {
      loadClassicTreemapFromText(text, `Loaded ${file.name}`, file.name);
    } else {
      loadTreeFromText(text, `Loaded ${file.name}`, parseTreeML);
    }
    event.target.value = "";
  });

  els.exportBtn.addEventListener("click", () => {
    const xml = exportTreeML(state.root);
    downloadText("data.xml", xml, "text/xml");
    setStatus("Exported TreeML XML.");
  });

  [
    "cueMode",
    "drawTypes",
    "displayDistance",
    "treeCueLength",
    "maxImageHeight",
  ].forEach((id) => {
    els[id].addEventListener("input", () => {
      readSettings();
      render();
    });
  });

  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value.trim().toLowerCase();
    applySearchFocus();
    render();
  });

  window.addEventListener("resize", () => render());
}

function populateDcProperties() {
  DC_PROPERTIES.forEach((preset, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = preset.label;
    els.dcPropertySelect.append(option);
  });
  els.dcPropertySelect.value = "1";
}

function populateDoiDatasets() {
  DOI_DATASETS.forEach((dataset, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = dataset.label;
    els.doiDatasetSelect.append(option);
  });
}

function populateClassicTreemapDatasets() {
  CLASSIC_TREEMAP_DATASETS.forEach((dataset, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = dataset.label;
    els.classicTreemapDatasetSelect.append(option);
  });
}

function populateDcDatasets() {
  DC_DATASETS.forEach((dataset, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = dataset.label;
    els.dcDatasetSelect.append(option);
  });
}

function updateChartControls() {
  els.doiDatasetField.classList.toggle("hidden", state.chartType !== "tree");
  els.classicTreemapDatasetField.classList.toggle("hidden", state.chartType !== "classic-treemap");
  els.dcDatasetField.classList.toggle("hidden", state.chartType !== "dc-treemap");
  els.dcPropertyField.classList.toggle("hidden", state.chartType !== "dc-treemap");
  els.treeViewPanel.classList.toggle("hidden", state.chartType !== "tree");
  els.searchInput.placeholder = state.chartType === "dc-treemap" ? "Find within D&C tree" : "Find a node";
  [els.treeChartTab, els.classicTreemapChartTab, els.dcTreemapChartTab].forEach((tab) => {
    const active = tab.dataset.chart === state.chartType;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

function setChartType(chartType) {
  if (state.chartType !== chartType) saveActiveChartData();
  state.chartType = chartType;
  activateChartData(chartType);
  updateChartControls();
  setStatus(`Showing ${chartLabel(chartType)}.`);
  render();
}

function chartLabel(chartType) {
  if (chartType === "dc-treemap") return "D&C treemap chart";
  if (chartType === "classic-treemap") return "Treemap chart";
  return "DOI tree chart";
}

function saveActiveChartData() {
  if (!state.root) return;
  if (state.chartType === "classic-treemap") {
    state.classicTreemapRoot = state.root;
  } else if (state.chartType === "dc-treemap") {
    state.dcRoot = state.root;
    state.dcFocusId = state.focusId;
  } else {
    state.treeRoot = state.root;
    state.treeFocusId = state.focusId;
  }
}

function activateChartData(chartType) {
  if (chartType === "classic-treemap") {
    state.root = state.classicTreemapRoot || state.treeRoot;
    state.focusId = state.root?.id || null;
    return;
  }
  if (chartType === "dc-treemap") {
    state.root = state.dcRoot || state.treeRoot;
    state.focusId = state.dcFocusId || state.root?.id || null;
    if (state.dcDrillId && !findById(state.root, state.dcDrillId)) state.dcDrillId = null;
    return;
  }
  state.root = state.treeRoot;
  state.focusId = state.treeFocusId || state.root?.id || null;
}

async function loadSelectedDcProperty() {
  const preset = DC_PROPERTIES[Number(els.dcPropertySelect.value)] || DC_PROPERTIES[1];
  try {
    const response = await fetch(preset.path);
    if (!response.ok) throw new Error(`Could not open ${preset.label}.`);
    state.dcProperties = parseDcProperties(await response.text(), preset.label);
    if (preset.container) state.dcProperties.container = preset.container;
    if (state.chartType === "dc-treemap") {
      setStatus(`Loaded ${preset.label} treemap shape.`);
      render();
    }
  } catch (error) {
    state.dcProperties = defaultDcProperties();
    setStatus(error.message);
    render();
  }
}

async function loadSelectedDoiDataset() {
  const dataset = DOI_DATASETS[Number(els.doiDatasetSelect.value)];
  if (!dataset) {
    setStatus("Choose a DOI sample XML file first.");
    return;
  }

  try {
    setStatus(`Loading ${dataset.label}...`);
    const response = await fetch(dataset.path);
    if (!response.ok) throw new Error(`Could not open ${dataset.label}.`);
    state.treeRoot = parseTreeML(await response.text());
    state.treeFocusId = state.treeRoot.id;
    setChartType("tree");
    state.search = "";
    els.searchInput.value = "";
    setStatus(`Loaded DOI sample ${dataset.label}.`);
    render();
  } catch (error) {
    setStatus(error.message);
  }
}

async function loadSelectedClassicTreemapDataset() {
  const dataset = CLASSIC_TREEMAP_DATASETS[Number(els.classicTreemapDatasetSelect.value)];
  if (!dataset) {
    setStatus("Choose a Treemap sample file first.");
    return;
  }

  try {
    setStatus(`Loading ${dataset.label}...`);
    const response = await fetch(dataset.path);
    if (!response.ok) throw new Error(`Could not open ${dataset.label}.`);
    state.classicTreemapRoot = parseTm3(await response.text(), dataset.label);
    setChartType("classic-treemap");
    state.search = "";
    els.searchInput.value = "";
    setStatus(`Loaded Treemap sample ${dataset.label}.`);
    render();
  } catch (error) {
    setStatus(error.message);
  }
}

async function loadSelectedDcDataset() {
  const dataset = DC_DATASETS[Number(els.dcDatasetSelect.value)];
  if (!dataset) {
    setStatus("Choose a D&C sample XML file first.");
    return;
  }

  try {
    setStatus(`Loading ${dataset.label}...`);
    const response = await fetch(dataset.path);
    if (!response.ok) throw new Error(`Could not open ${dataset.label}.`);
    state.dcRoot = parseTreeML(await response.text());
    state.dcFocusId = state.dcRoot.id;
    state.dcDrillId = null;
    setChartType("dc-treemap");
    state.search = "";
    els.searchInput.value = "";
    setStatus(`Loaded D&C sample ${dataset.label}.`);
    render();
  } catch (error) {
    setStatus(error.message);
  }
}

function createSampleTreeFromPreset(sample) {
  return createSampleTree(sample.levels, sample.maxChildren, sample.weighted, sample.label.replace(/\s+tree$/i, ""));
}

function readSettings() {
  state.settings.cueMode = els.cueMode.value;
  state.settings.drawTypes = els.drawTypes.checked;
  state.settings.displayDistance = numberValue(els.displayDistance, 46);
  state.settings.treeCueLength = numberValue(els.treeCueLength, 8);
  state.settings.maxImageHeight = numberValue(els.maxImageHeight, 82);
}

function numberValue(input, fallback) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : fallback;
}

function loadTreeFromText(text, message, parser) {
  try {
    const root = parser(text);
    if (state.chartType === "dc-treemap") {
      state.dcRoot = root;
      state.dcFocusId = root.id;
      state.dcDrillId = null;
    } else if (state.chartType === "classic-treemap") {
      state.classicTreemapRoot = root;
    } else {
      state.treeRoot = root;
      state.treeFocusId = root.id;
    }
    state.root = root;
    state.focusId = root.id;
    setStatus(message);
    render();
  } catch (error) {
    setStatus(error.message);
  }
}

function loadClassicTreemapFromText(text, message, name) {
  try {
    state.classicTreemapRoot = parseTm3(text, name);
    setChartType("classic-treemap");
    state.search = "";
    els.searchInput.value = "";
    setStatus(message);
    render();
  } catch (error) {
    setStatus(error.message);
  }
}

function node(label, options = {}) {
  return {
    id: options.id || `n${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`,
    label: label || "Untitled",
    link: options.link || "",
    type: Number(options.type || 0),
    weight: Number(options.weight || 1),
    children: options.children || [],
    expanded: options.expanded !== false,
    parent: null,
    depth: 0,
    descendantWeight: 1,
    descendantCount: 1,
  };
}

function normalizeTree(root) {
  let counter = 0;
  walk(root, (item, parent, depth) => {
    item.parent = parent;
    item.depth = depth;
    item.id = item.id || `node-${counter}`;
    item.children = item.children || [];
    item.expanded = item.expanded !== false;
    item.weight = Math.max(1, Number(item.weight || 1));
    item.type = Number(item.type || 0);
    counter += 1;
  });
  computeWeights(root);
  return root;
}

function walk(root, visitor, parent = null, depth = 0) {
  visitor(root, parent, depth);
  (root.children || []).forEach((child) => walk(child, visitor, root, depth + 1));
}

function computeWeights(root) {
  let count = 1;
  let weight = root.weight || 1;
  root.children.forEach((child) => {
    computeWeights(child);
    count += child.descendantCount;
    weight += child.descendantWeight;
  });
  root.descendantCount = count;
  root.descendantWeight = weight;
}

function createSampleTree(levels, maxChildren, weighted, rootLabel = "Root") {
  let serial = 0;
  function make(level, label) {
    const item = node(label, {
      id: `sample-${serial}`,
      type: level % 5,
      weight: weighted ? 2 + ((serial * 7) % 35) : 1,
    });
    serial += 1;
    if (level < levels) {
      const children = Math.max(2, ((serial + level) % maxChildren) + 1);
      for (let i = 0; i < children; i += 1) {
        item.children.push(make(level + 1, `${label}.${i + 1}`));
      }
    }
    return item;
  }
  return normalizeTree(make(0, rootLabel));
}

function parseTreeML(text) {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const error = doc.querySelector("parsererror");
  if (error) throw new Error("The XML file could not be parsed.");
  if (doc.documentElement.tagName.toLowerCase() === "graph") return parseGraphXML(doc);
  const tree = doc.querySelector("tree") || doc.documentElement;
  const rootEl = Array.from(tree.children).find((child) => isTreeElement(child));
  if (!rootEl) throw new Error("No TreeML branch or leaf was found.");
  return normalizeTree(parseTreeElement(rootEl));
}

function parseGraphXML(doc) {
  const nodes = new Map();
  const incoming = new Set();

  Array.from(doc.querySelectorAll("graph > node")).forEach((nodeEl) => {
    const id = directText(nodeEl, "id");
    if (!id) return;
    nodes.set(id, node(directText(nodeEl, "label") || id, {
      id,
      type: directText(nodeEl, "type") || 0,
      weight: directText(nodeEl, "weight") || 1,
    }));
  });

  Array.from(doc.querySelectorAll("graph > edge")).forEach((edgeEl) => {
    const from = directText(edgeEl, "from");
    const to = directText(edgeEl, "to");
    const parent = nodes.get(from);
    const child = nodes.get(to);
    if (parent && child) {
      parent.children.push(child);
      incoming.add(to);
    }
  });

  const roots = Array.from(nodes.entries())
    .filter(([id]) => !incoming.has(id))
    .map(([, item]) => item);
  if (!roots.length) throw new Error("No root node was found in the graph XML.");
  return normalizeTree(roots.length === 1 ? roots[0] : node("Root", { id: "graph-root", children: roots }));
}

function directText(parent, tagName) {
  const child = Array.from(parent.children).find((item) => item.tagName.toLowerCase() === tagName);
  return child ? child.textContent.trim() : "";
}

function isTreeElement(el) {
  return ["branch", "leaf", "node"].includes(el.tagName.toLowerCase());
}

function parseTreeElement(el) {
  const attrs = readTreeAttributes(el);
  const item = node(attrs.label || attrs.name || el.getAttribute("name") || el.tagName, {
    id: attrs.id || el.getAttribute("id") || "",
    link: attrs.link || attrs.url || "",
    type: attrs.type || 0,
    weight: attrs.weight || attrs.size || attrs.value || 1,
  });
  item.children = Array.from(el.children)
    .filter((child) => isTreeElement(child))
    .map((child) => parseTreeElement(child));
  return item;
}

function readTreeAttributes(el) {
  const values = {};
  Array.from(el.attributes).forEach((attr) => {
    values[attr.name.toLowerCase()] = attr.value;
  });
  Array.from(el.children)
    .filter((child) => child.tagName.toLowerCase() === "attribute")
    .forEach((attrEl) => {
      const name = (attrEl.getAttribute("name") || "").toLowerCase();
      const value = attrEl.getAttribute("value") || attrEl.textContent || "";
      if (name) values[name] = value;
    });
  return values;
}

function parseTableText(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) throw new Error("The table file is empty.");

  const delimiter = detectDelimiter(lines[0]);
  const rows = lines.map((line) => splitRow(line, delimiter));
  const header = rows[0].map((cell) => cell.toLowerCase());
  const hasHeader = header.includes("parent") || header.includes("child") || header.includes("label");
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const root = node("Root", { id: "table-root" });

  if (hasHeader && header.includes("parent") && header.includes("child")) {
    const parentIndex = header.indexOf("parent");
    const childIndex = header.indexOf("child");
    const weightIndex = header.indexOf("weight");
    const typeIndex = header.indexOf("type");
    const linkIndex = header.indexOf("link");
    const byLabel = new Map([[root.label, root]]);
    dataRows.forEach((row) => {
      const parentLabel = row[parentIndex] || root.label;
      const childLabel = row[childIndex];
      if (!childLabel) return;
      const parent = getOrCreatePathNode(byLabel, root, parentLabel);
      let child = parent.children.find((candidate) => candidate.label === childLabel);
      if (!child) {
        child = node(childLabel);
        parent.children.push(child);
      }
      child.weight = Number(row[weightIndex] || child.weight || 1);
      child.type = Number(row[typeIndex] || child.type || 0);
      child.link = row[linkIndex] || child.link || "";
      byLabel.set(childLabel, child);
    });
  } else {
    dataRows.forEach((row) => {
      addPath(root, row.filter(Boolean));
    });
  }

  return normalizeTree(root.children.length === 1 ? root.children[0] : root);
}

function detectDelimiter(line) {
  if (line.includes("\t")) return "\t";
  if (line.includes("|")) return "|";
  return ",";
}

function splitRow(line, delimiter) {
  if (delimiter !== ",") return line.split(delimiter).map((cell) => cleanCell(cell));
  const cells = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cleanCell(current));
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(cleanCell(current));
  return cells;
}

function cleanCell(value) {
  return String(value || "").trim().replace(/^"|"$/g, "");
}

function getOrCreatePathNode(byLabel, root, path) {
  if (byLabel.has(path)) return byLabel.get(path);
  const parts = String(path).split(/[/>\\]+/).filter(Boolean);
  if (!parts.length) return root;
  let current = root;
  parts.forEach((part) => {
    let child = current.children.find((candidate) => candidate.label === part);
    if (!child) {
      child = node(part);
      current.children.push(child);
      byLabel.set(part, child);
    }
    current = child;
  });
  byLabel.set(path, current);
  return current;
}

function addPath(root, parts) {
  let current = root;
  parts.forEach((part) => {
    let child = current.children.find((candidate) => candidate.label === part);
    if (!child) {
      child = node(part, { type: inferType(part) });
      current.children.push(child);
    }
    current = child;
  });
}

function treeFromFileList(files) {
  const firstPath = files[0].webkitRelativePath || files[0].name;
  const rootName = firstPath.split(/[\\/]/)[0] || "Folder";
  const root = node(rootName, { id: "folder-root", type: 4 });
  files.forEach((file) => {
    const parts = (file.webkitRelativePath || file.name).split(/[\\/]/).filter(Boolean).slice(1);
    let current = root;
    parts.forEach((part, index) => {
      let child = current.children.find((candidate) => candidate.label === part);
      if (!child) {
        child = node(part, {
          type: index === parts.length - 1 ? inferType(part) : 4,
          weight: index === parts.length - 1 ? Math.max(1, Math.ceil(file.size / 1024)) : 1,
          link: index === parts.length - 1 ? file.name : "",
        });
        current.children.push(child);
      }
      current = child;
    });
  });
  return normalizeTree(root);
}

function inferType(label) {
  const ext = String(label).split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "tif", "tiff"].includes(ext)) return 1;
  if (["mp3", "wav", "mp4", "mpeg", "avi", "mov", "divx"].includes(ext)) return 2;
  if (["java", "js", "ts", "html", "css", "class", "py", "cs"].includes(ext)) return 3;
  if (["zip", "rar", "7z", "gz"].includes(ext)) return 5;
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf", "txt"].includes(ext)) return 6;
  return 0;
}

function parseTm3(text, name = "Treemap data") {
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length)
    .map((line) => line.split("\t"));
  if (rows.length < 3) throw new Error("The Treemap file does not contain TM3 rows.");

  const headers = rows[0].map((value) => value.trim());
  const types = rows[1].map((value) => value.trim().toUpperCase());
  const dataRows = rows.slice(2);
  const hierarchyStart = tm3HierarchyStart(headers, types, dataRows);
  const sizeIndex = tm3SizeIndex(headers, types, dataRows, hierarchyStart);
  const root = node(name.replace(/\.tm3$/i, ""), { type: 4, weight: 0 });

  dataRows.forEach((cells, rowIndex) => {
    const path = tm3HierarchyPath(cells, hierarchyStart);
    const label = cleanTm3Value(cells[0]) || `Row ${rowIndex + 1}`;
    const leafPath = path.length ? path : [label];
    const weight = Math.max(1, Number(cleanTm3Value(cells[sizeIndex])) || 1);
    let current = root;

    leafPath.forEach((part, depth) => {
      const childLabel = part || label;
      let child = current.children.find((item) => item.label === childLabel);
      if (!child) {
        child = node(childLabel, {
          type: depth,
          weight: depth === leafPath.length - 1 ? weight : 0,
          children: [],
        });
        current.children.push(child);
      } else if (depth === leafPath.length - 1) {
        child.weight += weight;
      }
      current = child;
    });
  });

  return normalizeTree(root);
}

function tm3HierarchyStart(headers, types, dataRows) {
  const maxColumns = Math.max(headers.length, types.length, ...dataRows.map((row) => row.length));
  for (let index = 0; index < maxColumns - 1; index += 1) {
    const headerBlank = !cleanTm3Value(headers[index]);
    const typeBlank = !cleanTm3Value(types[index]);
    const hasPathAfter = dataRows.some((row) => cleanTm3Value(row[index + 1]));
    if (headerBlank && typeBlank && hasPathAfter) return index + 1;
  }
  return maxColumns;
}

function tm3SizeIndex(headers, types, dataRows, hierarchyStart) {
  const candidates = types
    .map((type, index) => ({ type, index }))
    .filter(({ type, index }) => index < hierarchyStart && ["INTEGER", "FLOAT", "DOUBLE", "LONG"].includes(type))
    .filter(({ index }) => !/^id$/i.test(headers[index] || ""));

  const usable = candidates.find(({ index }) => dataRows.some((row) => Number(cleanTm3Value(row[index])) > 0));
  return usable?.index ?? candidates[0]?.index ?? 0;
}

function tm3HierarchyPath(cells, hierarchyStart) {
  if (hierarchyStart >= cells.length) return [];
  return cells
    .slice(hierarchyStart)
    .map(cleanTm3Value)
    .filter(Boolean);
}

function cleanTm3Value(value) {
  return String(value ?? "").trim().replace(/^"|"$/g, "");
}

function render() {
  if (!state.root) return;
  readSettings();
  computeWeights(state.root);
  updateChartHeader();
  if (state.chartType === "dc-treemap") {
    const cellCount = drawDCTreemap(state.root);
    updateMeta({ visibleCount: cellCount });
    return;
  }
  if (state.chartType === "classic-treemap") {
    const cellCount = drawClassicTreemap(state.root);
    updateMeta({ visibleCount: cellCount });
    return;
  }
  const layout = layoutTree(state.root);
  drawTree(layout);
  updateMeta(layout);
}

function updateChartHeader() {
  if (state.chartType === "dc-treemap") {
    const root = findById(state.root, state.dcDrillId) || state.root;
    const path = pathToRoot(root).reverse().map((item) => displayLabel(item.label)).join(" / ");
    els.chartPath.textContent = path;
    els.drillUpBtn.classList.toggle("hidden", root === state.root);
    return;
  }
  els.chartPath.textContent = state.root?.label || "";
  els.drillUpBtn.classList.add("hidden");
}

function drillUp() {
  if (state.chartType !== "dc-treemap") return;
  const current = findById(state.root, state.dcDrillId) || state.root;
  if (!current.parent) return;
  state.dcDrillId = current.parent === state.root ? null : current.parent.id;
  setStatus(`Showing ${displayLabel(current.parent.label)}.`);
  render();
}

function applySearchFocus() {
  if (!state.search || !state.root) return;
  const match = findFirstLabelMatch(state.root, state.search);
  if (!match) {
    setStatus(`No match for "${state.search}".`);
    return;
  }

  if (state.chartType === "dc-treemap") {
    const target = match.children.length ? match : match.parent;
    state.dcDrillId = target && target !== state.root ? target.id : null;
    state.dcFocusId = match.id;
    setStatus(`Found ${displayLabel(match.label)}.`);
    return;
  }

  state.focusId = match.id;
  if (state.chartType === "tree") state.treeFocusId = match.id;
  expandPathTo(match);
  setStatus(`Focused ${displayLabel(match.label)}.`);
}

function expandPathTo(item) {
  pathToRoot(item).forEach((nodeItem) => {
    nodeItem.expanded = true;
  });
}

function drawClassicTreemap(root) {
  const svg = els.treeSvg;
  const width = 1120;
  const height = 720;
  const padding = 28;
  const rect = { x: padding, y: 42, width: width - padding * 2, height: height - 68 };
  const cells = buildClassicTreemapCells(root, rect, 0, 4).slice(0, 1100);

  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;

  const title = svgEl("text", { x: padding, y: 24, fill: "#344054", "font-size": 13, "font-weight": 700 });
  title.textContent = `Treemap: ${root.label}`;
  svg.append(title);

  const group = svgEl("g");
  cells.forEach((cell) => {
    const match = itemMatchesSearch(cell.item || { label: cell.label, children: [] });
    group.append(svgEl("rect", {
      class: `classic-treemap-cell${match ? " match" : ""}`,
      x: cell.x,
      y: cell.y,
      width: Math.max(0, cell.width),
      height: Math.max(0, cell.height),
      fill: cell.color,
      opacity: cell.opacity,
    }));
    if (cell.width > 62 && cell.height > 24) {
      const text = svgEl("text", {
        class: cell.depth < 2 ? "classic-treemap-label" : "classic-treemap-small-label",
        x: cell.x + 5,
        y: cell.y + 15,
      });
      text.textContent = truncateLabel(cell.label, Math.floor((cell.width - 10) / 6.5));
      group.append(text);
    }
  });
  svg.append(group);
  return cells.length;
}

function drawDCTreemap(root) {
  const svg = els.treeSvg;
  const props = state.dcProperties || defaultDcProperties();
  const activeRoot = findById(root, state.dcDrillId) || root;
  const width = 1120;
  const height = 720;
  const padding = 36;
  const polygon = scalePolygon(props.container, width, height, padding);
  const bounds = polygonBounds(polygon);
  const boundsRect = { x: bounds.minX, y: bounds.minY, width: bounds.width, height: bounds.height };
  const clipId = `dcClip-${Date.now()}`;
  const cells = isAxisAlignedRectangle(polygon)
    ? buildDcTreemapCells(activeRoot, boundsRect, props).slice(0, 900)
    : buildPolygonTreemapCells(activeRoot, polygon, props).slice(0, 900);

  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.width = `${width}px`;
  svg.style.height = `${height}px`;

  const defs = svgEl("defs");
  const clip = svgEl("clipPath", { id: clipId });
  clip.append(svgEl("polygon", { points: polygonToString(polygon) }));
  defs.append(clip);
  svg.append(defs);

  svg.append(svgEl("polygon", {
    class: "dc-boundary",
    points: polygonToString(polygon),
  }));

  const group = svgEl("g", { "clip-path": `url(#${clipId})` });
  cells.forEach((cell) => {
    const canDrill = cell.item?.children?.length;
    const match = itemMatchesSearch(cell.item || { label: cell.label, children: [] });
    const rect = svgEl("rect", {
      class: `dc-cell${canDrill ? " drillable" : ""}${match ? " match" : ""}`,
      x: cell.x,
      y: cell.y,
      width: Math.max(0, cell.width),
      height: Math.max(0, cell.height),
      fill: cell.color,
      opacity: cell.opacity,
      tabindex: canDrill ? "0" : undefined,
    });
    const title = svgEl("title");
    title.textContent = canDrill
      ? `${cell.label} - click to view ${cell.item.children.length} sections`
      : cell.label;
    rect.append(title);
    if (canDrill) {
      rect.addEventListener("click", () => drillIntoDcCell(cell.item));
      rect.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          drillIntoDcCell(cell.item);
        }
      });
    }
    group.append(rect);
    if (cell.showLabel !== false && cell.width > 76 && cell.height > 30) {
      const text = svgEl("text", {
        class: cell.depth < 2 ? "dc-label" : "dc-small-label",
        x: cell.x + 6,
        y: cell.y + 17,
        fill: props.labelColor,
      });
      text.textContent = truncateLabel(cell.label, Math.floor((cell.width - 12) / 7));
      group.append(text);
    }
  });
  svg.append(group);

  const title = svgEl("text", { x: padding, y: 24, fill: "#344054", "font-size": 13, "font-weight": 700 });
  title.textContent = `${props.name}: ${displayLabel(activeRoot.label)}`;
  svg.append(title);
  return cells.length;
}

function drillIntoDcCell(item) {
  if (!item?.children?.length) return;
  state.dcDrillId = item.id;
  state.dcFocusId = item.id;
  setStatus(`Showing subsection ${displayLabel(item.label)}.`);
  render();
}

function displayLabel(label) {
  const text = String(label || "").trim();
  return text && text !== "." ? text : "Root";
}

function layoutTree(root) {
  const visible = [];
  const edges = [];
  const focus = findById(root, state.focusId) || root;
  const slot = { y: 48 };
  let visibleBudget = DOI_VISIBLE_LIMIT;

  function place(item) {
    if (visibleBudget <= 0) return false;
    visibleBudget -= 1;
    const candidates = visibleBudget > 0 ? visibleChildren(item, focus) : [];
    const placedChildren = [];
    item.x = 46 + item.depth * 230;
    candidates.forEach((child) => {
      if (visibleBudget <= 0) return;
      if (place(child)) {
        placedChildren.push(child);
        edges.push([item, child]);
      }
    });
    item._visibleChildren = placedChildren;
    item._hiddenChildren = (item.children || []).filter((child) => !placedChildren.includes(child));
    if (!placedChildren.length) {
      item.y = slot.y;
      slot.y += 72;
    } else {
      item.y = (placedChildren[0].y + placedChildren[placedChildren.length - 1].y) / 2;
    }
    visible.push(item);
    return true;
  }

  place(root);
  const width = Math.max(960, 120 + (maxDepth(root) + 1) * 230);
  const height = Math.max(560, slot.y + 80);
  return { visible, edges, width, height, focus };
}

function visibleChildren(item, focus) {
  if (!item.expanded) return [];
  if (!item.children.length) return [];
  const query = state.search;
  if (query) {
    return limitDoiChildren(
      item.children.filter((child) => subtreeMatches(child, query) || isAncestorOf(child, focus)),
      focus,
      DOI_SEARCH_LIMIT,
    );
  }
  const focusPath = new Set(pathToRoot(focus).map((nodeItem) => nodeItem.id));
  if (item.id === state.root.id || focusPath.has(item.id) || item.id === focus.id) {
    return limitDoiChildren(item.children, focus, DOI_CHILD_LIMIT);
  }
  const distance = graphDistance(item, focus);
  if (distance <= 1) return limitDoiChildren(item.children, focus, DOI_CHILD_LIMIT);
  return limitDoiChildren(
    item.children.filter((child) => child.descendantWeight >= state.settings.weightOne),
    focus,
    DOI_CHILD_LIMIT,
  );
}

function limitDoiChildren(children, focus, limit) {
  if (children.length <= limit) return children;
  return children
    .slice()
    .sort((a, b) => {
      const aKeepsFocus = isAncestorOf(a, focus) || a.id === focus.id ? 1 : 0;
      const bKeepsFocus = isAncestorOf(b, focus) || b.id === focus.id ? 1 : 0;
      if (aKeepsFocus !== bKeepsFocus) return bKeepsFocus - aKeepsFocus;
      return b.descendantWeight - a.descendantWeight;
    })
    .slice(0, limit);
}

function drawTree(layout) {
  const svg = els.treeSvg;
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
  svg.style.width = `${layout.width}px`;
  svg.style.height = `${layout.height}px`;

  const edgeLayer = svgEl("g", { class: "edges" });
  const cueLayer = svgEl("g", { class: "cues" });
  const nodeLayer = svgEl("g", { class: "nodes" });
  svg.append(edgeLayer, cueLayer, nodeLayer);

  layout.edges.forEach(([from, to]) => {
    edgeLayer.append(svgEl("path", {
      class: "edge",
      d: bezier(from.x + 152, from.y, to.x - 10, to.y),
    }));
  });

  layout.visible.forEach((item) => {
    drawNode(nodeLayer, item, layout.focus);
    if (item._hiddenChildren.length && state.settings.cueMode !== "none") {
      drawCue(cueLayer, item);
    }
  });
}

function drawNode(layer, item, focus) {
  const score = doiScore(item, focus);
  const width = 154;
  const labelLines = labelText(item.label).slice(0, 3);
  const height = Math.max(46, 30 + labelLines.length * 14);
  const match = state.search && item.label.toLowerCase().includes(state.search);
  const group = svgEl("g", {
    class: "node",
    transform: `translate(${item.x},${item.y - height / 2})`,
    tabindex: "0",
  });
  const card = svgEl("rect", {
    class: `node-card${item.id === focus.id ? " focused" : ""}${match ? " match" : ""}`,
    width,
    height,
    rx: 7,
    opacity: 0.72 + score * 0.28,
  });
  group.append(card);

  if (state.settings.drawTypes) {
    group.append(svgEl("circle", {
      class: "type-dot",
      cx: 14,
      cy: 17,
      r: 6,
      fill: typeColor(item.type),
    }));
  }

  labelLines.forEach((line, index) => {
    const text = svgEl("text", {
      class: "node-label",
      x: state.settings.drawTypes ? 26 : 12,
      y: 19 + index * 14,
      fill: state.settings.labelColor,
    });
    text.textContent = line;
    group.append(text);
  });

  const sub = svgEl("text", {
    class: "node-sub",
    x: 12,
    y: height - 9,
  });
  sub.textContent = `${item.descendantCount} items / ${Math.round(item.descendantWeight)} weight`;
  group.append(sub);

  group.addEventListener("click", () => {
    state.focusId = item.id;
    state.treeFocusId = item.id;
    setStatus(`Focused ${item.label}.`);
    render();
  });
  group.addEventListener("dblclick", (event) => {
    event.stopPropagation();
    item.expanded = !item.expanded;
    state.focusId = item.id;
    state.treeFocusId = item.id;
    setStatus(`${item.expanded ? "Expanded" : "Collapsed"} ${item.label}.`);
    render();
  });
  layer.append(group);
}

function drawCue(layer, item) {
  const x = item.x + 154 + state.settings.displayDistance;
  const y = item.y;
  layer.append(svgEl("path", {
    class: "cue-edge",
    d: `M ${item.x + 154} ${item.y} L ${x - 8} ${y}`,
  }));

  if (state.settings.cueMode === "simple") {
    const count = hiddenCount(item);
    const radius = cueRadius(item.descendantWeight);
    layer.append(svgEl("circle", { class: "cue-count", cx: x, cy: y, r: radius, fill: "#fef3c7" }));
    const text = svgEl("text", { x, y: y + 4, "text-anchor": "middle", "font-size": 11, fill: "#172033" });
    text.textContent = count;
    layer.append(text);
    return;
  }

  if (state.settings.cueMode === "treemap") {
    drawTreemapCue(layer, item, x, y);
    return;
  }

  drawTreeCue(layer, item, x, y);
}

function drawTreeCue(layer, item, x, y) {
  const limit = state.settings.treeCueLength;
  const hidden = flatten(item._hiddenChildren).slice(0, limit);
  const gap = 20;
  hidden.forEach((child, index) => {
    const cx = x + (index % limit) * 22;
    const cy = y + Math.floor(index / limit) * gap;
    layer.append(svgEl("circle", {
      class: "cue-node",
      cx,
      cy,
      r: Math.min(8, cueRadius(child.descendantWeight)),
      fill: typeColor(child.type, 0.24),
    }));
    if (index > 0) {
      layer.append(svgEl("path", {
        class: "cue-edge",
        d: `M ${x} ${y} L ${cx} ${cy}`,
      }));
    }
  });
  if (hidden.length < hiddenCount(item)) {
    const text = svgEl("text", { x: x + hidden.length * 22 + 4, y: y + 4, "font-size": 11, fill: "#475467" });
    text.textContent = `+${hiddenCount(item) - hidden.length}`;
    layer.append(text);
  }
}

function drawTreemapCue(layer, item, x, y) {
  const leaves = flatten(item._hiddenChildren).slice(0, 18);
  const total = leaves.reduce((sum, child) => sum + child.descendantWeight, 0) || 1;
  const maxHeight = state.settings.maxImageHeight;
  let cursor = 0;
  leaves.forEach((child) => {
    const area = Math.max(9, (child.descendantWeight / total) * 130 * maxHeight);
    const rectW = Math.max(12, Math.min(64, area / 24));
    const rectH = Math.max(10, Math.min(maxHeight, area / rectW));
    if (cursor + rectW > 132) cursor = 0;
    layer.append(svgEl("rect", {
      class: "treemap-rect",
      x: x + cursor,
      y: y - maxHeight / 2,
      width: rectW,
      height: rectH,
      fill: typeColor(child.type, 0.35),
    }));
    cursor += rectW;
  });
}

function parseDcProperties(text, name) {
  const props = defaultDcProperties();
  props.name = name;
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes("=")) return;
    const [key, value] = trimmed.split(/=(.*)/s).filter(Boolean);
    if (key === "labelcolor") props.labelColor = rgbString(parseRgb(value));
    if (key === "nodecolors") props.nodeColors = parseColorList(value);
    if (key === "boundarycolors") props.boundaryColors = parseColorList(value);
    if (key === "container") props.container = parseContainer(value);
  });
  return props;
}

function defaultDcProperties() {
  return {
    name: "Rectangle",
    labelColor: "rgb(255, 255, 255)",
    nodeColors: [
      "rgb(140, 81, 10)",
      "rgb(216, 179, 101)",
      "rgb(246, 232, 195)",
      "rgb(199, 234, 229)",
      "rgb(90, 180, 172)",
      "rgb(1, 102, 94)",
    ],
    boundaryColors: ["rgb(0, 0, 175)", "rgb(80, 80, 200)", "rgb(160, 160, 255)", "rgb(255, 255, 255)"],
    container: [
      { x: 10, y: 1100 },
      { x: 100, y: 500 },
      { x: 1200, y: 10 },
      { x: 1400, y: 300 },
      { x: 1300, y: 850 },
      { x: 1650, y: 1100 },
    ],
  };
}

function parseRgb(value) {
  const parts = String(value)
    .trim()
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part));
  return parts.slice(0, 3);
}

function rgbString(rgb) {
  const [r = 0, g = 0, b = 0] = rgb;
  return `rgb(${r}, ${g}, ${b})`;
}

function parseColorList(value) {
  const payload = String(value).includes("\t") ? String(value).split("\t").slice(1).join("\t") : value;
  const colors = payload
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => rgbString(parseRgb(entry)));
  return colors.length ? colors : defaultDcProperties().nodeColors;
}

function parseContainer(value) {
  const payload = String(value).includes("\t") ? String(value).split("\t").slice(1).join("\t") : value;
  const points = payload
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [x, y] = entry.split(",").map((part) => Number(part.trim()));
      return { x, y };
    })
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  return points.length >= 3 ? points : defaultDcProperties().container;
}

function scalePolygon(points, width, height, padding) {
  const bounds = polygonBounds(points);
  const scale = Math.min((width - padding * 2) / bounds.width, (height - padding * 2) / bounds.height);
  const offsetX = padding + (width - padding * 2 - bounds.width * scale) / 2;
  const offsetY = padding + (height - padding * 2 - bounds.height * scale) / 2;
  return points.map((point) => ({
    x: offsetX + (point.x - bounds.minX) * scale,
    y: offsetY + (point.y - bounds.minY) * scale,
  }));
}

function polygonBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function polygonToString(points) {
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

function buildTreemapCells(item, rect, depth, maxDepth, props) {
  const children = item.children.length ? item.children : [item];
  const visibleChildren = children
    .slice()
    .sort((a, b) => b.descendantWeight - a.descendantWeight)
    .slice(0, depth === 0 ? 80 : 40);
  const rects = binaryTreemap(visibleChildren, insetRect(rect, depth === 0 ? 2 : 3));
  const cells = [];

  rects.forEach(({ item: child, rect: childRect }, index) => {
    if (childRect.width < 1 || childRect.height < 1) return;
    cells.push({
      ...childRect,
      item: child,
      label: child.label,
      depth,
      color: colorForDcCell(child, depth, index, props),
      opacity: Math.max(0.55, 0.94 - depth * 0.08),
    });

    if (depth < maxDepth && child.children.length && childRect.width > 42 && childRect.height > 34) {
      cells.push(...buildTreemapCells(child, childRect, depth + 1, maxDepth, props));
    }
  });

  return cells;
}

function buildDcTreemapCells(item, rect, props) {
  const visibleChildren = (item.children.length ? item.children : [item])
    .slice()
    .sort((a, b) => b.descendantWeight - a.descendantWeight)
    .slice(0, 220);
  const rects = binaryTreemap(visibleChildren, insetRect(rect, 2));

  return rects
    .filter(({ rect: childRect }) => childRect.width >= 1 && childRect.height >= 1)
    .map(({ item: child, rect: childRect }, index) => ({
      ...childRect,
      item: child,
      label: child.label,
      depth: child.depth,
      color: colorForDcCell(child, child.depth, index, props),
      opacity: Math.max(0.58, 0.96 - Math.min(4, child.depth) * 0.06),
    }));
}

function buildClassicTreemapCells(item, rect, depth, maxDepth) {
  const children = item.children.length ? item.children : [item];
  const visibleChildren = children
    .slice()
    .sort((a, b) => b.descendantWeight - a.descendantWeight)
    .slice(0, depth === 0 ? 180 : 80);
  const rects = binaryTreemap(visibleChildren, insetRect(rect, depth === 0 ? 1 : 2));
  const cells = [];

  rects.forEach(({ item: child, rect: childRect }, index) => {
    if (childRect.width < 1 || childRect.height < 1) return;
    cells.push({
      ...childRect,
      item: child,
      label: child.label,
      depth,
      color: colorForClassicTreemapCell(child, depth, index),
      opacity: Math.max(0.58, 0.96 - depth * 0.07),
    });

    if (depth < maxDepth && child.children.length && childRect.width > 48 && childRect.height > 38) {
      cells.push(...buildClassicTreemapCells(child, childRect, depth + 1, maxDepth));
    }
  });

  return cells;
}

function buildPolygonTreemapCells(root, polygon, props) {
  const bounds = polygonBounds(polygon);
  const items = collectPolygonTreemapItems(root, 260);
  const rowCount = Math.max(12, Math.min(48, Math.ceil(Math.sqrt(items.length) * 2.4)));
  const rowHeight = bounds.height / rowCount;
  const slots = [];

  for (let row = 0; row < rowCount; row += 1) {
    const y = bounds.minY + row * rowHeight;
    const spans = polygonSpansAtY(polygon, y + rowHeight / 2);
    spans.forEach((span) => {
      const slot = {
        x: span.x1 + 2,
        y: y + 1,
        width: Math.max(0, span.x2 - span.x1 - 4),
        height: Math.max(0, rowHeight - 2),
      };
      if (slot.width > 3 && slot.height > 3) slots.push(slot);
    });
  }

  const totalArea = slots.reduce((sum, slot) => sum + slot.width * slot.height, 0);
  const totalWeight = items.reduce((sum, item) => sum + Math.max(1, item.descendantWeight), 0) || 1;
  const cells = [];
  let slotIndex = 0;
  let slotOffset = 0;

  items.forEach((item, index) => {
    let remainingArea = (Math.max(1, item.descendantWeight) / totalWeight) * totalArea;
    let firstPiece = true;

    while (remainingArea > 0.5 && slotIndex < slots.length) {
      const slot = slots[slotIndex];
      const availableWidth = slot.width - slotOffset;
      const pieceWidth = Math.min(availableWidth, remainingArea / slot.height);

      if (pieceWidth > 0.5) {
        cells.push({
          x: slot.x + slotOffset,
          y: slot.y,
          width: pieceWidth,
          height: slot.height,
          label: item.label,
          item,
          depth: item.depth,
          color: colorForDcCell(item, item.depth, index, props),
          opacity: Math.max(0.58, 0.95 - Math.min(4, item.depth) * 0.07),
          showLabel: firstPiece,
        });
        firstPiece = false;
      }

      remainingArea -= pieceWidth * slot.height;
      slotOffset += pieceWidth;

      if (slot.width - slotOffset <= 0.5) {
        slotIndex += 1;
        slotOffset = 0;
      }
    }
  });

  return cells;
}

function collectPolygonTreemapItems(root, maxItems) {
  const source = root.children.length ? root.children : [root];
  return source
    .slice()
    .sort((a, b) => b.descendantWeight - a.descendantWeight)
    .slice(0, maxItems);
}

function collectTreemapFrontier(root, maxDepth, maxItems) {
  const items = [];

  function visit(item, depth) {
    if (!item.children.length || depth >= maxDepth) {
      if (item !== root) items.push(item);
      return;
    }
    item.children.forEach((child) => visit(child, depth + 1));
  }

  visit(root, 0);
  return items
    .sort((a, b) => b.descendantWeight - a.descendantWeight)
    .slice(0, maxItems);
}

function polygonSpansAtY(polygon, y) {
  const intersections = [];

  for (let index = 0; index < polygon.length; index += 1) {
    const a = polygon[index];
    const b = polygon[(index + 1) % polygon.length];
    if (a.y === b.y) continue;
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);
    if (y < minY || y >= maxY) continue;
    const t = (y - a.y) / (b.y - a.y);
    intersections.push(a.x + t * (b.x - a.x));
  }

  intersections.sort((a, b) => a - b);
  const spans = [];
  for (let index = 0; index + 1 < intersections.length; index += 2) {
    if (intersections[index + 1] - intersections[index] > 2) {
      spans.push({ x1: intersections[index], x2: intersections[index + 1] });
    }
  }
  return spans;
}

function isAxisAlignedRectangle(polygon) {
  if (polygon.length !== 4) return false;
  const xs = [...new Set(polygon.map((point) => point.x.toFixed(1)))];
  const ys = [...new Set(polygon.map((point) => point.y.toFixed(1)))];
  return xs.length === 2 && ys.length === 2;
}

function binaryTreemap(items, rect) {
  if (!items.length) return [];
  if (items.length === 1) return [{ item: items[0], rect: insetRect(rect, 1.5) }];

  const total = items.reduce((sum, item) => sum + Math.max(1, item.descendantWeight), 0) || 1;
  const splitIndex = balancedSplitIndex(items, total);
  const leftItems = items.slice(0, splitIndex);
  const rightItems = items.slice(splitIndex);
  const leftWeight = leftItems.reduce((sum, item) => sum + Math.max(1, item.descendantWeight), 0);
  const ratio = Math.max(0.05, Math.min(0.95, leftWeight / total));

  if (rect.width >= rect.height) {
    const leftRect = { x: rect.x, y: rect.y, width: rect.width * ratio, height: rect.height };
    const rightRect = {
      x: rect.x + leftRect.width,
      y: rect.y,
      width: rect.width - leftRect.width,
      height: rect.height,
    };
    return [...binaryTreemap(leftItems, leftRect), ...binaryTreemap(rightItems, rightRect)];
  }

  const topRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height * ratio };
  const bottomRect = {
    x: rect.x,
    y: rect.y + topRect.height,
    width: rect.width,
    height: rect.height - topRect.height,
  };
  return [...binaryTreemap(leftItems, topRect), ...binaryTreemap(rightItems, bottomRect)];
}

function balancedSplitIndex(items, total) {
  let sum = 0;
  let bestIndex = 1;
  let bestDelta = Infinity;

  for (let index = 1; index < items.length; index += 1) {
    sum += Math.max(1, items[index - 1].descendantWeight);
    const delta = Math.abs(total / 2 - sum);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function insetRect(rect, inset) {
  return {
    x: rect.x + inset,
    y: rect.y + inset,
    width: Math.max(0, rect.width - inset * 2),
    height: Math.max(0, rect.height - inset * 2),
  };
}

function colorForDcCell(item, depth, index, props) {
  const palette = props.nodeColors.length ? props.nodeColors : props.boundaryColors;
  return palette[(Math.abs(item.type) + depth + index) % palette.length];
}

function colorForClassicTreemapCell(item, depth, index) {
  const palette = [
    "rgb(80, 143, 168)",
    "rgb(218, 166, 84)",
    "rgb(117, 174, 132)",
    "rgb(198, 103, 118)",
    "rgb(126, 116, 183)",
    "rgb(105, 151, 196)",
    "rgb(194, 148, 102)",
  ];
  return palette[(Math.abs(item.type) + depth + index) % palette.length];
}

function truncateLabel(label, maxChars) {
  const text = String(label || "");
  if (text.length <= maxChars) return text;
  if (maxChars <= 3) return text.slice(0, Math.max(1, maxChars));
  return `${text.slice(0, maxChars - 3)}...`;
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(svgNS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) el.setAttribute(key, value);
  });
  return el;
}

function bezier(x1, y1, x2, y2) {
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

function labelText(label) {
  const text = String(label || "Untitled");
  if (!state.settings.breakLabels || text.length <= state.settings.labelLength) return [text];
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    if ((line + " " + word).trim().length > state.settings.labelLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [text.slice(0, state.settings.labelLength)];
}

function doiScore(item, focus) {
  const distance = graphDistance(item, focus);
  const weightBoost = Math.min(1, item.descendantWeight / Math.max(1, state.settings.weightTwo));
  return Math.max(0.1, Math.min(1, 1 / (1 + distance * 0.8) + weightBoost * 0.22));
}

function graphDistance(a, b) {
  const aPath = pathToRoot(a);
  const bPath = pathToRoot(b);
  const aIndex = new Map(aPath.map((item, index) => [item.id, index]));
  for (let i = 0; i < bPath.length; i += 1) {
    if (aIndex.has(bPath[i].id)) return i + aIndex.get(bPath[i].id);
  }
  return a.depth + b.depth;
}

function pathToRoot(item) {
  const path = [];
  let current = item;
  while (current) {
    path.push(current);
    current = current.parent;
  }
  return path;
}

function findById(root, id) {
  let found = null;
  walk(root, (item) => {
    if (item.id === id) found = item;
  });
  return found;
}

function findFirstLabelMatch(root, query) {
  let found = null;
  walk(root, (item) => {
    if (!found && item.label.toLowerCase().includes(query)) found = item;
  });
  return found;
}

function maxDepth(root) {
  let depth = 0;
  walk(root, (item) => {
    depth = Math.max(depth, item.depth);
  });
  return depth;
}

function subtreeMatches(item, query) {
  if (item.label.toLowerCase().includes(query)) return true;
  return item.children.some((child) => subtreeMatches(child, query));
}

function itemMatchesSearch(item) {
  return Boolean(state.search && subtreeMatches(item, state.search));
}

function isAncestorOf(candidate, item) {
  let current = item;
  while (current) {
    if (current.id === candidate.id) return true;
    current = current.parent;
  }
  return false;
}

function flatten(nodes) {
  const output = [];
  nodes.forEach((item) => {
    output.push(item);
    output.push(...flatten(item.children || []));
  });
  return output;
}

function hiddenCount(item) {
  return flatten(item._hiddenChildren || []).length;
}

function cueRadius(weight) {
  const { minRatio, maxRatio, weightOne, weightTwo } = state.settings;
  const t = Math.max(0, Math.min(1, (weight - weightOne) / Math.max(1, weightTwo - weightOne)));
  return 5 + (minRatio + (maxRatio - minRatio) * t) * 4;
}

function typeColor(type, alpha = 1) {
  const colors = [
    [37, 99, 235],
    [15, 118, 110],
    [183, 121, 31],
    [184, 50, 95],
    [101, 84, 192],
    [71, 85, 105],
    [8, 145, 178],
  ];
  const rgb = colors[Math.abs(Number(type || 0)) % colors.length];
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function updateMeta(layout) {
  const total = state.root.descendantCount;
  const visible = layout.visibleCount ?? layout.visible.length;
  els.treeMeta.textContent = `${visible} visible / ${total} total`;
}

function setStatus(message) {
  els.statusbar.textContent = message;
}

function exportTreeML(root) {
  const lines = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<tree>",
    "  <declarations>",
    "    <attributeDecl name=\"name\" type=\"String\"/>",
    "    <attributeDecl name=\"weight\" type=\"Real\"/>",
    "    <attributeDecl name=\"type\" type=\"Int\"/>",
    "    <attributeDecl name=\"link\" type=\"String\"/>",
    "  </declarations>",
    serializeNode(root, 1),
    "</tree>",
  ];
  return lines.join("\n");
}

function serializeNode(item, depth) {
  const tag = item.children.length ? "branch" : "leaf";
  const pad = "  ".repeat(depth);
  const lines = [`${pad}<${tag}>`];
  lines.push(`${pad}  <attribute name="name" value="${escapeXml(item.label)}"/>`);
  lines.push(`${pad}  <attribute name="weight" value="${escapeXml(item.weight)}"/>`);
  lines.push(`${pad}  <attribute name="type" value="${escapeXml(item.type)}"/>`);
  if (item.link) lines.push(`${pad}  <attribute name="link" value="${escapeXml(item.link)}"/>`);
  item.children.forEach((child) => lines.push(serializeNode(child, depth + 1)));
  lines.push(`${pad}</${tag}>`);
  return lines.join("\n");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadText(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
