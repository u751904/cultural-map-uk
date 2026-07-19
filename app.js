// ====================
// MAP SETUP
// ====================
 
var isMobile = window.innerWidth <= 768;
 
// On mobile, Leaflet's default top-left zoom control sits directly behind
// the new search bar / pill row, so it's moved to bottom-left instead -
// the only consistently free corner above the footer.
var map = L.map('map', { zoomControl: false }).setView([54.0, -2.5], 6);
L.control.zoom({ position: isMobile ? 'bottomleft' : 'topleft' }).addTo(map);
 
var allMarkers = [];
 
var desktopDetails = document.getElementById("detailsContent");
var mobileDetails  = document.getElementById("mobileDetailsContent");
 
// ====================
// MARKER ICONS
// ====================
 
function makeTearDrop(colour) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">' +
        '<path d="M12.5 0 C5.6 0 0 5.6 0 12.5 C0 22 12.5 41 12.5 41 C12.5 41 25 22 25 12.5 C25 5.6 19.4 0 12.5 0 Z"' +
        ' fill="' + colour + '" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>' +
        '<circle cx="12.5" cy="12.5" r="5" fill="rgba(255,255,255,0.4)"/>' +
        '</svg>';
    return L.divIcon({ html: svg, className: '', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
}
 
function makeTearDropSelected(colour) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="52" viewBox="0 0 25 41">' +
        '<path d="M12.5 0 C5.6 0 0 5.6 0 12.5 C0 22 12.5 41 12.5 41 C12.5 41 25 22 25 12.5 C25 5.6 19.4 0 12.5 0 Z"' +
        ' fill="' + colour + '" stroke="white" stroke-width="2"/>' +
        '<circle cx="12.5" cy="12.5" r="5" fill="rgba(255,255,255,0.6)"/>' +
        '</svg>';
    return L.divIcon({ html: svg, className: '', iconSize: [32, 52], iconAnchor: [16, 52], popupAnchor: [1, -52] });
}
 
var blueMarkerIcon     = makeTearDrop("#1a4a8a");
var redMarkerIcon      = makeTearDrop("#8a2020");
var violetMarkerIcon   = makeTearDrop("#5a2880");
var tealMarkerIcon     = makeTearDrop("#1a6a7a");
var blueSelectedIcon   = makeTearDropSelected("#1a4a8a");
var redSelectedIcon    = makeTearDropSelected("#8a2020");
var violetSelectedIcon = makeTearDropSelected("#5a2880");
var tealSelectedIcon   = makeTearDropSelected("#1a6a7a");
 
function makeTreeIcon() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="38" viewBox="0 0 36 38">' +
        '<polygon points="16,38 20,38 21,28 22,24 18,21 14,24 15,28" fill="#3d2008"/>' +
        '<line x1="16" y1="26" x2="12" y2="22" stroke="#3d2008" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="20" y1="26" x2="24" y2="22" stroke="#3d2008" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="11" cy="21" r="11" fill="#6aaa34"/>' +
        '<circle cx="25" cy="21" r="11" fill="#3a7a20"/>' +
        '<circle cx="18" cy="11" r="12" fill="#4e9428"/>' +
        '</svg>';
    return L.divIcon({ html: svg, className: '', iconSize: [36, 38], iconAnchor: [18, 38], popupAnchor: [0, -38] });
}
 
var treeMarkerIcon = makeTreeIcon();
 
function getMarkerIcon(category) {
    if (category === "Military") return redMarkerIcon;
    if (category === "Horrible History") return violetMarkerIcon;
    if (category === "Maritime") return tealMarkerIcon;
    if (category === "Ancient Landscape") return treeMarkerIcon;
    return blueMarkerIcon;
}
 
function getSelectedMarkerIcon(category) {
    if (category === "Military") return redSelectedIcon;
    if (category === "Horrible History") return violetSelectedIcon;
    if (category === "Maritime") return tealSelectedIcon;
    return blueSelectedIcon;
}
 
// ====================
// MARKER CLUSTER
// ====================
 
var markerClicked = false;
var selectedMarker = null;
 
