/*
 Documentation and below code can be found here:
 https://docs.mapbox.com/mapbox-gl-js/guides/install/#quickstart
*/
mapboxgl.accessToken = MAPBOX_TOKEN;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10', // style URL
    center: cottage.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});

/* Adding zoom-in zoom-out and 3d controls for map */
map.addControl(new mapboxgl.NavigationControl());


map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

/* Adding Marker */
new mapboxgl.Marker()
    .setLngLat(cottage.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 10 })
            .setHTML(
                `<h3>${cottage.title}</h3><p>${cottage.location}</p>`
            )
    )
    .addTo(map);