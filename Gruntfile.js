module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            js:{
                src:['js/plugins.js', 'js/main.js', 'js.metronomeworker.js'],
                dest:'dist/js/global.js'
            }
            // 2. Configuration for concatinating files goes here.
        },
        less: {
            core:{
            src: 'less/main.less',
            dest: 'dist/css/main.css'
            }
        },
        watch: {
            scripts: {
                files : ['js/*.js', 'less/*.less'],
                tasks : ['concat', 'less'],
                options : {
                    spawn: false,
                    livereload: true
                }
            }
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['concat', 'less']);

};