var markerCluster = L.markerClusterGroup({
    maxClusterRadius: 50,
    disableClusteringAtZoom: 16,
    iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        var children = cluster.getAllChildMarkers();
        var categories = {};
        children.forEach(function(m) { if (m.category) categories[m.category] = true; });
        var uniqueCats = Object.keys(categories);
 
        var colourClass = "cluster-circle"; // default: navy, used when mixed or unknown
        if (uniqueCats.length === 1) {
            var catColourClass = {
                "Literary": "cluster-circle-blue",
                "Horrible History": "cluster-circle-purple",
                "Military": "cluster-circle-red",
                "Maritime": "cluster-circle-teal",
                "Ancient Landscape": "cluster-circle-green"
            };
            colourClass = catColourClass[uniqueCats[0]] || "cluster-circle";
        }
 
        return L.divIcon({ html: '<div class="' + colourClass + '">' + count + '</div>', className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
    }
});
 
// ====================
// WRECK ICON
// ====================
 
function makeWreckIcon(size) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 40 40">' +
        '<line x1="6" y1="6" x2="34" y2="34" stroke="#e07b39" stroke-width="8" stroke-linecap="round"/>' +
        '<line x1="34" y1="6" x2="6" y2="34" stroke="#e07b39" stroke-width="8" stroke-linecap="round"/>' +
        '</svg>';
    return L.divIcon({ html: svg, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}
 
var shipMarkerIcon = makeWreckIcon(isMobile ? 18 : 22);
 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
 
// ====================
// HELPERS
// ====================
 
function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
 
function makeLiteratureList(text) {
    if (!text) return "<p>No literature added yet.</p>";
    var items = text.split(/\n+/).map(function(i) { return i.trim(); }).filter(function(i) { return i.length > 0; });
    return "<ul class='literature-list'>" + items.map(function(i) { return "<li>" + escapeHtml(i) + "</li>"; }).join("") + "</ul>";
}
 
function formatParagraph(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
}
 
// ====================
// CATEGORY CONFIG
// ====================
 
var categoryConfig = {
    "Literary": {
        label: "Literary Location",
        section1Icon: "\uD83D\uDCD6", section1Title: "Literature",
        section2Icon: "\uD83C\uDFAD", section2Title: "Cultural Importance",
        section3Icon: "\uD83D\uDCCD", section3Title: "Place Highlights",
        partnerClass: "literary", partnerIcon: "\uD83D\uDCDA", partnerIconClass: "literary",
        partnerName: "The Local Bookshop", partnerTagline: "Independent books &amp; local titles",
        partnerBody: "Rare, secondhand and local-interest titles. A destination for readers exploring the region's literary heritage.",
        partnerCta: "Visit website", partnerCtaClass: "literary"
    },
    "Horrible History": {
        label: "Horrible History",
        section1Icon: "\uD83D\uDC80", section1Title: "The Dark Story",
        section2Icon: "\uD83C\uDF0D", section2Title: "Historical Context",
        section3Icon: "\uD83D\uDCDA", section3Title: "Further Reading",
        partnerClass: "horrible", partnerIcon: "\u2615", partnerIconClass: "horrible",
        partnerName: "The Curious Cafe", partnerTagline: "Dark history tours &amp; speciality coffee",
        partnerBody: "Fuel your curiosity. Dark history walking tours depart daily, or settle in for a good cup and a grim story.",
        partnerCta: "Book a tour", partnerCtaClass: "horrible"
    },
    "Military": {
        label: "Military Location",
        section1Icon: "\u2694\uFE0F", section1Title: "Military History",
        section2Icon: "\uD83C\uDFF0", section2Title: "Historical Significance",
        section3Icon: "\uD83D\uDCCD", section3Title: "Place Highlights",
        partnerClass: "military", partnerIcon: "\uD83C\uDFE8", partnerIconClass: "military",
        partnerName: "The Garrison Hotel", partnerTagline: "Historic stays near the site",
        partnerBody: "Stay close to history. Comfortable rooms with easy access to the region's military and maritime heritage sites.",
        partnerCta: "Check availability", partnerCtaClass: "military"
    },
    "Maritime": {
        label: "Maritime Location",
        section1Icon: "\u2693", section1Title: "The Story",
        section2Icon: "\uD83D\uDEA2", section2Title: "Maritime Significance",
        section3Icon: "\uD83D\uDCCD", section3Title: "Place Highlights",
        partnerClass: "maritime", partnerIcon: "\u26F5", partnerIconClass: "maritime",
        partnerName: "The Harbour Inn", partnerTagline: "Seafront rooms & local ales",
        partnerBody: "Stay on the water's edge. The perfect base for exploring the region's rich maritime and coastal heritage.",
        partnerCta: "Check availability", partnerCtaClass: "maritime"
    },
    "Ancient Landscape": {
        label: "Ancient Landscape",
        section1Icon: "\uD83C\uDF33", section1Title: "The Story",
        section2Icon: "\uD83C\uDF0D", section2Title: "Historical Significance",
        section3Icon: "\uD83D\uDCCD", section3Title: "About this Site",
        partnerClass: "ancient", partnerIcon: "\uD83C\uDF33", partnerIconClass: "ancient",
        partnerName: "The Forest Inn", partnerTagline: "Walks, wildlife & warm welcome",
        partnerBody: "The perfect base for exploring the ancient landscapes, veteran trees and lost settlements of the region.",
        partnerCta: "Find out more", partnerCtaClass: "ancient"
    }
};
 
function getCategoryConfig(category) {
    return categoryConfig[category] || categoryConfig["Literary"];
}
 
// ====================
// SHOW DETAILS
// ====================
 
function showDetails(row, marker) {
    var title = row.Location_name || "Cultural location";
    var lat = row.Latitude;
    var lng = row.Longitude;
    var category = row.Category ? row.Category.trim() : "Literary";
    var cfg = getCategoryConfig(category);
 
    if (selectedMarker && selectedMarker !== marker) {
        selectedMarker.setIcon(getMarkerIcon(selectedMarker.category || "Literary"));
    }
    selectedMarker = marker;
    marker.setIcon(getSelectedMarkerIcon(category));
 
    var googleMaps = row.Google_Maps_Link
        ? "<a class='button' href='" + escapeHtml(row.Google_Maps_Link) + "' target='_blank'>Google Maps</a>" : "";
    var appleMaps = lat && lng
        ? "<a class='button' href='https://maps.apple.com/?q=" + encodeURIComponent(title) + "&ll=" + lat + "," + lng + "' target='_blank'>Apple Maps</a>" : "";
    var officialWebsite = row.Official_Website
        ? "<a class='button secondary-button' href='" + escapeHtml(row.Official_Website) + "' target='_blank'>Official website</a>" : "";
 
    var html =
        "<div class='place-card'>" +
        "<div class='place-card-category'>" + escapeHtml(cfg.label) + "</div>" +
        "<h1>" + escapeHtml(title) + "</h1>" +
        "<button class='return-map' onclick='resetMapView()'>&#8592; Back to map</button>" +
        "<hr class='section-divider'>" +
        "<h2>" + cfg.section1Icon + " " + cfg.section1Title + "</h2>" +
        makeLiteratureList(row.Literature) +
        "<hr class='section-divider'>" +
        "<h2>" + cfg.section2Icon + " " + cfg.section2Title + "</h2>" +
        "<p>" + formatParagraph(row.Cultural_Significance) + "</p>" +
        "<hr class='section-divider'>" +
        "<h2>" + cfg.section3Icon + " " + cfg.section3Title + "</h2>" +
        "<p>" + formatParagraph(row.Distinctive_Feature) + "</p>" +
        "<div class='info-panel'>" +
        "<div class='panel-title'>&#x1F50E; Plan Your Visit</div>" +
        "<div class='action-row'>" + googleMaps + appleMaps + officialWebsite + "</div>" +
        "</div>" +
        "<div class='partner-panel " + cfg.partnerClass + "'>" +
        "<span class='partner-example-tag'>Example partner ad</span>" +
        "<div class='partner-head'>" +
        "<div class='partner-icon " + cfg.partnerIconClass + "'>" + cfg.partnerIcon + "</div>" +
        "<div><div class='partner-name'>" + cfg.partnerName + "</div>" +
        "<div class='partner-tagline'>" + cfg.partnerTagline + "</div></div>" +
        "</div>" +
        "<div class='partner-body'>" + cfg.partnerBody + "</div>" +
        "<a class='partner-cta " + cfg.partnerCtaClass + "' href='#'>" + cfg.partnerCta + "</a>" +
        "<div class='advertise-bar'>Could this be your business? <a href='#'>Advertise here</a></div>" +
        "</div>" +
        "<div class='project-footer'>" +
        "<a href='mailto:hello@mapbritannia.com?subject=Error report: " + escapeHtml(title) +
        "&body=I found an issue with this entry: " + escapeHtml(title) + "%0A%0APlease describe the error:' target='_blank'>Report an error ✉</a>" +
        (row.Source ? "<br><small class='source-credit'>Source: " + escapeHtml(row.Source) + "</small>" : "") +
        "</div></div>";
 
    markerClicked = true;
 
    if (isMobile) {
        document.getElementById("layout").classList.remove("filter-active");
        document.getElementById("layout").classList.remove("map-expanded");
        mobileDetails.innerHTML = html;
        openPanel();
    } else {
        desktopDetails.innerHTML = html;
        openDesktopPanel();
    }
}
 
// ====================
// EMPTY STATE (replaces old signpost graphic)
// ====================
 
function getEmptyStateHTML() {
    return '<div class="empty-state">' +
        '<p class="empty-state-text">Use search to find a place, or Explore to choose categories</p>' +
        '</div>';
}
 
// ====================
// CSV DATA
// ====================
 
var csvFiles = [
    { file: "literarydevon.csv",   defaultCategory: "Literary" },
    { file: "horriblehistory.csv", defaultCategory: "Horrible History" },
    { file: "militarydevon.csv",   defaultCategory: "Military" },
    { file: "historicengland.csv", defaultCategory: "Military" },
    { file: "plague_uk_final.csv", defaultCategory: "Horrible History" },
    { file: "ancient_trees.csv",   defaultCategory: "Ancient Landscape" }
];
 
function loadCsv(fileObj) {
    Papa.parse(fileObj.file, {
        download: true, header: true, skipEmptyLines: true,
        error: function() { console.warn("Could not load: " + fileObj.file); },
        complete: function(results) {
            results.data.forEach(function(row) {
                var lat = parseFloat(row.Latitude);
                var lng = parseFloat(row.Longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    var category = row.Category ? row.Category.trim() : fileObj.defaultCategory;
                    var marker = L.marker([lat, lng], { icon: getMarkerIcon(category) })
                        .bindPopup(escapeHtml(row.Location_name || "Cultural location"))
                        .on("click", function() { showDetails(row, marker); });
                    marker.category = category;
                    allMarkers.push(marker);
                }
            });
        }
    });
}
 
csvFiles.forEach(loadCsv);
 
// ====================
// GEOJSON LAYERS
// ====================
 
var layerConfig = [
    {
        file: "battlefields.geojson",
        categories: ["Military"],
        style: { color: "#8a2020", weight: 2, fillColor: "#8a2020", fillOpacity: 0.15, dashArray: "4 3" },
        popup: function(p) {
            return "<strong>" + (p.Name || "Battlefield") + "</strong>" +
                (p.area_ha ? "<br>Area: " + Math.round(p.area_ha) + " ha" : "") +
                (p.hyperlink ? "<br><a href='" + p.hyperlink + "' target='_blank'>Historic England record &#x2197;</a>" : "");
        }
    },
    {
        file: "wrecks.geojson",
        categories: ["Maritime"],
        style: { color: "#1a4a8a", weight: 2, fillColor: "#1a4a8a", fillOpacity: 0.12, dashArray: "4 3" },
        popup: function(p) {
            return "<strong>" + (p.Name || "Protected Wreck") + "</strong>" +
                (p.DesigDate ? "<br>Designated: " + p.DesigDate.substring(0, 4) : "") +
                (p.area_ha ? "<br>Area: " + Math.round(p.area_ha) + " ha" : "") +
                (p.hyperlink ? "<br><a href='" + p.hyperlink + "' target='_blank'>Historic England record &#x2197;</a>" : "");
        },
        markerFromCentroid: true
    }
];
 
var geoJsonLayers = [];
 
layerConfig.forEach(function(cfg) {
    fetch(cfg.file)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var layer = L.geoJSON(data, {
                style: cfg.style,
                onEachFeature: function(feature, l) { l.bindPopup(cfg.popup(feature.properties)); }
            });
            geoJsonLayers.push({ layer: layer, categories: cfg.categories });
 
            if (cfg.markerFromCentroid) {
                var ml = L.featureGroup();
                data.features.forEach(function(feature) {
                    var coords = [];
                    var geom = feature.geometry;
                    if (geom.type === 'Polygon') coords = geom.coordinates[0];
                    else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(function(p) { coords = coords.concat(p[0]); });
                    if (coords.length) {
                        var lngSum = 0, latSum = 0;
                        coords.forEach(function(c) { lngSum += c[0]; latSum += c[1]; });
                        var m = L.marker([latSum / coords.length, lngSum / coords.length], { icon: shipMarkerIcon })
                            .bindPopup(cfg.popup(feature.properties));
                        ml.addLayer(m);
                    }
                });
                geoJsonLayers.push({ layer: ml, categories: cfg.categories, isWreckMarkers: true });
            }
 
            // Re-apply any active layer filter now that this geoJSON has actually loaded.
            // Without this, toggling a layer on before the fetch resolves (common on a fast
            // page load) leaves that layer permanently invisible even after the data arrives.
            // Shared by both mobile and desktop now that both drive the same activeLayers state.
            applyLayerFilter();
        })
        .catch(function() { console.warn("Could not load: " + cfg.file); });
});
 
