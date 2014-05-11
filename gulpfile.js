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
    jshint = require('gulp-jshint'),
    svgmin = require('gulp-svgmin'),
    inject = require('gulp-inject'),
    path = require('path'),
    gutil = require('gulp-util')
    filesize = require('gulp-filesize');

function extname (file) {
  return path.extname(file).slice(1);
}

function transform(filepath) {
  filepath = path.relative('./build', filepath);
  switch(extname(filepath)) {
    case 'css':
      return '<link rel="stylesheet" href="' + filepath + '">';
    case 'js':
      return '<script src="' + filepath + '"></script>';
    case 'html':
      return '<link rel="import" href="' + filepath + '">';
  }
}

gulp.task('sass', function(){
  return gulp.src('src/sass/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('build/css'))
    .pipe(minifyCSS())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(livereload())
    .on('error', gutil.log);
});

gulp.task('scripts', function() {
  return gulp.src('src/js/main.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production,
      transform : ['browserify-hogan']
    }))
    .pipe(jshint())
    .pipe(gulp.dest('build/js/'))
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('build/js/'))
    .pipe(livereload())
    .on('error', gutil.log);
});

gulp.task('svg', function(){
  return gulp.src('assets/images/*.svg')
    .pipe(svgmin())
    .pipe(gulp.dest('build/images/'))
    .on('error', gutil.log);
});

gulp.task('html-debug', function(){
  gulp.src('./src/index.html')
    .pipe(inject(gulp.src(['build/js/main.js', 'build/css/main.css'],
      {read: false}), {
        addRootSlash: false,
        transform: transform
      }))
    .pipe(gulp.dest("./build"))
    .pipe(livereload())
    .on('error', gutil.log);
});

gulp.task('html-debug', function(){
  gulp.src('./src/index.html')
    .pipe(inject(gulp.src(['build/js/main.js', 'build/css/main.css'],
      {read: false}), {
        addRootSlash: false,
        transform: transform
      }))
    .pipe(gulp.dest("./build"))
    .pipe(livereload())
    .on('error', gutil.log);
});

gulp.task('html-production', function(){
  gulp.src('./src/index.html')
    .pipe(inject(gulp.src(['build/js/main.min.js', 'build/css/main.min.css'],
      {read: false}), {
        addRootSlash: false,
        transform: transform
      }))
    .pipe(gulp.dest("./build"))
    .pipe(livereload())
    .on('error', gutil.log);
});

gulp.task('default', ['sass', 'scripts', 'svg', 'html-debug'], function() {
  // Start to watch the files
  gulp.watch('src/sass/**/*.scss', ['sass']);
  gulp.watch(['src/js/**.js', 'src/templates/**.html'], ['scripts']);
  gulp.watch('src/index.html', ['html-debug']);
  gulp.watch('assets/images/*.svg', ['svg']);
});

gulp.task('production', ['sass', 'scripts', 'svg', 'html-production']);
