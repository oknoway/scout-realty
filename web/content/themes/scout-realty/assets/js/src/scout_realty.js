/**
 * Scout Realty
 * http://scoutrealty.com
 *
 * Copyright (c) 2014 Nate Bedortha at OK/No Way
 */

 ( function( window, undefined ) {
	'use strict';
    var $ = jQuery;
  
    // responsive nav
    var navigation = responsiveNav( '#site-navigation', {
      label: 'Menu',
      insert: 'before',
      openPos: 'absolute',
      open: function() {
        jQuery('.nav-toggle').addClass('opened');
      },
      close: function() {
        jQuery('.nav-toggle').removeClass('opened');
      }
    });
  
  
    // Maps
    $( '.neighborhood-map' ).each( function() {
      
      
      render_map( $(this) );
      
      
      /*
      // Leaflet: this actually works
      var map = L.map( $(this).attr('ID') ).setView([ $(this).data( 'leaflet-lat' ), $(this).data( 'leaflet-lng' )], $(this).data( 'leaflet-zoom_level' ) );
      var tiles = new L.StamenTileLayer( 'terrain' );
      
      map.addLayer( tiles );
/*
      // Leaflet: this does not
    	  var shpfile = new L.Shapefile('congress.zip');
         shpfile.addTo(m);
         shpfile.once("load", function(){
          console.log("finished loaded shapefile");
         });
         
         
      // Leaflet: neither does this
         
var m = L.map( $(this).attr('ID') ).setView([ $(this).data( 'leaflet-lat' ), $(this).data( 'leaflet-lng' ) ], $(this).data( 'leaflet-zoom_level' ) );
        var watercolor = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',{attribution:'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(m);    
      */
      
      
      
      
      
  
    });
    
    // Lazy Loading
    
    $( '.delayed' ).each( function( ) {
      
      //console.log( $(this).data( 'delayed-background-image' ) );
      
      $(this).css( 'background-image', 'url(' + $(this).data( 'delayed-background-image' ) + ')' );
    });
    
    
    // Gallery
    $( '.gallery' ).slick({
      'autoplay' : false,
      'autoplaySpeed' : 3000,
      'arrows' : true,
      'dots' : false,
      'draggable' : false,
      'infinite' : true,
      'slide' : 'figure'
    });
    
    // FitVids
    $('.article-content').fitVids();
  
    // Select onChange
    $('select.post-filter').change( function() {
      $(this).parents('form').submit();
    });

 } )( this );