// ====================
// LAYERS PANEL SYSTEM
// ====================
 
var activeLayers = {};
 
function toggleLayersPanel() {
    var panel = document.getElementById("layersPanel");
    var chevron = document.getElementById("mapContentChevron");
    if (!panel) return;
    var isOpen = panel.classList.contains("open");
    if (isOpen) {
        panel.classList.remove("open");
        if (chevron) chevron.style.transform = "";
    } else {
        panel.classList.add("open");
        if (chevron) chevron.style.transform = "rotate(180deg)";
    }
}
 
function closeLayersPanel() {
    var panel = document.getElementById("layersPanel");
    var chevron = document.getElementById("mapContentChevron");
    if (panel) panel.classList.remove("open");
    if (chevron) chevron.style.transform = "";
}
 
function toggleLayer(toggleEl) {
    var row = toggleEl.closest(".layer-row, .mobile-layer-row");
    var cat = row.getAttribute("data-cat");
    var isOn = toggleEl.classList.contains("on");
 
    if (isOn) {
        toggleEl.classList.remove("on");
        toggleEl.classList.add("off");
        activeLayers[cat] = false;
    } else {
        toggleEl.classList.remove("off");
        toggleEl.classList.add("on");
        activeLayers[cat] = true;
    }
 
    applyLayerFilter();
    updateKeyPills();
    updateBadge();
}
 
