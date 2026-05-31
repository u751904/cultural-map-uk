// ====================
// MAP SETUP
// ====================

var map = L.map('map').setView([50.72, -3.53], 9);
var details = document.getElementById("detailsContent");
var allMarkers = [];

var blueMarkerIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

var redMarkerIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

var violetMarkerIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function getMarkerIcon(category) {
    if (category === "Military") return redMarkerIcon;
    if (category === "Horrible History") return violetMarkerIcon;
    return blueMarkerIcon;
}

// Marker cluster group — dark navy circles, clusters from zoom 1 upward
var markerCluster = L.markerClusterGroup({
    maxClusterRadius: 50,
    disableClusteringAtZoom: 13,
    iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        return L.divIcon({
            html: '<div class="cluster-circle">' + count + '</div>',
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });
    }
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ====================
// HELPER FUNCTIONS
// ====================

function escapeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function makeLiteratureList(text) {
    if (!text) return "<p>No literature added yet.</p>";
    var items = text.split(/\n+/).map(function(item) { return item.trim(); }).filter(function(item) { return item.length > 0; });
    return "<ul class='literature-list'>" + items.map(function(item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>";
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
        section2Icon: "\u26A0\uFE0F", section2Title: "Historical Context",
        section3Icon: "\uD83D\uDCCD", section3Title: "Place Highlights",
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
    }
};

function getCategoryConfig(category) {
    return categoryConfig[category] || categoryConfig["Literary"];
}

// ====================
// DETAILS PANEL
// ====================

function showDetails(row) {
    var title = row.Location_name || "Cultural location";
    var lat = row.Latitude;
    var lng = row.Longitude;
    var category = row.Category ? row.Category.trim() : "Literary";
    var cfg = getCategoryConfig(category);

    var googleMaps = row.Google_Maps_Link
        ? "<a class='button' href='" + escapeHtml(row.Google_Maps_Link) + "' target='_blank'>Google Maps</a>"
        : "";

    var appleMaps = lat && lng
        ? "<a class='button' href='https://maps.apple.com/?q=" + encodeURIComponent(title) + "&ll=" + lat + "," + lng + "' target='_blank'>Apple Maps</a>"
        : "";

    var officialWebsite = row.Official_Website
        ? "<a class='button secondary-button' href='" + escapeHtml(row.Official_Website) + "' target='_blank'>Official website</a>"
        : "";

    details.innerHTML =
        "<div class='place-card'>" +
        "<h1>" + escapeHtml(cfg.label) + ": " + escapeHtml(title) + "</h1>" +
        "<div class='return-map' onclick='resetMapView()'><span class='return-icon'>&#x261A;</span> Return to Map</div>" +

        "<h2>" + cfg.section1Icon + " " + cfg.section1Title + "</h2>" +
        makeLiteratureList(row.Literature) +

        "<h2>" + cfg.section2Icon + " " + cfg.section2Title + "</h2>" +
        "<p>" + formatParagraph(row.Cultural_Significance) + "</p>" +

        "<h2>" + cfg.section3Icon + " " + cfg.section3Title + "</h2>" +
        "<p>" + formatParagraph(row.Distinctive_Feature) + "</p>" +

        "<div class='info-panel'>" +
        "<div class='panel-title'>&#x1F50E; Plan Your Visit</div>" +
        "<div class='action-row'>" +
        googleMaps + appleMaps + officialWebsite +
        "</div>" +
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

        "<div class='project-footer'>About the Devon Cultural Map</div>" +
        "</div>";
}

// ====================
// LOAD CSV DATA
// ====================

var csvFiles = [
    { file: "literarydevon.csv",   defaultCategory: "Literary" },
    { file: "horriblehistory.csv", defaultCategory: "Horrible History" },
    { file: "militarydevon.csv",   defaultCategory: "Military" }
];

function loadCsv(fileObj) {
    Papa.parse(fileObj.file, {
        download: true,
        header: true,
        skipEmptyLines: true,
        error: function() { console.warn("Could not load: " + fileObj.file); },
        complete: function(results) {
            results.data.forEach(function(row) {
                var lat = parseFloat(row.Latitude);
                var lng = parseFloat(row.Longitude);
                if (!isNaN(lat) && !isNaN(lng)) {
                    var title = row.Location_name || "Cultural location";
                    var category = row.Category ? row.Category.trim() : fileObj.defaultCategory;
                    var icon = getMarkerIcon(category);
                    var marker = L.marker([lat, lng], { icon: icon })
                        .bindPopup(escapeHtml(title))
                        .on("click", function() { showDetails(row); });
                    marker.category = category;
                    allMarkers.push(marker);
                    markerCluster.addLayer(marker);
                }
            });
        }
    });
}

csvFiles.forEach(loadCsv);
map.addLayer(markerCluster);

// ====================
// RESET MAP VIEW
// ====================

function resetMapView() {
    map.setView([50.72, -3.53], 9);
    details.innerHTML =
        "<div class='place-card'>" +
        "<h1>Devon Cultural Map</h1>" +
        "<p class='intro'>Click a marker to explore a literary or cultural location.</p>" +
        "</div>";
}

// ====================
// CATEGORY FILTER
// ====================

function applyFilter(selectedCategory) {
    document.getElementById("categoryFilter").value = selectedCategory;
    document.getElementById("categoryFilterDesktop").value = selectedCategory;
    markerCluster.clearLayers();
    allMarkers.forEach(function(marker) {
        if (selectedCategory === "All" || marker.category === selectedCategory) {
            markerCluster.addLayer(marker);
        }
    });
}

document.getElementById("categoryFilter").addEventListener("change", function() { applyFilter(this.value); });
document.getElementById("categoryFilterDesktop").addEventListener("change", function() { applyFilter(this.value); });
