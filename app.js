// ====================
// MAP SETUP
// ====================

var map = L.map('map').setView([54.0, -2.5], 6);
var allMarkers = [];
var isMobile = window.innerWidth <= 768;

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

var currentFilter = "All";
var markerClicked = false;
var selectedMarker = null;

var markerCluster = L.markerClusterGroup({
    maxClusterRadius: 50,
    disableClusteringAtZoom: 16,
    iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        return L.divIcon({ html: '<div class="cluster-circle">' + count + '</div>', className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
    }
});

var navySingleIcon = L.divIcon({ html: '<div class="cluster-circle">1</div>', className: '', iconSize: [32, 32], iconAnchor: [16, 16] });

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
// SIGNPOST HTML
// ====================

function getSignpostHTML() {
    return '<div class="signpost-wrapper">' +
        '<svg width="100%" viewBox="0 0 680 440" role="img" xmlns="http://www.w3.org/2000/svg">' +
        '<title>Map Britannia signpost</title>' +
        '<desc>A wooden signpost pointing to Literature, Military and Horrible History</desc>' +
        '<rect x="0" y="0" width="680" height="440" fill="#f5f0e6"/>' +
        '<rect x="0" y="340" width="680" height="100" fill="#7aaa48"/>' +
        '<rect x="0" y="358" width="680" height="82" fill="#5a9030"/>' +
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
        '<path d="M0,368 Q40,360 80,365 Q120,370 160,362 Q200,355 240,364 Q280,371 320,362 Q360,355 400,364 Q440,371 480,362 Q520,355 560,364 Q600,371 640,362 Q660,358 680,362 L680,440 L0,440 Z" fill="#6aaa38"/>' +
        '<path d="M0,385 Q50,378 100,383 Q150,388 200,380 Q250,373 300,381 Q350,388 400,380 Q450,373 500,381 Q550,388 600,380 Q640,374 680,378 L680,440 L0,440 Z" fill="#4e8c28"/>' +
        '<ellipse cx="62" cy="402" rx="7" ry="4" fill="#8a8a7a" stroke="#6a6a5a" stroke-width="0.6"/>' +
        '<ellipse cx="95" cy="410" rx="5" ry="3" fill="#9a9a8a" stroke="#7a7a6a" stroke-width="0.5"/>' +
        '<ellipse cx="200" cy="414" rx="8" ry="4" fill="#888878" stroke="#686858" stroke-width="0.6"/>' +
        '<ellipse cx="395" cy="412" rx="7" ry="3" fill="#8a8a7a" stroke="#6a6a5a" stroke-width="0.6"/>' +
        '<ellipse cx="430" cy="420" rx="5" ry="3" fill="#9a9a8a" stroke="#7a7a6a" stroke-width="0.5"/>' +
        '<ellipse cx="540" cy="414" rx="9" ry="4" fill="#888878" stroke="#686858" stroke-width="0.6"/>' +
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
        '<rect x="333" y="120" width="14" height="235" rx="3" fill="#8a6030"/>' +
        '<rect x="330" y="310" width="20" height="18" rx="2" fill="#7a5028"/>' +
        '<rect x="333" y="120" width="14" height="30" fill="#7a5828"/>' +
        '<rect x="222" y="222" width="160" height="40" rx="5" fill="#1a4a8a"/>' +
        '<rect x="222" y="222" width="160" height="40" rx="5" fill="none" stroke="#0a3060" stroke-width="1.5"/>' +
        '<polygon points="222,222 209,242 222,262" fill="#1a4a8a" stroke="#0a3060" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<text x="298" y="247" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="0.5">\uD83D\uDCD6 Literature</text>' +
        '<rect x="347" y="168" width="172" height="40" rx="5" fill="#8a2020"/>' +
        '<rect x="347" y="168" width="172" height="40" rx="5" fill="none" stroke="#6a1010" stroke-width="1.5"/>' +
        '<polygon points="519,168 519,208 533,188" fill="#8a2020" stroke="#6a1010" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<text x="429" y="193" text-anchor="middle" font-family="Georgia, serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="0.5">\u2694\uFE0F Military</text>' +
        '<rect x="228" y="120" width="182" height="40" rx="5" fill="#5a2880"/>' +
        '<rect x="228" y="120" width="182" height="40" rx="5" fill="none" stroke="#3a1060" stroke-width="1.5"/>' +
        '<polygon points="228,120 228,160 215,140" fill="#5a2880" stroke="#3a1060" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<text x="316" y="145" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="700" fill="#ffffff" letter-spacing="0.5">\uD83D\uDC80 Horrible History</text>' +
        '</svg>' +
        '<p class="signpost-prompt">Select a marker on the map to begin your journey</p>' +
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
            // mobile page load) leaves that layer permanently invisible even after the data arrives.
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
    var row = toggleEl.closest ? toggleEl.closest(".layer-row") : toggleEl.parentNode;
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
    var badge = document.getElementById("mapContentBadge");
    if (!badge) return;
    var count = Object.keys(activeLayers).filter(function(k) { return activeLayers[k]; }).length;
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
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

    if (isMobile) {
        mobileDetails.innerHTML = getSignpostHTML();
        openPanel();
        setTimeout(function() { map.invalidateSize(); }, 50);
    } else {
        desktopDetails.innerHTML = getSignpostHTML();
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
// MOBILE FILTER
// ====================

function toggleFilterDropdown() {
    var dd = document.getElementById("categoryFilterDropdown");
    if (dd) dd.classList.toggle("open");
}

function selectFilterOption(value) {
    var dd = document.getElementById("categoryFilterDropdown");
    if (dd) dd.classList.remove("open");
    applyMobileFilter(value);
}

document.addEventListener("click", function(e) {
    var bar = document.getElementById("mobileFilterBar");
    if (bar && !bar.contains(e.target)) {
        var dd = document.getElementById("categoryFilterDropdown");
        if (dd) dd.classList.remove("open");
    }
});

function applyMobileFilter(selectedCategory) {
    currentFilter = selectedCategory;
    var label = document.getElementById("categoryFilterLabel");
    if (label) label.textContent = selectedCategory === "All" ? "All Categories" : selectedCategory;
    document.querySelectorAll(".filter-option").forEach(function(opt) {
        opt.classList.toggle("selected", opt.textContent.trim() === selectedCategory);
    });
    if (window.innerWidth <= 768) {
        document.getElementById("layout").classList.add("filter-active");
        closePanel();
        setTimeout(function() { map.invalidateSize(); }, 50);
    }
    markerCluster.clearLayers();
    allMarkers.forEach(function(marker) {
        if (selectedCategory === "All" || marker.category === selectedCategory) {
            marker.setIcon(selectedCategory === "All" ? navySingleIcon : getMarkerIcon(marker.category));
            markerCluster.addLayer(marker);
        }
    });
}

// ====================
// SEARCH (Nominatim)
// ====================

function runSearch() {
    var input = document.getElementById("desktopSearchInput");
    var resultsBox = document.getElementById("searchResults");
    if (!input || !resultsBox) return;
    var query = input.value.trim();
    if (!query) return;

    resultsBox.innerHTML = '<div class="search-no-result">Searching…</div>';

    var url = "https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb&limit=5&q=" + encodeURIComponent(query);

    fetch(url, { headers: { "Accept-Language": "en", "User-Agent": "MapBritannia/1.0" } })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            resultsBox.innerHTML = "";
            if (!data || data.length === 0) {
                resultsBox.innerHTML = '<div class="search-no-result">No results found</div>';
                return;
            }
            if (data.length === 1) {
                flyToResult(data[0]);
                return;
            }
            data.forEach(function(item) {
                var div = document.createElement("div");
                div.className = "search-result-item";
                div.textContent = item.display_name;
                div.onclick = function() { flyToResult(item); resultsBox.innerHTML = ""; };
                resultsBox.appendChild(div);
            });
        })
        .catch(function() {
            resultsBox.innerHTML = '<div class="search-no-result">Search unavailable — please try again</div>';
        });
}

function flyToResult(item) {
    var lat = parseFloat(item.lat);
    var lng = parseFloat(item.lon);
    var resultsBox = document.getElementById("searchResults");
    var input = document.getElementById("desktopSearchInput");
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

window.addEventListener('load', function() {
    if (!isMobile) {
        desktopDetails.innerHTML = getSignpostHTML();
        openDesktopPanel();
    } else {
        mobileDetails.innerHTML = getSignpostHTML();
        var detailsEl = document.getElementById("details");
        if (detailsEl) detailsEl.classList.remove("panel-hidden");
        map.addLayer(markerCluster);
        setTimeout(function() { map.invalidateSize(); }, 50);
    }
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
