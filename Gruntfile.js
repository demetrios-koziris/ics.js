module.exports = function(grunt) {

  var ics_dir = '.';
  var filesaver_dir = './node_modules/file-saver';
  var blob_dir = './node_modules/blob';

  grunt.initConfig({
    config: {
      ics: {
        dir: ics_dir,
        src: ics_dir+'/ics.js',
        pkg: grunt.file.readJSON(ics_dir+'/package.json')
      },
      filesaver: {
        dir: filesaver_dir,
        src: filesaver_dir+'/dist/FileSaver.js',
        pkg: grunt.file.readJSON(filesaver_dir+'/package.json')
      },
      blob: {
        dir: blob_dir,
        src: blob_dir+'/Blob.js',
        pkg: grunt.file.readJSON(blob_dir+'/package.json')
      }
    },
    concat: {
      ics: {
        options: {
          separator: ';\n\n',
          banner: '/*! <%= config.ics.pkg.name %> <%= config.ics.pkg.version %> <%= grunt.template.today() %> */\n'
        },
        files: {
          'build/ics.js': ['<%= config.ics.src %>']
        }
      },
      ics_deps: {
        options: {
          separator: ';\n\n',
          banner: '/*! <%= config.ics.pkg.name %> <%= config.ics.pkg.version %> <%= grunt.template.today() %> */\n' +
                  '/*! <%= config.filesaver.pkg.name %> <%= config.filesaver.pkg.version %> <%= grunt.template.today() %> */\n' +
                  '/*! <%= config.blob.pkg.name %> <%= config.blob.pkg.version %> <%= grunt.template.today() %> */\n\n'
        },
        files: {
          'build/ics.deps.js': ['<%= config.ics.src %>', '<%= config.filesaver.src %>', '<%= config.blob.src %>']
        }
      }
    },
    uglify: {
      ics: {
        options: {
          banner: '/*! <%= config.ics.pkg.name %> <%= config.ics.pkg.version %> <%= grunt.template.today() %> */\n\n'
        },
        files: {
          'build/ics.min.js': ['build/ics.js'] 
        }
      },
      ics_deps: {
        options: {
        banner: '/*! <%= config.ics.pkg.name %> <%= config.ics.pkg.version %> <%= grunt.template.today() %> */\n' +
                '/*! <%= config.filesaver.pkg.name %> <%= config.filesaver.pkg.version %> <%= grunt.template.today() %> */\n' +
                '/*! <%= config.blob.pkg.name %> <%= config.blob.pkg.version %> <%= grunt.template.today() %> */\n\n'        },
        files: {
          'build/ics.deps.min.js': ['build/ics.deps.js'] 
        }
      }
    },
    copy: {
      to_demo: {
        files: [{
          src: 'build/ics.deps.js',
          dest: 'demo/ics.deps.js'
        }]
      }    
    },
    mocha: {
        all: {
            src: ['test/index.html'],
            options: {
                run: true,
                log: true
                // urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/index.html']
            }
        }
    },
    jshint: {
      files: ['Gruntfile.js', 'ics.js', 'test/spec/test.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true,
        },
        laxcomma: true
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'mocha']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');


  grunt.registerTask('test', ['jshint', 'mocha']);

  grunt.registerTask('default', ['jshint', 'mocha', 'concat:ics', 'uglify:ics', 'concat:ics_deps', 'uglify:ics_deps', 'copy:to_demo']);

};