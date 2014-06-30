<?php
// ===================================================
// Load database info and local development parameters
// ===================================================
if ( file_exists( dirname( __FILE__ ) . '/local-config.php' ) ) {
	define( 'WP_LOCAL_DEV', true );
	define('WP_CACHE', false); // Added by W3 Total Cache
	include( dirname( __FILE__ ) . '/local-config.php' );
} else {
	define( 'WP_LOCAL_DEV', false );
	define( 'DB_NAME', '%%DB_NAME%%' );
	define( 'DB_USER', '%%DB_USER%%' );
	define( 'DB_PASSWORD', '%%DB_PASSWORD%%' );
	define( 'DB_HOST', '%%DB_HOST%%' ); // Probably 'localhost'
}

// ========================
// Custom Content Directory
// ========================
define( 'WP_CONTENT_DIR', dirname( __FILE__ ) . '/content' );
define( 'WP_CONTENT_URL', 'http://' . $_SERVER['HTTP_HOST'] . '/content' );

// ================================================
// You almost certainly do not want to change these
// ================================================
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

// ==============================================================
// Salts, for security
// Grab these from: https://api.wordpress.org/secret-key/1.1/salt
// ==============================================================
define('AUTH_KEY',         '9 ^V42`:di-)6u$-s#eN :2NwCW1V~YSo|ey`5g8TDF UG?b*X+ipuD$ftv+F>)z');
define('SECURE_AUTH_KEY',  'k}ul^?G&|yZi GAirOn!OHpY ]V|wI/g3Rc@iB6LZ+z+*D$*%4D/x6pxT1>2mHxo');
define('LOGGED_IN_KEY',    'Pu-=w9^4sw5h}:4`~t1Zr`H5}PD.9e#w)r+^Mzb,Af%L]KH,P[ZyE2Qs_cwT7-|*');
define('NONCE_KEY',        ']*F[(uLk`:D6W -D3JRV-M`XVGhy+PSBY<:I;iaBKRz(-^N]#.-J=o sF:bp+a&)');
define('AUTH_SALT',        'V9dhzuY~x=0M@0y7*Xg-;MO.bGG*r>>{jVC_wk.8YBk_}:0|eP%^XL*~h=~(un(P');
define('SECURE_AUTH_SALT', 'I4QUE]Fe^ANCJn>iu92lMl3n3Mf/&jNiDlwhZ>P+m=Z10_N82k8u.]R[NxV}=Pds');
define('LOGGED_IN_SALT',   'M9:,nrXO2D<(=<_2tO22aa{p9BsN0$!=X1-#VzHs99AO%>,Sbkmb_.u8/C-Cc)z~');
define('NONCE_SALT',       'zR&*P|bv%^FBu;.yp}E*uW5>csrrmjo&l2ZdGsw60uf`HD?#@;G:6.-1!ySr;3|S');

// ==============================================================
// Table prefix
// Change this if you have multiple installs in the same database
// ==============================================================
$table_prefix  = 'scout_wp_';

// ================================
// Language
// Leave blank for American English
// ================================
define( 'WPLANG', '' );

// ===========
// Hide errors
// ===========
ini_set( 'display_errors', 0 );
define( 'WP_DEBUG_DISPLAY', false );

// =================================================================
// Debug mode
// Debugging? Enable these. Can also enable them in local-config.php
// =================================================================
// define( 'SAVEQUERIES', true );
// define( 'WP_DEBUG', true );

// ======================================
// Load a Memcached config if we have one
// ======================================
if ( file_exists( dirname( __FILE__ ) . '/memcached.php' ) )
	$memcached_servers = include( dirname( __FILE__ ) . '/memcached.php' );

// ===========================================================================================
// This can be used to programatically set the stage when deploying (e.g. production, staging)
// ===========================================================================================
define( 'WP_STAGE', '%%WP_STAGE%%' );
define( 'STAGING_DOMAIN', '%%WP_STAGING_DOMAIN%%' ); // Does magic in WP Stack to handle staging domain rewriting

// ===================
// Bootstrap WordPress
// ===================
if ( !defined( 'ABSPATH' ) )
	define( 'ABSPATH', dirname( __FILE__ ) . '/wp/' );
require_once( ABSPATH . 'wp-settings.php' );
