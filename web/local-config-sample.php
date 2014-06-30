<?php
/*
This is a sample local-config.php file
In it, you *must* include the four main database defines

You may include other settings here that you only want enabled on your local development checkouts
*/

define( 'DB_NAME', 'local_db_name' );
define( 'DB_USER', 'local_db_user' );
define( 'DB_PASSWORD', 'local_db_password' );
define( 'DB_HOST', 'localhost' ); // Probably 'localhost'

define('WP_SITEURL', 'http://' . $_SERVER['SERVER_NAME'] );
define('WP_HOME', 'http://' . $_SERVER['HTTP_HOST'] );

define( 'WP_DEBUG', TRUE );
define( 'SCRIPT_DEBUG', TRUE );
define( 'SAVEQUERIES', TRUE );

ini_set("xdebug.var_display_max_data", "-1");
ini_set("xdebug.var_display_max_children", "-1");
ini_set("xdebug.var_display_max_depth", "-1");
