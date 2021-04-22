let map = undefined;
let netherLayerGroup = undefined;
let overworldLayerGroup = undefined;
let dimension = "nether";

function getMapIcons() {
  let addVertexForm = document.getElementById("addVertexForm");
  let editVertexForm = document.getElementById("editVertexForm");
  let addVertexIconSelect = document.getElementById("newpoiicon");
  let editVertexIconSelect = document.getElementById("editpoiicon");
  fetch("/api/mapicons/list")
    .then(r => r.json())
    .then(json => {
      let addDefaultOption = document.createElement("option");
      let editDefaultOption = document.createElement("option");
      addDefaultOption.value = "";
      addDefaultOption.innerText = "default";
      editDefaultOption.value = "";
      editDefaultOption.innerText = "default";
      addVertexIconSelect.appendChild(addDefaultOption);
      editVertexIconSelect.appendChild(editDefaultOption);
      for (let icon of json) {
        let ao = document.createElement("option");
        let eo = document.createElement("option");
        ao.innerText = icon;
        ao.value = icon;
        eo.innerText = icon;
        eo.value = icon;
        addVertexIconSelect.appendChild(ao);
        editVertexIconSelect.appendChild(eo);
      }
    })
}

function generateVertexPopup(vertex) {
  let popupContainer = document.createElement("div");
  let popupHeader = document.createElement("h4");
  let netherCoords = document.createElement("p");
  let overworldCoords = document.createElement("p");
  let description = document.createElement("p");
  let footer = document.createElement("div");
  let editId = document.createElement("input");
  let editButton = document.createElement("button");
  let editIcon = document.createElement("i");
  
  let villagersButton = document.createElement("a");
  let villagersIcon = document.createElement("i");
  
  let deleteForm = document.createElement("form");
  let deleteId = document.createElement("input");
  let deleteButton = document.createElement("button");
  let deleteIcon = document.createElement("i");
  
  popupHeader.innerText = vertex.name;
  netherCoords.innerText = `Nether coordinates: ${vertex.netherCoords}`;
  overworldCoords.innerText = `Overworld coordinates: ${vertex.overworldCoords}`;
  description.innerText = vertex.description;
  footer.className = "spaceItems";
  editButton.dataset.toggle = "modal";
  editButton.dataset.target = "#editVertexModal";
  editButton.addEventListener("click", () => populateEditVertexForm(vertex));
  
  editButton.className = "btn btn-success";
  editIcon.className = "fa fa-edit";
  villagersButton.href = `/trades?id=${vertex.id}`;
  villagersButton.className = "btn btn-info";
  villagersButton.style.color = "white";
  villagersIcon.className = "fa fa-usd";
  deleteForm.action = "/api/vertices/delete";
  deleteForm.method = "POST";
  deleteId.value = vertex.id;
  deleteId.name = "id";
  deleteId.type = "hidden";
  deleteButton.type = "submit";
  deleteButton.className = "btn btn-danger";
  deleteIcon.className = "fa fa-trash";
  
  popupContainer.appendChild(popupHeader);
  popupContainer.appendChild(netherCoords);
  popupContainer.appendChild(overworldCoords);
  popupContainer.appendChild(description);
  popupContainer.appendChild(footer);
  footer.appendChild(editButton);
  footer.appendChild(villagersButton);
  villagersButton.appendChild(villagersIcon);
  editButton.appendChild(editIcon);
  footer.appendChild(deleteForm);
  deleteForm.appendChild(deleteId);
  deleteForm.appendChild(deleteButton);
  deleteButton.appendChild(deleteIcon);
  
  return popupContainer;
}

