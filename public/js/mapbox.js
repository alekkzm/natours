export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZmlzb3BhNzY5MCIsImEiOiJjbGJvcmoxYzYxNDlwM3hsY3YzYms5ejd1In0.jPY5H_W9QwHwvASPQrbsdg';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/fisopa7690/clborqmfg000114qr5gmf6lxb',
        scrollZoom: false,
        maxZoom: 10,
        // center: [-118.046165, 34.102179],
        // zoom: 8,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.reverse().forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker';
        new mapboxgl.Marker({ element: el, anchor: 'bottom' }).setLngLat(loc.coordinates).addTo(map);
        new mapboxgl.Popup({ offset: 30, focusAfterOpen: false })
            .setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 200,
            left: 100,
            right: 100
        }
    });
}