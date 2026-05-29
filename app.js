// ====================
// MAP SETUP
// ====================

var map = L.map('map', { zoomControl: false, maxZoom: 18 }).setView([50.55, -3.8], 9);
L.control.zoom({ position: 'bottomright' }).addTo(map);
var details = document.getElementById("detailsContent");
var detailsPanel = document.getElementById("details");
var allMarkers = [];

// Cluster group — groups nearby markers automatically
var markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 40,
    disableClusteringAtZoom: 12,
    maxClusterZoom: 11
});
map.addLayer(markerClusterGroup);

var blueMarkerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var redMarkerIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var purpleMarkerIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ====================
// MOBILE DETECTION
// ====================

function isMobile() {
    return window.innerWidth <= 768;
}

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

    var items = text
        .split(/\n+/)
        .map(function(item) { return item.trim(); })
        .filter(function(item) { return item.length > 0; });

    return "<ul class='literature-list'>" +
        items.map(function(item) {
            return "<li>" + escapeHtml(item) + "</li>";
        }).join("") +
        "</ul>";
}

function formatParagraph(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
}

// ====================
// OPEN / CLOSE PANEL
// ====================

function openPanel() {
    if (isMobile()) {
        detailsPanel.classList.add("panel-open");
        var hint = document.getElementById("mobileHint");
        if (hint) hint.classList.add("hidden");
        setTimeout(function() { map.invalidateSize(); }, 350);
    }
}

function closePanel() {
    if (isMobile()) {
        detailsPanel.classList.remove("panel-open");
        setTimeout(function() { map.invalidateSize(); }, 350);
    }
}

// ====================
// DETAILS PANEL
// ====================

function showDetails(row) {
    var title = row.Location_name || "Cultural location";
    var lat = row.Latitude;
    var lng = row.Longitude;

    var googleMaps = row.Google_Maps_Link
        ? "<a class='button' href='" + escapeHtml(row.Google_Maps_Link) + "' target='_blank'>Open in Google Maps</a>"
        : "";

    var appleMaps = lat && lng
        ? "<a class='button' href='https://maps.apple.com/?q=" + encodeURIComponent(title) + "&ll=" + lat + "," + lng + "' target='_blank'>Open in Apple Maps</a>"
        : "";

    var officialWebsite = row.Official_Website
        ? "<a class='button green-button' href='" + escapeHtml(row.Official_Website) + "' target='_blank'>Official website</a>"
        : "";

    details.innerHTML =
        "<div class='place-card'>" +
            "<div class='return-map' onclick='returnToMap()'><span class='return-icon'>☚</span> Return to Map</div>" +
            "<h1>" + escapeHtml(title) + "</h1>" +

            "<h2>📖 Literature</h2>" +
            makeLiteratureList(row.Literature) +

            "<h2>🎭 Cultural Importance</h2>" +
            "<p>" + formatParagraph(row.Cultural_Significance) + "</p>" +

            "<h2>📍 Place Highlights</h2>" +
            "<p>" + formatParagraph(row.Distinctive_Feature) + "</p>" +

            "<div class='info-panel'>" +
                "<div class='panel-title'>🔎 Plan Your Visit</div>" +
                "<div class='action-row'>" +
                    "<span class='map-icon'>🗺️</span>" +
                    googleMaps +
                    appleMaps +
                    officialWebsite +
                "</div>" +
            "</div>" +

            "<div class='partner-panel'>" +
                "<div class='panel-title'>🤝 Local Partner</div>" +
                "<p>This space could be used for local businesses, heritage organisations, bookshops, cafés, tours or accommodation linked to Devon's cultural landscape.</p>" +
                "<div class='advert-box'><strong>Advertise Here</strong><br>Reach visitors interested in Devon's literary, cultural and heritage locations.</div>" +
            "</div>" +

            "<div class='project-footer'>About the Devon Cultural Map</div>" +
        "</div>";

    // Scroll detail content to top
    detailsPanel.scrollTop = 0;

    // Open panel on mobile
    openPanel();
}

// ====================
// RESET / RETURN TO MAP
// ====================

function returnToMap() {
    var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    var instruction = isTouchDevice
        ? "Tap a marker to explore a literary or cultural location."
        : "Click a marker to explore a literary or cultural location.";

    details.innerHTML = `
        <div class="place-card">
            <h1>Devon Cultural Map</h1>
            <p class="intro">` + instruction + `</p>
        </div>
    `;
    closePanel();
}

// ====================
// LOAD CSV DATA
// ====================

function loadCSV(filename) {
    Papa.parse(filename, {
        download: true,
        header: true,
        skipEmptyLines: true,
        error: function(error) {
            console.error("Could not load " + filename);
        },
        complete: function(results) {
            results.data.forEach(function(row) {
                var lat = parseFloat(row.Latitude);
                var lng = parseFloat(row.Longitude);

                if (!isNaN(lat) && !isNaN(lng)) {
                    var title = row.Location_name || "Cultural location";
                    var category = row.Category ? row.Category.trim() : "Literary";
                    var icon = category === "Military" ? redMarkerIcon 
                             : category === "Horrible History" ? purpleMarkerIcon 
                             : blueMarkerIcon;

                    var marker = L.marker([lat, lng], { icon: icon })
                        .bindPopup(escapeHtml(title))
                        .on("click", function() {
                            showDetails(row);
                        });

                    marker.category = category;
                    allMarkers.push(marker);
                    markerClusterGroup.addLayer(marker);
                }
            });
        }
    });
}

loadCSV("literarydevon.csv");
loadCSV("militarydevon.csv");
loadCSV("horriblehistory.csv");

// ====================
// CATEGORY FILTER
// Syncs both the mobile and desktop dropdowns
// ====================

function applyFilter(selectedCategory) {
    markerClusterGroup.clearLayers();
    allMarkers.forEach(function(marker) {
        if (selectedCategory === "All" || marker.category === selectedCategory) {
            markerClusterGroup.addLayer(marker);
        }
    });
}

document.getElementById("categoryFilter").addEventListener("change", function() {
    applyFilter(this.value);
    document.getElementById("categoryFilterDesktop").value = this.value;
});

document.getElementById("categoryFilterDesktop").addEventListener("change", function() {
    applyFilter(this.value);
    document.getElementById("categoryFilter").value = this.value;
});