function clearAllLayers() {
    activeLayers = {};
    document.querySelectorAll(".layer-toggle").forEach(function(t) {
        t.classList.remove("on");
        t.classList.add("off");
    });
    applyLayerFilter();
    updateKeyPills();
    updateBadge();
}
 
function applyLayerFilter() {
    // Shared by both desktop (toggle panel) and mobile (layers tray) since
    // both now drive the same activeLayers object - one source of truth,
    // no more dual code paths to keep in sync.
    var activeList = Object.keys(activeLayers).filter(function(k) { return activeLayers[k]; });
 
    markerCluster.clearLayers();
    allMarkers.forEach(function(marker) {
        if (activeList.length === 0 || activeList.indexOf(marker.category) !== -1) {
            markerCluster.addLayer(marker);
        }
    });
 
    if (!map.hasLayer(markerCluster) && activeList.length > 0) {
        map.addLayer(markerCluster);
    } else if (activeList.length === 0) {
        map.removeLayer(markerCluster);
    }
 
    geoJsonLayers.forEach(function(item) {
        var shouldShow = activeList.some(function(cat) { return item.categories.indexOf(cat) !== -1; });
        if (shouldShow) item.layer.addTo(map);
        else if (map.hasLayer(item.layer)) map.removeLayer(item.layer);
    });
}
 
