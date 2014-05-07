var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    path = require('path'),
    minifyCSS = require('gulp-minify-css'),
    rename = require("gulp-rename"),
    livereload = require('gulp-livereload'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat-sourcemap'),
    browserify = require('gulp-browserify'),
    livereload = require('gulp-livereload'),
    jshint = require('gulp-jshint');

gulp.task('html', function(){
  return gulp.src('index.html')
    .pipe(livereload());
});

gulp.task('sass', function(){
  return gulp.src('src/sass/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('assets/css'))
    .pipe(livereload());
});

gulp.task('scripts', function() {
  return gulp.src('src/js/main.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production,
      transform : ['browserify-hogan']
    }))
    .pipe(jshint())
    .pipe(gulp.dest('assets/js/'))
    .pipe(livereload());
});

gulp.task('default', ['sass', 'scripts', 'html'], function() {
  // Start to watch the files
  gulp.watch('src/sass/**/*.scss', ['sass']);
  gulp.watch(['src/js/**.js', 'src/templates/**.html'], ['scripts']);
  gulp.watch('index.html', ['html']);
});
