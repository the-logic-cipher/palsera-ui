/**
 * Minify files with UglifyJS.
 *
 * ---------------------------------------------------------------
 *
 * Minifies client-side javascript `assets`.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-uglify
 *
 */
module.exports = function (grunt) {

    grunt.config.set('uglify', {
        dist: {
            src: ['build/assets/js/concat/production.js'],
            dest: 'build/assets/js/concat/production.js',
          },
      });

    grunt.loadNpmTasks('grunt-contrib-uglify');
  };