function updateKeyPills() {
    var row = document.getElementById("keyPillsRow");
    if (!row) return;
    var activeList = Object.keys(activeLayers).filter(function(k) { return activeLayers[k]; });
    row.innerHTML = activeList.map(function(cat) {
        var colour = "#082b5f";
        var rowEl = document.querySelector(".layer-row[data-cat='" + cat + "']");
        if (rowEl) colour = rowEl.getAttribute("data-colour");
        return "<div class='key-pill'><span class='key-pill-dot' style='background:" + colour + ";'></span>" + cat + "</div>";
    }).join("");
}
 
function updateBadge() {
    var count = Object.keys(activeLayers).filter(function(k) { return activeLayers[k]; }).length;
 
    var desktopBadge = document.getElementById("mapContentBadge");
    if (desktopBadge) {
        if (count > 0) {
            desktopBadge.textContent = count;
            desktopBadge.style.display = "inline-block";
        } else {
            desktopBadge.style.display = "none";
        }
    }
 
    var mobileBadge = document.getElementById("mobileExploreBadge");
    if (mobileBadge) {
        if (count > 0) {
            mobileBadge.textContent = count;
            mobileBadge.style.display = "inline-block";
        } else {
            mobileBadge.style.display = "none";
        }
    }
}
 
map.on("click", function() {
    if (!isMobile) {
        closeLayersPanel();
        closeDesktopPanel();
    }
});
 