function generatePathPopup(path) {
  let popupContainer = document.createElement("div");
  let startCoords = document.createElement("p");
  let endCoords = document.createElement("p");
  let footer = document.createElement("div");
  let editButton = document.createElement("button");
  let editIcon = document.createElement("i");
  let deleteForm = document.createElement("form");
  let deleteId = document.createElement("input");
  let deleteButton = document.createElement("button");
  let deleteIcon = document.createElement("i");
  
  startCoords.innerText = `Starting coordinates: ${path.start}`;
  endCoords.innerText = `Ending coordinates: ${path.end}`;
  footer.className = "spaceItems";
  editButton.className = "btn btn-success";
  editButton.dataset.toggle = "modal";
  editButton.dataset.target = "#editPathModal";
  editButton.addEventListener("click", () => populateEditPathForm(path));
  editIcon.className = "fa fa-edit";
  deleteForm.action = "/api/paths/delete";
  deleteForm.method = "POST";
  deleteId.value = path.id;
  deleteId.name = "id";
  deleteId.type = "hidden";
  deleteButton.type = "submit";
  deleteButton.className = "btn btn-danger";
  deleteIcon.className = "fa fa-trash";
  
  popupContainer.appendChild(startCoords);
  popupContainer.appendChild(endCoords);
  popupContainer.appendChild(footer);
  footer.appendChild(editButton);
  editButton.appendChild(editIcon);
  footer.appendChild(deleteForm);
  deleteForm.appendChild(deleteId);
  deleteForm.appendChild(deleteButton);
  deleteButton.appendChild(deleteIcon);
  
  return popupContainer;
}

function populateEditVertexForm(vertex) {
  let editVertexForm = document.getElementById("editVertexForm");
  let vertexNameTitle = document.getElementById("editVertName");
  if (vertex.icon === null) {
    vertex.icon = "";
  }
  editVertexForm.icon.value = vertex.icon;
  vertexNameTitle.innerText = vertex.name;
  editVertexForm.name.value = vertex.name;
  editVertexForm.id.value = vertex.id;
  editVertexForm.netherx.value = vertex.netherCoords[0];
  editVertexForm.netherz.value = vertex.netherCoords[1];
  editVertexForm.overx.value = vertex.overworldCoords[0];
  editVertexForm.overz.value = vertex.overworldCoords[1];
  editVertexForm.description.value = vertex.description;
}

function populateEditPathForm(path) {
  let editPathForm = document.getElementById("editPathForm");
  editPathForm.id.value = path.id;
  editPathForm.firstx.value = path.start[0];
  editPathForm.firstz.value = path.start[1];
  editPathForm.secondx.value = path.end[0];
  editPathForm.secondz.value = path.end[1];
}

function resetLayerGroups() {
  if (netherLayerGroup) {
    netherLayerGroup.off();
  }
  if (overworldLayerGroup) {
    overworldLayerGroup.off();
  }
  netherLayerGroup = new L.LayerGroup();
  overworldLayerGroup = new L.LayerGroup();
}

function renderVertexData(map, vertexJson, dimension) {
  for (let vertex of vertexJson.vertices) {
    let netherCoords = L.latLng({lng: vertex.netherCoords[0], lat: vertex.netherCoords[1]});
    let overworldCoords = L.latLng({lng: vertex.overworldCoords[0], lat: vertex.overworldCoords[1]});
    let netherMarker = L.marker(netherCoords, {title: vertex.name});
    let overworldMarker = L.marker(overworldCoords, {title: vertex.name});
    if (vertex.icon) {
      let icon = L.icon({
        iconUrl: `/static/img/mapicons/${vertex.icon}`,
        iconSize: [32, 32],
        iconAnchor: [15, 31],
        popupAnchor: [0, -31]
      });
      netherMarker = L.marker(netherCoords, {title: vertex.name, icon: icon});
      overworldMarker = L.marker(overworldCoords, {title: vertex.name, icon: icon});
    }
    netherMarker.bindPopup(generateVertexPopup(vertex));
    overworldMarker.bindPopup(generateVertexPopup(vertex));
    netherLayerGroup.addLayer(netherMarker);
    overworldLayerGroup.addLayer(overworldMarker);
  }
}

function renderPathData(map, pathJson, dimension) {
  for (let path of pathJson.paths) {
    let start = L.latLng({lng: path.start[0], lat: path.start[1]});
    let end = L.latLng({lng: path.end[0], lat: path.end[1]});
    let pathSeg = L.polyline([start, end]);
    pathSeg.bindPopup(generatePathPopup(path));
    netherLayerGroup.addLayer(pathSeg);
  }
}

function toggleDimension() {
  let toggleDimensionButton = document.getElementById("toggleDimension");
  let zoom = map.getZoom();
  let center = map.getCenter();
  if (dimension === "nether") {
    dimension = "overworld";
    toggleDimensionButton.innerText = "Show Nether Locations";
    toggleDimensionButton.className = "btn btn-danger";
    zoom = zoom - 3;
    center.lat = center.lat * 8;
    center.lng = center.lng * 8;
    netherLayerGroup.removeFrom(map);
    overworldLayerGroup.addTo(map);
  } else {
    dimension = "nether";
    toggleDimensionButton.innerText = "Show Overworld Locations";
    toggleDimensionButton.className = "btn btn-success";
    zoom = zoom + 3
    center.lat = center.lat / 8;
    center.lng = center.lng / 8;
    overworldLayerGroup.removeFrom(map);
    netherLayerGroup.addTo(map);
  }
  map.setView(center, zoom);
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem("dimension", dimension);
  }
}

