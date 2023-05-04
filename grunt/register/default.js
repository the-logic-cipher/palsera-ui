module.exports = function(grunt) {
    grunt.registerTask('default', ['less:vendors', 'less:dev', 'sails-linker', 'watch']);
};
