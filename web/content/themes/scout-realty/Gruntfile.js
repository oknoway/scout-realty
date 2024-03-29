'use strict';

module.exports = function( grunt ) {

  // Load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration
  grunt.initConfig( {
    pkg: grunt.file.readJSON( 'package.json' ),
    dirs: {
      bower: './bower_components',
      assets: './assets',
      css: '<%= dirs.assets %>/css',
      sass: '<%= dirs.css %>/sass',
      js: '<%= dirs.assets %>/js',
      img: './img',
      vendor: '<%= dirs.assets %>/vendor'
    },
    bower: {
      install: {
        options: {
          cleanup: true,
          copy: true,
          install: true,
          layout: 'byType',
          targetDir: '<%= dirs.vendor %>'
        }
      }
    },
    copy: {
      vendor: {
        files: [{
         expand: true,
         flatten: true,
         src: [
           '<%= dirs.vendor %>/scss/background-size-polyfill/*',
           '<%= dirs.vendor %>/js/selectivizr/*'
         ],
         dest: '<%= dirs.js %>/vendor/' 
        }]
      }
    },
    svgmin: {
      options: {
        plugins: [
          { removeViewBox: true },
          { removeUselessStrokeAndFill: true }
        ],
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= dirs.img %>/src',
          src: ['**/*.svg'],
          dest: '<%= dirs.img %>/',
          ext: '.svg'
        }]
      }
    },
    svg2png: {
      all: {
        files: [{
          cwd: '<%= dirs.img %>/',
          src: ['*.svg'],
          dest: '<%= dirs.img %>/src/'
        }]
      }
    },
    image: {
      src: {
        files: [{
          expand: true,
          cwd: '<%= dirs.img %>/src',
          src: ['**/*.{png,jpg,gif,jpeg}'],
          dest: '<%= dirs.img %>/'
        }]
      }
    },
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          ' * <%= pkg.homepage %>\n' +
          ' * Copyright (c) <%= grunt.template.today("yyyy") %>;' +
          ' */\n'
      },
      head: {
        src: [
          '<%= dirs.vendor %>/js/modernizr/modernizr.js',
          '<%= dirs.js %>/src/head.js'
        ],
        dest: '<%= dirs.js %>/head.js'
      },
      scout_realty: {
        src: [
          '<%= dirs.vendor %>/js/responsive-nav/responsive-nav.js',
          '<%= dirs.vendor %>/js/slick-carousel/slick.js',
          '<%= dirs.vendor %>/js/fitvids/jquery.fitvids.js',
          '<%= dirs.js %>/src/maps.js',
          '<%= dirs.js %>/src/scout_realty.js'
        ],
        dest: '<%= dirs.js %>/scout_realty.js'
      },
      oldIE : {
        src: [
        
        ],
        dest: '<%= dirs.js %>/ie.js'
      }
    },
    jshint: {
      browser: {
        all: [
          '<%= dirs.js %>/src/*.js',
          '<%= dirs.js %>/test/**/*.js'
        ],
        options: {
          jshintrc: '.jshintrc'
        }
      },
      grunt: {
        all: [
          'Gruntfile.js'
        ],
        options: {
          jshintrc: '.gruntjshintrc'
        }
      }
    },
    uglify: {
      all: {
        files: {
          '<%= dirs.js %>/head.min.js': ['<%= dirs.js %>/head.js'],
          '<%= dirs.js %>/scout_realty.min.js': ['<%= dirs.js %>/scout_realty.js']
        },
        options: {
          banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %>;' +
            ' */\n',
          mangle: {
            except: ['jQuery']
          }
        }
      }
    },
    test:  {
      files: ['<%= dirs.js %>/test/**/*.js']
    },
    sass:  {
      options: {
        compass: false,
        loadPath: [
          '<%= dirs.vendor %>',
          '<%= dirs.vendor %>/scss'
        ]
      },
      all: {
        files: {
          '<%= dirs.css %>/scout_realty.css': '<%= dirs.sass %>/scout_realty.scss'
        }
      }
    },
    autoprefixer: {
      options: {
        browsers: [ 'last 2 version', 'ie 8', 'ie 9', 'Android 4' ]
      },
      scout_realty : {
        src: '<%= dirs.css %>/scout_realty.css'
      }
    },
    cssmin: {
      options: {
        banner: '/*! <%= pkg.title %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          ' * <%= pkg.homepage %>\n' +
          ' * Copyright (c) <%= grunt.template.today("yyyy") %>;' +
          ' */\n'
      },
      minify: {
        expand: true,
        
        cwd: '<%= dirs.css %>/',
        src: ['scout_realty.css'],
        
        dest: '<%= dirs.css %>/',
        ext: '.min.css'
      }
    },
    watch:  {
      options: {
        atBegin: false
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      sass: {
        files: ['<%= dirs.sass %>/**/*.scss'],
        tasks: ['sass', 'autoprefixer', 'cssmin']
      },
      scripts: {
        files: ['<%= dirs.js %>/src/**/*.js', '<%= dirs.vendor/**/*.js'],
        tasks: ['jshint', 'concat', 'uglify']
      },
      img: {
        files: ['<%= dirs.img %>/src/*'],
        tasks: ['images']
      },
      livereload: {
        options: {
          livereload: true,
          livereloadOnError: false
        },
        files: ['<%= dirs.css %>/*.css', '<%= dirs.js %>/*.js', '*.html','*.php','includes/*.php','partials/*.php' ]
      }
    }
   } );


  // Default task.
  grunt.registerTask( 'default', ['bower', 'copy:vendor', 'images', 'styles', 'scripts'] );

  // Process Styles.
  grunt.registerTask( 'styles', ['sass', 'autoprefixer', 'cssmin'] );

  // Process Scripts.
  grunt.registerTask( 'scripts', ['jshint', 'concat', 'uglify'] );

  // Process Images.
  grunt.registerTask( 'images', ['svgmin', 'svg2png', 'image'] );
  

  grunt.util.linefeed = '\n';
};