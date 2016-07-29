/*global module:false*/
module.exports = function(grunt) {

  var packagejson = grunt.file.readJSON('package.json');
  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: packagejson,
    banner: '/*\n * <%= pkg.title || pkg.name %> v<%= pkg.version %> | JavaScript Heatmap Library\n *\n * Copyright 2008-2014 Patrick Wied <heatmapjs@patrick-wied.at> - All rights reserved.\n * Dual licensed under MIT and Beerware license \n *\n * :: <%= grunt.template.today("yyyy-mm-dd HH:MM") %>\n */\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>'+';(function (name, context, factory) {\n\n  // Supports UMD. AMD, CommonJS/Node.js and browser context\n  if (typeof module !== "undefined" && module.exports) {\n    module.exports = factory();\n  } else if (typeof define === "function" && define.amd) {\n    define(factory);\n  } else {\n    context[name] = factory();\n  }\n\n})("h337", this, function () {\n',
        footer: '\n\n});'
      },
      dist: {
        src: packagejson.buildFiles,
        dest: 'build/heatmap.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: true,
        compress: false, //compress must be false, otherwise behaviour change!!!!!
        beautify: false
      },
      dist: {
        src: 'build/heatmap.js',
        dest: 'build/heatmap.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      dist: {
        files: packagejson.buildFiles,
        tasks: ['concat', 'jshint', 'uglify']
      }
    },
    copy: {
      npmPreRelease: {
        files: [
          { flatten: true, expand: true, src: 'build/*', dest: 'dist/' },
          { expand:true, src: 'build/*/**', dest: 'dist/' },
          { expand:true, src: 'examples/*/**', dest: 'dist/' },
          { expand: true, src: 'docs/*/**', dest: 'dist/' },
          { src: 'package.json', dest: 'dist/' },
          { src: 'LICENSE', dest: 'dist/' },
          { src: 'README.md', dest: 'dist/' }
        ]
      }
    },
    shell: {
      npmRelease: {
        command: [
          'cd dist',
          'npm publish'
        ].join('&&')
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');


  // Default task.
  grunt.registerTask('default', ['concat', 'jshint', 'uglify', 'watch']);
  grunt.registerTask('publishToNpm', ['concat', 'jshint', 'uglify', 'copy:npmPreRelease', 'shell:npmRelease']);
};
