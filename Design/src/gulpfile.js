const gulp = require('gulp');
// const gconcat = require('gulp-concat');
// const grename = require('gulp-rename');
// const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const terser = require('gulp-terser');
// const jsonminify = require('gulp-jsonminify');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync');
const del = require('del');
const replace = require('gulp-replace');
var clean = require('gulp-clean');
var ts = require("gulp-typescript");
var tsProject = ts.createProject("./ts/tsconfig.json");

var compiledSourcesPath = './js/';
var sourcesDestination = '../../WebContent/src/';
var assetsDestination = '../../WebContent/assets/';

gulp.task('compile-ts', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(compiledSourcesPath))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(replace(/('|")use strict\1/g, ';'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(compiledSourcesPath));
});

gulp.task('build', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(compiledSourcesPath))
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(babel())
        .pipe(terser())
        .pipe(replace(/('|")use strict\1/g, ';'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(sourcesDestination));
});

gulp.task('assets', function () {
    return gulp.src([
                '../assets/**/*',
            ]
        )
        .pipe(plumber())
        .pipe(gulp.dest(assetsDestination))
        .pipe(browserSync.stream());
});

function browserOpen() {
  let cfg = {
    server: { baseDir: './../../WebContent' },
    reloadDelay: 0,
    open: true
  };
  return browserSync(cfg);
};

//gulp v3
gulp.task('bundle', ['build', 'assets']);
gulp.task('start:open', ['build', 'assets'], browserOpen);
gulp.task('open', browserOpen);

//gulp v4.0.2
// gulp.task('bundle', gulp.series('build', 'assets'));
// gulp.task('start:open', gulp.series('build', 'assets', browserOpen));
// gulp.task('open', browserOpen);