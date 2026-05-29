// ====================
// MAP SETUP
// ====================

var map = L.map('map', { zoomControl: false, maxZoom: 18 }).setView([50.55, -3.8], 9);
L.control.zoom({ position: 'bottomright' }).addTo(map);
var details = document.getElementById("detailsContent");
var detailsPanel = document.getElementById("details");
var allMarkers = [];

var currentFilterColor = '#082b5f';

var markerClusterGroup = L.markerClusterGroup({
    maxClusterRadius: 40,
    disableClusteringAtZoom: 12,
    maxClusterZoom: 11,
    iconCreateFunction: function(cluster) {
        return L.divIcon({
            html: '<div style="background:' + currentFilterColor + ';color:white;border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;border:2px solid white;">' + cluster.getChildCount() + '</div>',
            className: '',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
        });
    }
});
map.addLayer(markerClusterGroup);

function makeSignpostIcon(color, label) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="64" viewBox="0 0 80 64">' +
        '<rect x="37" y="28" width="5" height="30" rx="1" fill="#6b4c2a"/>' +
        '<polygon points="8,4 68,4 74,16 68,28 8,28 2,16" fill="' + color + '"/>' +
        '<text x="39" y="20" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="white">' + label + '</text>' +
        '<ellipse cx="39" cy="60" rx="6" ry="3" fill="#6b4c2a" opacity="0.3"/>' +
        '</svg>';
    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [80, 64],
        iconAnchor: [39, 60],
        popupAnchor: [0, -60]
    });
}

var literaryIcon   = makeSignpostIcon('#082b5f', 'Literary');
var militaryIcon   = makeSignpostIcon('#b03020', 'Military');
var horribleIcon   = makeSignpostIcon('#5b2d82', 'Horrible');

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
            <button onclick="resetMapView()" class="button" style="margin-top:12px;">Reset map view</button>
        </div>
    `;
    closePanel();
}

function resetMapView() {
    map.setView([50.55, -3.8], 9);
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
                    var icon = category === "Military" ? militaryIcon
                             : category === "Horrible History" ? horribleIcon
                             : literaryIcon;

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
    currentFilterColor = selectedCategory === "Military" ? '#b03020'
                       : selectedCategory === "Horrible History" ? '#5b2d82'
                       : '#082b5f';
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