function setupMap() {
	let mapSources = document.getElementById("mapSources").dataset;
        let mapZooms = document.getElementById("mapZooms").dataset;
	let netherMapSource = mapSources.netherMapSource;
	let overworldMapSource = mapSources.overworldMapSource;
        let minZoom = mapZooms.minZoom;
        let maxZoom = mapZooms.maxZoom;
	
  if (map) {
    map.off();
    map.remove();
  }
  
  let theCrs = L.CRS.Simple;
  
  theCrs.transformation = new L.Transformation(1, 0, 1, 0);
  
  let center = {lat: 0, lng: 0};
  let zoom = 0;

  if (typeof(Storage) !== "undefined") {
    let storedCenter = localStorage.getItem("center");
    let storedZoom = localStorage.getItem("zoom");
    let storedDimension = localStorage.getItem("dimension");

    if (storedCenter) {
      try {
        center = JSON.parse(storedCenter);
      } catch (e) {
        console.error("Invalid center in local storage, reverting to default");
        localStorage.removeItem("center");
      }
    }
    if (storedZoom) {
      try {
        zoom = parseInt(storedZoom);
      } catch (e) {
        console.error("Invalid zoom in local storage, reverting to default");
        localStorage.removeItem("zoom");
      }
    }
    if (storedDimension) {
      dimension = storedDimension;
      let toggleDimensionButton = document.getElementById("toggleDimension");
      if (dimension === "nether") {
        toggleDimensionButton.innerText = "Show Overworld Locations";
        toggleDimensionButton.className = "btn btn-success";
      } else {
        toggleDimensionButton.innerText = "Show Nether Locations";
        toggleDimensionButton.className = "btn btn-danger";
      }
    }
  }
  let mapOptions = {
      center: center,
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      crs: theCrs
  };

  map = L.map('map', mapOptions);
  
  if (typeof(Storage) !== "undefined") {
    map.on("moveend", () => localStorage.setItem("center", JSON.stringify(map.getCenter())));
    map.on("zoomend", () => localStorage.setItem("zoom", map.getZoom()));
  }
  

  let graticuleOptions = {
      interval: 20,
      showOriginLabel: true,
      redraw: 'move',
      zoomIntervals: [
      {start: -4, end: -4, interval: 2048},
      {start: -3, end: -3, interval: 1024},
      {start: -2, end: -2, interval: 512},
      {start: -1, end: -1, interval: 256},
      {start: 0, end: 0, interval: 128},
  ]};

  L.simpleGraticule(graticuleOptions).addTo(map);
  
  resetLayerGroups();
  overworldLayerGroup.addLayer(L.tileLayer(overworldMapSource, {"minZoom": minZoom, "maxZoom": maxZoom}));
  netherLayerGroup.addLayer(L.tileLayer(netherMapSource, {"minZoom": minZoom, "maxZoom": maxZoom}));


  fetch("/api/vertices/list")
      .then(res => res.json())
      .then(json => {
        renderVertexData(map, json);
      });
  
  fetch("/api/paths/list")
      .then(res => res.json())
      .then(json => {
        renderPathData(map, json);
      });

  if (dimension === "nether") {
    netherLayerGroup.addTo(map);
  } else {
    overworldLayerGroup.addTo(map);
  }
  
  map.on("click", function(ev) {
    openModalWithCoordinates(ev.latlng.lng, ev.latlng.lat);
  });
  
  getMapIcons();
}

function openModalWithCoordinates(x, z) {
  $("#vertexModal").modal();
  if (dimension === "nether") {
    $("#poiNetherX").val(x);
    $("#poiNetherZ").val(z);
    $("#poiOverworldX").val(x * 8);
    $("#poiOverworldZ").val(z * 8);
  } else {
    $("#poiNetherX").val(Math.floor(x / 8));
    $("#poiNetherZ").val(Math.floor(z / 8));
    $("#poiOverworldX").val(x);
    $("#poiOverworldZ").val(z);
  }
}