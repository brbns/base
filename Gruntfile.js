module.exports = function (grunt) {
  'use strict';

  // var ngrok = require('ngrok');
  // var mozjpeg = require('imagemin-mozjpeg');
  // var pngquant = require('imagemin-pngquant');

  var paths = {
    sourceBase   : 'src',
    buildBase    : 'build/',
    sourceAssets : 'src',
    buildAssets  : 'build/hood',
  };

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON( './package.json' ),
    paths : paths,

    // Start a local server
    connect: {
      dev: {
        options: {
          port: 8000,
          base: paths.buildBase,
          keepalive: true
        }
      }
    },
    assemble: {
      options: {
        layoutdir: '<%= paths.sourceBase %>/layouts',
        partials: ['<%= paths.sourceBase %>/templates/**/*.hbs'],
        data: ['<%= paths.sourceBase %>/web-data/**/*.{json,yml}'],
        helpers: ['<%= paths.sourceBase %>/handlebar-helpers/**/*.js'],
        layout: 'default.hbs',
        plugins: ['grunt-assemble-sitemap'],
        sitemap : {
          relativedest: true
        },
        // permalinks: {
        //   preset: "pretty"
        // }
      },
      site: {
          expand: true,     // Enable dynamic expansion.
          cwd: '<%= paths.sourceBase %>/pages',      // Src matches are relative to this path.
          src: ['**/*.hbs'], // Actual pattern(s) to match.
          dest: '<%= paths.buildBase %>'   // Destination path prefix.
      }
    },
    // Lint JS files for coventions
    jscs: {
      src : '<%= paths.sourceAssets %>/js/source/*.js',
      options : {
        config : '.jscsrc',
        fix    : false
      }
    },
    // Lint JS files
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc : true,
      },
      src : ['<%= paths.sourceAssets %>/js/source/*.js']
    },
    // Compiling javascript
    uglify: {
      dev : {
        options: {
          mangle: false,
          sourceMapIncludeSources : true,
          sourceMap: true
        },
        files: [{
          expand: true,
          cwd  :  '<%= paths.sourceAssets %>/js/source/pages',
          src  :  '*.js',
          dest : '<%= paths.buildAssets %>/js/pages'
        },{
          '<%= paths.buildAssets %>/js/vendor.min.js' : ['<%= paths.sourceAssets %>/js/vendor/jquery.js', '<%= paths.sourceAssets %>/js/vendor/*.js', '<%= paths.sourceAssets %>/js/vendor/angular/*.js'],
          '<%= paths.buildAssets %>/js/source.min.js' : ['<%= paths.sourceAssets %>/js/source/*.js'],
          '<%= paths.buildAssets %>/js/mods.min.js'   : ['<%= paths.sourceAssets %>/js/source/modules/*.js']
        }]
      },
      build : {
        options: {
          mangle: false,
          sourceMapIncludeSources : false,
          sourceMap: true,
          banner: '/*! Created by the devs at instaoffice. ' +
                  '<%= If you are curious about coding, and want to work in an environment ' +
                  ' where insane things are happning, you should join our team' +
                  'We are always looking for amazing people like you. Get in touch at developer@instaoffice.in*/',
          compress : {
            dead_code : true,
            drop_debugger : true,
            unused : true,
            join_vars : true,
            warnings : true,
            drop_console: false
          }
        },
        files: [{
          expand: true,
          cwd  :  '<%= paths.sourceAssets %>/js/source/pages',
          src  :  '*.js',
          dest : '<%= paths.buildAssets %>/js/pages'
        },{
          '<%= paths.buildAssets %>/js/vendor.min.js' : ['<%= paths.sourceAssets %>/js/vendor/jquery.js', '<%= paths.sourceAssets %>/js/vendor/*.js', '<%= paths.sourceAssets %>/js/vendor/angular/*.js'],
          '<%= paths.buildAssets %>/js/source.min.js' : ['<%= paths.sourceAssets %>/js/source/*.js'],
          '<%= paths.buildAssets %>/js/mods.min.js'   : ['<%= paths.sourceAssets %>/js/source/modules/*.js']
        }]
      }
    },
    // Lint SCSS files
    scsslint: {
      allFiles: ['<%= paths.sourceAssets %>/scss/**/*.scss', '!<%= paths.sourceAssets %>/sass/vendor/**/*.scss'],
      options: {
        config: '.scss-lint.yml',
        reporterOutput: 'scss-lint-report.xml',
        colorizeOutput: true
      },
    },
    sass: {
        options: {
            sourceMap: true
        },
        dist: {
            files: {
                '<%= paths.buildAssets %>/css/main.css': '<%= paths.sourceAssets %>/scss/main.scss'
            }
        }
    },
    cssnano: {
        options: {
          discardComments: true,
          sourcemap: false
        },
        dist: {
            files: {
                '<%= paths.buildAssets %>/css/main.css': '<%= paths.buildAssets %>/css/main.css'
            }
          }
    },
    // Remove unused CSS across multiple files
    uncss: {
      dist: {
        options: {
          ignoreSheets : [/use.typekit/]
        },
        files: {
          '<%= paths.buildAssets %>/css/main.css': ['<%= paths.buildBase %>/*.html']
        }
      }
    },
    //Clean the build folder
    clean: {
      build : paths.buildBase
    },
    // The ever epic watch statement
    watch: {
      options: {
        livereload: true,
      },
      js: {
        files: '<%= paths.sourceAssets %>/js/**/*.js',
        tasks: ['uglify:dev'],
      },
      html : {
        files: [ '<%= paths.sourceBase %>/pages/*.hbs', '<%= paths.sourceBase %>/templates/*.hbs','<%= paths.sourceBase %>/layouts/*.hbs' ],
        tasks: ['assemble'],
      },
      angularTemplates : {
        files: [ '<%= paths.sourceBase %>/templates/*.html', '<%= paths.sourceBase %>/templates/*.hbs','<%= paths.sourceBase %>/layouts/*.hbs' ],
        tasks: ['copy:angularTemplates'],
      },
      css: {
        files: '<%= paths.sourceAssets %>/scss/**/*.scss',
        tasks: ['sass'],
      },
      images : {
        files : '<%= paths.sourceAssets %>/images/**/*',
        tasks : ['copy:images']
      },
      fonts : {
        files : '<%= paths.sourceAssets %>/fonts/**/*',
        tasks : ['copy:fonts']
      },
      endpoint : {
        files : '<% paths.sourceBase %>/endpoint/**/*',
        tasks : ['copy:endpoint']
      },
      grunt: {
          files: ['Gruntfile.js']
      }
    },
    // SETS UP A BROWSERSYNC SETUP
    browserSync: {
        dev: {
            bsFiles: {
                src : [
                    '<%= paths.buildAssets %>/css/*.css',
                    '<%= paths.buildBase %>/*.html'
                ]
            },
            options: {
                watchTask: true,
                server: paths.buildBase
            }
        }
    },
    // CONVERT IMAGES TO RESPONSIVE SIZES
    responsive_images: {
      options: {
        engine : 'gm',
        newFilesOnly : true,
        upscale: false
      },
      your_target: {
        expand: true,
        src: ['images/**/*.{jpg,gif,png}'],
        cwd: '<%= paths.buildAssets %>/',
        dest: '<%= paths.buildAssets %>'
      },
    },
    //OPTIMIZE IMAGES
    tinypng: {
        options: {
            apiKey: "dtDkXCwPJxKEs6EAYziRZ-D6WcpcFUEO",
            checkSigs: true,
            sigFile: '<%= paths.sourceBase %>/file_sigs.json',
            summarize: true,
            showProgress: true,
            stopOnImageError: false
        },
        compress2: {
            expand: true,
            cwd : '<%= paths.sourceAssets %>/images/',
            src: '**/*.{png,jpg,jpeg}',
            dest : '<%= paths.sourceAssets %>/tinyImages'
        },
        src: ['<%= paths.buildAssets %>/images']
    },
    // imagemin: {
    //   options: {
    //     optimizationLevel: 3,
    //     cache: false,
    //     use: [mozjpeg(), pngquant()]
    //   },
    //   build : {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= paths.buildAssets %>/images/',
    //       src: ['**/*.{png,jpg,gif}'],
    //       dest: '<%= paths.buildAssets %>/images'
    //     }]
    //   },
    //   endpoint : {
    //     files: [{
    //       expand: true,
    //       cwd: '<%= paths.sourceBase %>/endpoint/images',
    //       src: ['**/*.{png,jpg,gif}'],
    //       dest: '<%= paths.buildBase %>/endpoint/images'
    //     }]
    //   }
    // },
    // COPY TASK
    copy: {
      build : {
        src: ['build.xml'],
        dest : paths.buildBase
      },
      images: {
        files: [{
          expand: true,
          cwd: '<%= paths.sourceAssets %>/images',
          src: ['**/*.{jpeg,jpg,png,gif,svg}'],
          dest: '<%= paths.buildAssets %>/images',
          filter: 'isFile'
        }]
      },
      angularTemplates : {
        files: [{
          expand: true,
          cwd: '<%= paths.sourceBase %>/templates',
          src: ['*.html'],
          dest: '<%= paths.buildBase %>/templates',
          filter: 'isFile'
        }]
      },
      fonts: {
        files: [{
          expand: true,
          src: ['<%= paths.sourceAssets %>/fonts/**/*'],
          dest: '<%= paths.buildAssets %>/fonts',
          filter: 'isFile',
          flatten: true
        }]
      },
      endpoint : {
        files: [{
          expand: true,
          cwd: '<%= paths.sourceBase %>/endpoint',
          src: ['**/*'],
          dest: '<%= paths.buildBase %>/endpoint',
          filter: 'isFile'
        }]
      },
      tinyImages : {
        files: [{
          expand: true,
          cwd: '<%= paths.sourceAssets %>/tinyImages',
          src: ['**/*.{jpeg,jpg,png,gif,svg}'],
          dest: '<%= paths.buildAssets %>/images',
          filter: 'isFile'
        }]
      }
    },
    // PAGE SPEED INSIGHTS BY GOOGLE
    pagespeed: {
      options: {
        key : 'AIzaSyDb6ZA37MYNjGTB4Rb_zyjLZbdwd9v_mIw',
        url : "http://instaoffice.in",
        paths: ['/index.html', '/calculator.html', '/partner.html', '/experience.html', '/about.html', '/offices.html','/design.html' ],
        locale: "en_GB",
        threshold: 80
      },
      desktop: {
        options: {
          strategy: "desktop",
        }
      },
      mobile : {
        options: {
          strategy: "mobile",
        }
      }
    },
    // GENERATE RESPONSIVE SCREENSHOTS OF WEBSITE AT VARIOUS SCREEN SIZES
    pageres: {
      multipleUrls: {
        options: {
          urls: ['localhost:3000', 'localhost:3000/calculator.html'],
          sizes: ['800x5000', '400x5000', '1290x5000', '2000x5000'],
          dest: 'screens',
        }
      }
    },
    // GENERATE DEV PERFORMANCE REPORT
    devperf: {
      options: {
        urls: [
          'http://wofro.work'
        ]
      }
    },
    //BRANCH CONFIGURATIONS
    'gh-pages': {
      build : {
        options: {
          base: 'build',
          branch: 'build'
        },
        src: ['**']
      },
      staging : {
        options: {
          base: 'build',
          branch: 'staging'
        },
        src: ['**']
      },
      demo : {
        options: {
          base: 'build',
          branch: 'demo'
        },
        src: ['**']
      }
    },
    // Cloudinary for image
    cloudinary: {
      options: {
        removeVersion: true,
        roots: ['<%= paths.buildAssets %>/images', '<%= paths.buildAssets %>/'],
        mappingFile: '<%= paths.sourceBase %>/cloudinary/uploaded-images.json'
      },
      css: {
        expand: true,
        cwd: '<%= paths.buildBase %>',
        src: [
          'gurgaon-iris-tech-park-sohna-road.html',
          'instaoffice-gurgaon-golf-course.html',
          'gurgaon-nirvana-courtyard-sohna-road.html',
          'hyderabad-tea-trails-banjara-hills.html',
          'dlf-cyber-city-gurgaon.html',
          'offices.html',
          'jobs.html'
        ],
        dest: '<%= paths.buildBase %>',
      }
    }
  });

  // Register customer task for ngrok
  /*grunt.registerTask('psi-ngrok', 'Run pagespeed with ngrok', function() {
    var done = this.async();
    var port = 3000;

    ngrok.connect(port, function(err, url) {
      if (err !== null) {
        grunt.fail.fatal(err);
        return done();
      }
      grunt.config.set('pagespeed.options.url', url);
      grunt.task.run('pagespeed');
      done();
    });
  });*/

  /* grunt tasks */
  grunt.registerTask( 'dev', [ 'clean','sass', 'copy', 'assemble', 'uglify:dev','browserSync','watch' ] );

  // Build task
  grunt.registerTask( 'build', [ 'sass', 'copy', 'assemble', 'cloudinary', 'cssnano', 'uglify:build', 'gh-pages:build' ] );

  // Staging task
  grunt.registerTask( 'staging', [ 'sass', 'copy', 'assemble', 'cssnano', 'uglify:build', 'gh-pages:staging' ] );

  // Staging task
  grunt.registerTask( 'demo', [ 'sass', 'copy', 'assemble', 'cssnano', 'uglify:build', 'gh-pages:demo' ] );


  // Metrics task
  // grunt.registerTask( 'metric', [ 'psi-ngrok', 'pageres', 'devperf' ] );

  grunt.registerTask( 'cloudinary-img', [ 'cloudinary' ] );

  grunt.registerTask( 'firebase-upload', [ 'firebase' ] );

};
