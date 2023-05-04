module.exports = function (grunt) {
    grunt.registerTask('build', ['clean', 'copy', 'concat:css', 'concat:js', 'cssmin', 'uglify', 'concat:build']);
  };