document.addEventListener("click", function(e) {
    var bar = document.getElementById("mapContentBar");
    var panel = document.getElementById("layersPanel");
    if (bar && panel && !bar.contains(e.target) && !panel.contains(e.target)) {
        closeLayersPanel();
    }
});
 
// ====================
// DESKTOP PANEL
// ====================
 
function openDesktopPanel() {
    var panel = document.getElementById("desktopPanel");
    if (panel) panel.classList.add("panel-open");
    setTimeout(function() { map.invalidateSize(); }, 320);
}
 
function closeDesktopPanel() {
    var panel = document.getElementById("desktopPanel");
    if (panel) panel.classList.remove("panel-open");
    setTimeout(function() { map.invalidateSize(); }, 320);
}
 
// ====================
// RESET MAP VIEW
// ====================
 
function resetMapView() {
    map.setView([54.0, -2.5], 6);
    markerClicked = false;
 
    if (selectedMarker) {
        selectedMarker.setIcon(getMarkerIcon(selectedMarker.category || "Literary"));
        selectedMarker = null;
    }
 
    document.getElementById("layout").classList.remove("filter-active");
    document.getElementById("layout").classList.remove("map-expanded");
    closeMobileLayersTray();
 
    if (isMobile) {
        mobileDetails.innerHTML = getEmptyStateHTML();
        openPanel();
        setTimeout(function() { map.invalidateSize(); }, 50);
    } else {
        desktopDetails.innerHTML = getEmptyStateHTML();
        openDesktopPanel();
    }
}
 
// ====================
// MOBILE PANEL
// ====================
 
function openPanel() {
    var el = document.getElementById("details");
    if (el) el.classList.remove("panel-hidden");
    setTimeout(function() { map.invalidateSize(); }, 50);
}
 
function closePanel() {
    var el = document.getElementById("details");
    if (el) el.classList.add("panel-hidden");
    setTimeout(function() { map.invalidateSize(); }, 50);
}
 
function expandMap() {
    document.getElementById("layout").classList.add("map-expanded");
    closePanel();
    setTimeout(function() { map.invalidateSize(); }, 50);
}
 
// ====================
// MOBILE LAYERS TRAY
// ====================
 
function toggleMobileLayersTray() {
    var tray = document.getElementById("mobileLayersTray");
    var overlay = document.getElementById("mobileLayersOverlay");
    if (!tray || !overlay) return;
    var isOpen = tray.classList.contains("open");
    if (isOpen) {
        closeMobileLayersTray();
    } else {
        tray.classList.add("open");
        overlay.classList.add("open");
    }
}
 
function closeMobileLayersTray() {
    var tray = document.getElementById("mobileLayersTray");
    var overlay = document.getElementById("mobileLayersOverlay");
    if (tray) tray.classList.remove("open");
    if (overlay) overlay.classList.remove("open");
}
 
// ====================
// MOBILE TRAY DRAG-TO-DISMISS
// ====================
 
