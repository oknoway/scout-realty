/**
 * Map Functions
 * http://scoutrealty.com
 *
 * Copyright (c) 2014 Nate Bedortha at OK/No Way
 */

/*
*  render_map
*
*  This function will render a Google Map onto the selected jQuery element
*
*  @type  function
*  @date  8/11/2013
*  @since 4.3.0
*
*  @param $el (jQuery element)
*  @return  n/a
*/
 
function render_map( $el ) {
  
  // vars
  var mapStyles = [
  {
    "featureType": "administrative.locality",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "administrative.neighborhood",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "simplified" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "labels",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "road.arterial",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "road.local",
    "stylers": [
      { "visibility": "simplified" }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi",
    "stylers": [
      { "visibility": "on" }
    ]
  },{
    "featureType": "poi.business",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative.neighborhood",
    "elementType": "geometry.fill",
    "stylers": [
      { "color": "#da8080" },
      { "visibility": "on" }
    ]
  }];
  
  var args = {
    zoom    : ( $el.data( 'map-zoom_level' ) - 2 ),
    center    : new google.maps.LatLng( $el.data( 'map-lat' ), $el.data( 'map-lng' ) ),
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: false
  };
 
  // create map
  var map = new google.maps.Map( $el[0], args);
  
  map.data.loadGeoJson('/wp-content/themes/scout-realty/assets/js/vendor/neighborhoods/neighborhoods.' + $el.data( 'map-neighborhood' ) + '.geojson');
  
  map.setOptions( { styles: mapStyles });
  
  var featureStyle = {
    fillColor: '#FF4338',
    strokeWeight: 0
  }
  map.data.setStyle(featureStyle);
  
 
  // center map
  //zoom( map );
 
}


/**
 * Update a map's viewport to fit each geometry in a dataset
 * @param {google.maps.Map} map The map to adjust
 */
function zoom(map) {
  var bounds = new google.maps.LatLngBounds();
  map.data.forEach(function(feature) {
    
    processPoints(feature.getGeometry(), bounds.extend, bounds);
    
  });
  
  //console.log( feature);

  //map.fitBounds(bounds);
}


/*
*  center_map
*
*  This function will center the map, showing all markers attached to this map
*
*  @type  function
*  @date  8/11/2013
*  @since 4.3.0
*
*  @param map (Google Map object)
*  @return  n/a
*/
 
function center_map( map ) {
 
  // vars
  var bounds = new google.maps.LatLngBounds();
 
  // loop through all markers and create bounds
  $.each( map.markers, function( i, marker ){
 
    var latlng = new google.maps.LatLng( marker.position.lat(), marker.position.lng() );
 
    bounds.extend( latlng );
 
  });
 
  // only 1 marker?
  if( map.markers.length == 1 )
  {
    // set center of map
      map.setCenter( bounds.getCenter() );
      map.setZoom( 16 );
  }
  else
  {
    // fit to bounds
    map.fitBounds( bounds );
  }
 
}
 