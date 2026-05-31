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
    disableClusteringAtZoom: 16,
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

// Track current filter to control single marker icon style
var currentFilter = "All";

var navySingleIcon = L.divIcon({
    html: '<div class="cluster-circle">1</div>',
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
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
                    var marker = L.marker([lat, lng], { icon: navySingleIcon })
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
        '<div class="place-card">' +
        '<svg width="100%" viewBox="0 0 680 440" role="img" xmlns="http://www.w3.org/2000/svg">' +
        '<title>Devon Cultural Map signpost</title>' +
        '<desc>A wooden signpost pointing to Literature, Military and Horrible History</desc>' +
        '<rect x="0" y="0" width="680" height="440" fill="#f5f0e6"/>' +
        '<rect x="0" y="340" width="680" height="100" fill="#c8b87a"/>' +
        '<rect x="0" y="355" width="680" height="85" fill="#bfaa68"/>' +
        '<ellipse cx="100" cy="342" rx="70" ry="18" fill="#8ab060"/>' +
        '<ellipse cx="75" cy="334" rx="48" ry="22" fill="#7aa050"/>' +
        '<ellipse cx="105" cy="328" rx="42" ry="26" fill="#90ba64"/>' +
        '<ellipse cx="88" cy="320" rx="32" ry="20" fill="#82aa58"/>' +
        '<ellipse cx="118" cy="325" rx="28" ry="18" fill="#9ac070"/>' +
        '<rect x="95" y="354" width="10" height="22" rx="3" fill="#6a5030"/>' +
        '<rect x="102" y="350" width="7" height="18" rx="2" fill="#7a6040"/>' +
        '<ellipse cx="580" cy="338" rx="62" ry="16" fill="#8ab060"/>' +
        '<ellipse cx="558" cy="328" rx="44" ry="24" fill="#7aa050"/>' +
        '<ellipse cx="590" cy="322" rx="38" ry="22" fill="#90ba64"/>' +
        '<ellipse cx="572" cy="315" rx="28" ry="18" fill="#9ac070"/>' +
        '<ellipse cx="600" cy="330" rx="24" ry="16" fill="#82aa58"/>' +
        '<rect x="575" y="350" width="10" height="22" rx="3" fill="#6a5030"/>' +
        '<ellipse cx="470" cy="355" rx="35" ry="10" fill="#9ab868"/>' +
        '<ellipse cx="458" cy="348" rx="24" ry="14" fill="#8aac58"/>' +
        '<ellipse cx="478" cy="344" rx="20" ry="13" fill="#9aba6a"/>' +
        '<rect x="466" y="358" width="7" height="14" rx="2" fill="#6a5030"/>' +
        '<ellipse cx="210" cy="358" rx="28" ry="8" fill="#9ab868"/>' +
        '<ellipse cx="200" cy="352" rx="20" ry="12" fill="#8aac58"/>' +
        '<ellipse cx="218" cy="349" rx="17" ry="11" fill="#9aba6a"/>' +
        '<rect x="206" y="360" width="6" height="12" rx="2" fill="#6a5030"/>' +
        '<path d="M30,370 Q60,355 90,365 Q120,375 150,360 Q180,348 210,362 Q240,372 270,358 Q300,346 330,360 Q360,370 390,355 Q420,342 450,358 Q480,370 510,355 Q540,343 570,358 Q600,368 630,355 Q655,345 680,358 L680,440 L0,440 Z" fill="#b8a45e"/>' +
        '<path d="M0,390 Q40,378 80,385 Q120,392 160,380 Q200,370 240,382 Q280,390 320,378 Q360,368 400,380 Q440,390 480,378 Q520,368 560,380 Q600,388 640,376 Q660,372 680,378 L680,440 L0,440 Z" fill="#a89050"/>' +
        '<line x1="48" y1="362" x2="44" y2="350" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="48" y1="362" x2="52" y2="349" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="48" y1="362" x2="48" y2="348" stroke="#5a7a28" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="145" y1="368" x2="141" y2="356" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="145" y1="368" x2="149" y2="355" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="145" y1="368" x2="145" y2="354" stroke="#5a7a28" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="260" y1="364" x2="256" y2="352" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="260" y1="364" x2="264" y2="351" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="260" y1="364" x2="260" y2="350" stroke="#5a7a28" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="390" y1="360" x2="386" y2="348" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="390" y1="360" x2="394" y2="347" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="390" y1="360" x2="390" y2="346" stroke="#5a7a28" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="510" y1="362" x2="506" y2="350" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="510" y1="362" x2="514" y2="349" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="510" y1="362" x2="510" y2="348" stroke="#5a7a28" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="630" y1="360" x2="626" y2="348" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="630" y1="360" x2="634" y2="347" stroke="#6a8a38" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="630" y1="360" x2="630" y2="346" stroke="#5a7a28" stroke-width="1.5" stroke-linecap="round"/>' +
        '<line x1="170" y1="380" x2="167" y2="371" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="170" y1="380" x2="173" y2="370" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="440" y1="375" x2="437" y2="366" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="440" y1="375" x2="443" y2="365" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="310" y1="382" x2="307" y2="373" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="310" y1="382" x2="313" y2="372" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="560" y1="378" x2="557" y2="369" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="560" y1="378" x2="563" y2="368" stroke="#7a9a48" stroke-width="1.2" stroke-linecap="round"/>' +
        '<ellipse cx="62" cy="400" rx="14" ry="9" fill="#c0aa80" stroke="#a08860" stroke-width="0.8"/>' +
        '<ellipse cx="62" cy="398" rx="10" ry="4" fill="#d0ba90" opacity="0.5"/>' +
        '<ellipse cx="95" cy="412" rx="10" ry="6" fill="#b8a070" stroke="#988050" stroke-width="0.8"/>' +
        '<ellipse cx="118" cy="404" rx="7" ry="4" fill="#c8b080" stroke="#a89060" stroke-width="0.7"/>' +
        '<ellipse cx="118" cy="403" rx="5" ry="2" fill="#d8c090" opacity="0.5"/>' +
        '<ellipse cx="200" cy="408" rx="18" ry="10" fill="#b4a06a" stroke="#948050" stroke-width="0.8"/>' +
        '<ellipse cx="200" cy="406" rx="13" ry="5" fill="#c8b47a" opacity="0.5"/>' +
        '<ellipse cx="232" cy="418" rx="8" ry="5" fill="#c0ac72" stroke="#a08c52" stroke-width="0.7"/>' +
        '<ellipse cx="255" cy="410" rx="11" ry="6" fill="#bca868" stroke="#9c8848" stroke-width="0.8"/>' +
        '<ellipse cx="370" cy="415" rx="9" ry="5" fill="#c2ae74" stroke="#a28e54" stroke-width="0.7"/>' +
        '<ellipse cx="395" cy="406" rx="15" ry="8" fill="#b8a468" stroke="#988448" stroke-width="0.8"/>' +
        '<ellipse cx="395" cy="404" rx="11" ry="4" fill="#ccb87c" opacity="0.5"/>' +
        '<ellipse cx="420" cy="418" rx="6" ry="4" fill="#bfaa70" stroke="#9f8a50" stroke-width="0.7"/>' +
        '<ellipse cx="490" cy="410" rx="12" ry="7" fill="#c0aa72" stroke="#a08a52" stroke-width="0.8"/>' +
        '<ellipse cx="516" cy="420" rx="7" ry="4" fill="#b8a268" stroke="#988248" stroke-width="0.7"/>' +
        '<ellipse cx="540" cy="408" rx="16" ry="9" fill="#bcaa6e" stroke="#9c8a4e" stroke-width="0.8"/>' +
        '<ellipse cx="540" cy="406" rx="11" ry="4" fill="#d0be82" opacity="0.5"/>' +
        '<ellipse cx="610" cy="414" rx="10" ry="6" fill="#c4ae76" stroke="#a48e56" stroke-width="0.7"/>' +
        '<ellipse cx="638" cy="405" rx="13" ry="7" fill="#b8a46a" stroke="#988450" stroke-width="0.8"/>' +
        '<ellipse cx="660" cy="418" rx="8" ry="5" fill="#c0ac72" stroke="#a08c52" stroke-width="0.7"/>' +
        '<rect x="333" y="200" width="14" height="155" rx="3" fill="#8a6030"/>' +
        '<rect x="330" y="310" width="20" height="18" rx="2" fill="#7a5028"/>' +
        '<rect x="333" y="200" width="14" height="30" fill="#7a5828"/>' +
        '<rect x="222" y="222" width="160" height="40" rx="5" fill="#1a4a8a"/>' +
        '<rect x="222" y="222" width="160" height="40" rx="5" fill="none" stroke="#0a3060" stroke-width="1.5"/>' +
        '<polygon points="209,242 222,222 222,262" fill="#1a4a8a" stroke="#0a3060" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<text x="298" y="247" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="0.5">\uD83D\uDCD6 Literature</text>' +
        '<rect x="347" y="168" width="172" height="40" rx="5" fill="#8a2020"/>' +
        '<rect x="347" y="168" width="172" height="40" rx="5" fill="none" stroke="#6a1010" stroke-width="1.5"/>' +
        '<polygon points="531,168 531,208 544,188" fill="#8a2020" stroke="#6a1010" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<text x="429" y="193" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="0.5">\u2694\uFE0F Military</text>' +
        '<rect x="228" y="120" width="182" height="40" rx="5" fill="#5a2880"/>' +
        '<rect x="228" y="120" width="182" height="40" rx="5" fill="none" stroke="#3a1060" stroke-width="1.5"/>' +
        '<polygon points="215,120 215,160 228,140" fill="#5a2880" stroke="#3a1060" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<text x="316" y="145" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="#ffffff" letter-spacing="0.5">\uD83D\uDC80 Horrible History</text>' +
        '<text x="340" y="52" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="700" fill="#082b5f" letter-spacing="1">Devon Cultural Map</text>' +
        '<text x="340" y="80" text-anchor="middle" font-family="Georgia, serif" font-size="16" font-style="italic" font-weight="700" fill="#4a5a70">Select a marker on the map to begin your journey</text>' +
        '<line x1="200" y1="92" x2="280" y2="92" stroke="#082b5f" stroke-width="0.8" opacity="0.3"/>' +
        '<line x1="400" y1="92" x2="480" y2="92" stroke="#082b5f" stroke-width="0.8" opacity="0.3"/>' +
        '<circle cx="340" cy="92" r="3" fill="#082b5f" opacity="0.3"/>' +
        '</svg>' +
        '</div>';
}

// ====================
// CATEGORY FILTER
// ====================

function applyFilter(selectedCategory) {
    currentFilter = selectedCategory;
    document.getElementById("categoryFilter").value = selectedCategory;
    document.getElementById("categoryFilterDesktop").value = selectedCategory;
    markerCluster.clearLayers();
    allMarkers.forEach(function(marker) {
        if (selectedCategory === "All" || marker.category === selectedCategory) {
            // All categories: navy circle for every marker including singles
            // Specific category: coloured teardrop so identity is clear
            if (selectedCategory === "All") {
                marker.setIcon(navySingleIcon);
            } else {
                marker.setIcon(getMarkerIcon(marker.category));
            }
            markerCluster.addLayer(marker);
        }
    });
}

document.getElementById("categoryFilter").addEventListener("change", function() { applyFilter(this.value); });
document.getElementById("categoryFilterDesktop").addEventListener("change", function() { applyFilter(this.value); });