(function() {
    var tray = document.getElementById("mobileLayersTray");
    var handle = document.getElementById("mobileTrayHandle");
    if (!tray || !handle) return;
 
    var startY = 0;
    var currentY = 0;
    var dragging = false;
    var DISMISS_THRESHOLD = 80; // px of downward drag needed to dismiss
 
    function onStart(clientY) {
        dragging = true;
        startY = clientY;
        currentY = clientY;
        tray.classList.add("dragging");
    }
 
    function onMove(clientY) {
        if (!dragging) return;
        currentY = clientY;
        var delta = Math.max(0, currentY - startY); // only allow downward drag
        tray.style.transform = "translateY(" + delta + "px)";
    }
 
    function onEnd() {
        if (!dragging) return;
        dragging = false;
        tray.classList.remove("dragging");
        var delta = Math.max(0, currentY - startY);
        tray.style.transform = "";
        if (delta > DISMISS_THRESHOLD) {
            closeMobileLayersTray();
        }
    }
 
    handle.addEventListener("touchstart", function(e) {
        onStart(e.touches[0].clientY);
    }, { passive: true });
 
    handle.addEventListener("touchmove", function(e) {
        onMove(e.touches[0].clientY);
    }, { passive: true });
 
    handle.addEventListener("touchend", onEnd);
    handle.addEventListener("touchcancel", onEnd);
 
    // Mouse support too, for desktop-browser testing in responsive/mobile-emulation mode
    handle.addEventListener("mousedown", function(e) {
        onStart(e.clientY);
        function moveHandler(e) { onMove(e.clientY); }
        function upHandler() {
            onEnd();
            document.removeEventListener("mousemove", moveHandler);
            document.removeEventListener("mouseup", upHandler);
        }
        document.addEventListener("mousemove", moveHandler);
        document.addEventListener("mouseup", upHandler);
    });
})();
 
function toggleMobileLayer(toggleEl) {
    // Mobile and desktop share one source of truth (activeLayers). toggleLayer()
    // already updates activeLayers and calls applyLayerFilter() + updateBadge()
    // (which updates both the desktop and mobile badges) - we just also keep
    // the matching desktop toggle row visually in sync, in case the panel is
    // opened later in the same session after a resize.
    toggleLayer(toggleEl);
 
    var row = toggleEl.closest(".mobile-layer-row");
    var cat = row ? row.getAttribute("data-cat") : null;
    var isOn = toggleEl.classList.contains("on");
 
    var desktopRow = document.querySelector(".layer-row[data-cat='" + cat + "']");
    if (desktopRow) {
        var desktopToggle = desktopRow.querySelector(".layer-toggle");
        if (desktopToggle) {
            desktopToggle.classList.toggle("on", isOn);
            desktopToggle.classList.toggle("off", !isOn);
        }
    }
}
 
document.addEventListener("click", function(e) {
    var resultsBox = document.getElementById("mobileSearchResults");
    var searchBox = document.getElementById("mobileSearchBox");
    if (resultsBox && searchBox && !searchBox.contains(e.target)) {
        resultsBox.innerHTML = "";
    }
});
 
// ====================
// SEARCH (Nominatim)
// ====================
 
function runSearch() {
    performSearch("desktopSearchInput", "searchResults");
}
 
function runSearchMobile() {
    performSearch("mobileSearchInput", "mobileSearchResults");
}
 
// Nominatim often returns more than one row for what a person would call
// "the same place" - e.g. a plain settlement match and a more specific
// match with a postcode attached. This keeps only the first result for
// each distinct place name (the part of display_name before the first
// comma), so the dropdown doesn't show obvious-looking duplicates.
function dedupeNominatimResults(data) {
    var seen = {};
    return data.filter(function(item) {
        var key = item.display_name.split(",")[0].trim().toLowerCase();
        if (seen[key]) return false;
        seen[key] = true;
        return true;
    });
}
 
function performSearch(inputId, resultsId) {
    var input = document.getElementById(inputId);
    var resultsBox = document.getElementById(resultsId);
    if (!input || !resultsBox) return;
    var query = input.value.trim();
    if (!query) return;
 
    resultsBox.innerHTML = '<div class="search-no-result">Searching…</div>';
 
    var url = "https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb&limit=5&q=" + encodeURIComponent(query);
 
    fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "MapBritannia/1.0" } })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            data = dedupeNominatimResults(data);
            resultsBox.innerHTML = "";
            if (!data || data.length === 0) {
                resultsBox.innerHTML = '<div class="search-no-result">No results found</div>';
                return;
            }
            if (data.length === 1) {
                flyToResult(data[0], inputId, resultsId);
                return;
            }
            data.forEach(function(item) {
                var div = document.createElement("div");
                div.className = "search-result-item";
                div.textContent = item.display_name;
                div.onclick = function() { flyToResult(item, inputId, resultsId); };
                resultsBox.appendChild(div);
            });
        })
        .catch(function() {
            resultsBox.innerHTML = '<div class="search-no-result">Search unavailable — please try again</div>';
        });
}
 
