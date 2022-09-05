// store the API's in a query
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log(queryURL)

var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log(tectonicURL)

// create layer groups for the quakes and tectonic plates
var quakes = new L.layerGroup()
var tectonic = new L.layerGroup()

// define satellite, grayscale and outdoors layers
var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/satellite-v9",
    accessToken: "pk.eyJ1IjoicnVzczIwMjIiLCJhIjoiY2w3b211Y3l5MGhqdjN1cGE1N3kxNWxycSJ9.rkqXCx_MZWExQGK-ziGWxA"
});

var greyscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/light-v10",
    accessToken: "pk.eyJ1IjoicnVzczIwMjIiLCJhIjoiY2w3b211Y3l5MGhqdjN1cGE1N3kxNWxycSJ9.rkqXCx_MZWExQGK-ziGWxA"
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    accessToken: "pk.eyJ1IjoicnVzczIwMjIiLCJhIjoiY2w3b211Y3l5MGhqdjN1cGE1N3kxNWxycSJ9.rkqXCx_MZWExQGK-ziGWxA"
});

// define base layers and only one base layer can be displayed at a time
var baseMaps = {
    "satellite": satelliteMap,
    "greyscale": greyscaleMap,
    "outdoors": outdoorsMap
};

// create a toggleable overlay
var overlayMaps = {
    "earthquakes": quakes,
    "tectonic_plates": tectonic
};

// create a map object and set default layers
// in this case i used greyscale and satellite maps
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [greyscaleMap, satelliteMap]
});

// create a layer control &
// pass in our baseMaps and overlayMaps then
// add layer controls to the maps
L.control.layers(baseMaps, overlayMaps, {
    collapse: false
}).addTo(myMap);

// initialise d3 and retrieve earthquake data
d3.json(queryURL, function (seismicEvents) {
    // define marker size function that will give different radius based on earthquake magnitude
    function markerSize(magnitude) {
        return magnitude * 5;
    }

    // create a function that will determine the color of marker
    function markerColor(magnitude) {
        if (magnitude > 5) {
            return "red"
        } else if (magnitude > 4) {
            return "darkorange"
        } else if (magnitude > 2) {
            return "lightorange"
        } else if (magnitude > 1) {
            return "yellow"
        } else {
            return "green"
        }
    };

    // function to style the marker depending on the magnitude
    function markerStyle(features) {
        return {
            opacity: 1,
            fillOpacity: 1,
            color: "black",
            weight: .75,
            stroke: true,
            fillColor: markerColor(features.properties.mag),
            radius: markerSize(features.properties.mag)
        };
    }

    // create GeoJSON layer
    L.geoJSON(seismicEvents, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: markerStyle,
        // create a popup for each feature and assign a description
        // assign place and time of the seismic event(earthquake)
        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h4 style='text-align:center;'>" + feature.properties.place +
                "<h4 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h4> <hr> <h5 style='text-align:center;'>" + feature.properties.title + "</h5>"
            );
        }
    }).addTo(seismicEvents);
    // add to maps
    seismicEvents.addTo(myMap);

    // get tectonic plates url data
    d3.json(tectonicURL, function (plates) {
        L.geoJSON(plates, {
            color: "orange",
            weight: .9
        }).addTo(plates)
        // add to maps
        plates.addTo(myMap);
    });


    // create legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            magnitudeIntensity = [0, 1, 2, 3, 4, 5];
        div.innerHTML += "<h4>Magnitude</h4>"

        for (var i = 0; i < magnitudeIntensity.length; i++) {
            div.innerHTML += '<i style="background: ' + markerColor(magnitudeIntensity[i + 1] ? '&ndash;' + magnitudeIntensity[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // append the legend to the map
    legend.addTo(myMap);
});



