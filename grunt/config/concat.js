/**
 * Concatenate files.
 *
 * ---------------------------------------------------------------
 *
 * Concatenates files javascript and css from a defined array. Creates concatenated files in
 * .tmp/public/contact directory
 * [concat](https://github.com/gruntjs/grunt-contrib-concat)
 *
 * For usage docs see:
 *      https://github.com/gruntjs/grunt-contrib-concat
 */
module.exports = function (grunt) {

    grunt.config.set('concat', {
        css: {
            src: ['build/assets/vendor/**/*.css', 'build/assets/css/**/*.css'],
            dest: 'build/assets/css/concat/production.css',
          },
        js: {
            src: ['build/assets/js/**/*.js', '!build/assets/js/local.js', 'build/modules/**/*.js'],
            dest: 'build/assets/js/concat/production.js',
          },
        build: {
            src: ['build/assets/js/local.js', 'build/assets/vendor/jquery/jquery.min.js', 'build/assets/vendor/angular/angular.min.js', 'build/assets/vendor/angular/**/*.js', '!build/assets/vendor/angular/angular.js', 'build/assets/vendor/checklistModel/checklist-model.js', 'build/assets/vendor/sugar/sugar.min.js'],
            dest: 'build/assets/js/concat/dependencies.js',
          },
      });

    grunt.loadNpmTasks('grunt-contrib-concat');
  };