function flyToResult(item, inputId, resultsId) {
    var lat = parseFloat(item.lat);
    var lng = parseFloat(item.lon);
    var resultsBox = document.getElementById(resultsId || "searchResults");
    var input = document.getElementById(inputId || "desktopSearchInput");
    if (resultsBox) resultsBox.innerHTML = "";
    if (input) input.value = item.display_name.split(",")[0];
    map.flyTo([lat, lng], 10, { duration: 1.2 });
}
 
document.addEventListener("click", function(e) {
    var search = document.getElementById("desktopPanelSearch");
    var results = document.getElementById("searchResults");
    if (search && results && !search.contains(e.target)) {
        results.innerHTML = "";
    }
});
 
// ====================
// INIT
// ====================
 
// ====================
// URL PARAMETER HANDLING (landing.html front door)
// ====================
// Added to support landing.html as the new search-led entry point.
// index.html remains fully functional with no parameters present - this
// block only acts when a recognised parameter is found, and does nothing
// otherwise. No router, no new dependencies, no changes to existing
// functions - it calls the same toggleLayer()/performSearch() the UI
// itself uses for a real click or search.
 
function applyUrlParams() {
    var params = new URLSearchParams(window.location.search);
 
    // ?search=QUERY - populate the visible search input and run the same
    // search a person would get by typing and pressing Enter.
    var searchQuery = params.get("search");
    if (searchQuery) {
        var input = isMobile ? document.getElementById("mobileSearchInput") : document.getElementById("desktopSearchInput");
        if (input) {
            input.value = searchQuery;
            if (isMobile) runSearchMobile(); else runSearch();
        }
    }
 
    // ?theme=Category Name - activate the matching existing layer, exactly
    // as if its toggle switch had been clicked. Only acts if a toggle for
    // that category actually exists; unrecognised values are ignored
    // rather than causing an error, since future theme pills may reference
    // categories that don't exist as data layers yet.
    var theme = params.get("theme");
    if (theme) {
        var desktopToggle = document.querySelector(".layer-row[data-cat='" + theme + "'] .layer-toggle");
        var mobileToggle = document.querySelector(".mobile-layer-row[data-cat='" + theme + "'] .layer-toggle");
        if (desktopToggle) {
            toggleLayer(desktopToggle);
        } else if (mobileToggle) {
            toggleLayer(mobileToggle);
        }
        // Keep the other (non-acted-on) row's switch visually in sync too,
        // mirroring the existing pattern used by toggleMobileLayer().
        if (desktopToggle && mobileToggle) {
            var isOn = desktopToggle.classList.contains("on");
            mobileToggle.classList.toggle("on", isOn);
            mobileToggle.classList.toggle("off", !isOn);
        }
    }
 
    // ?locate=true - reserved for a future "use my current location"
    // feature. No geolocation function exists anywhere in this file yet,
    // so deliberately left as a no-op rather than faking a result.
    // TODO: when implemented, call navigator.geolocation.getCurrentPosition
    // here and map.flyTo the returned coordinates at a sensible zoom.
    // var locate = params.get("locate");
}
 
window.addEventListener('load', function() {
    if (!isMobile) {
        desktopDetails.innerHTML = getEmptyStateHTML();
        openDesktopPanel();
    } else {
        mobileDetails.innerHTML = getEmptyStateHTML();
        var detailsEl = document.getElementById("details");
        if (detailsEl) detailsEl.classList.remove("panel-hidden");
        // Mobile now starts empty, same as desktop - the user opts in via the
        // Explore pill/layers tray rather than seeing every marker by default.
        setTimeout(function() { map.invalidateSize(); }, 50);
    }
 
    applyUrlParams();
});
 
// ====================
// MODAL
// ====================
 
function openModal(tab) {
    document.getElementById('modal').classList.add('open');
    document.getElementById('modalOverlay').classList.add('open');
    if (tab) switchTab(tab);
}
 
function closeModal() {
    document.getElementById('modal').classList.remove('open');
    document.getElementById('modalOverlay').classList.remove('open');
}
 
function switchTab(name) {
    document.querySelectorAll('.modal-tab').forEach(function(btn) { btn.classList.remove('active'); });
    document.querySelectorAll('.modal-tab-content').forEach(function(el) { el.classList.remove('active'); });
    var tab = document.getElementById('tab-' + name);
    if (tab) tab.classList.add('active');
    document.querySelectorAll('.modal-tab').forEach(function(btn) {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').indexOf(name) !== -1) btn.classList.add('active');
    });
}
 
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
 










