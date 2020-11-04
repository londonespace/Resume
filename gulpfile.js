const { src, dest, parallel, series, watch } = require('gulp');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const imageMin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

//BROWSER 'SYNC'

function initBrowserSync() {
  browserSync.init({
    server: { baseDir: 'app' },
    notify: false,
    open: false,
    startPath: './'
  });
}

// STYLES

let styleModules = [
  'app/sass/config.sass',
  'app/sass/custom/*.sass'
];

function buildAppStyles() {
  return src(styleModules)
    .pipe(sourcemaps.init())
    .pipe(concat('styles.min.sass'))
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(dest('app/css/'))
    .pipe(browserSync.stream());
}

function buildDistStyles() {
  return src(styleModules)
    .pipe(concat('styles.min.sass'))
    .pipe(sass())
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(cleanCSS(({ level: { 1: { specialComments: 0 } }/*, format: 'beautify'*/ })))
    .pipe(dest('app/css/'));
}

//IMAGES

function minimazeImages() {
  return src('app/img/**/*')
    .pipe(newer('dist/img/**/*'))
    .pipe(imageMin())
    .pipe(dest('dist/img/'));
}

function cleanMinImages() {
  return del('dist/img/**/*', { force: true });
}

// BUILD

function buildCopy() {
  return src([
    'app/index.html',
    'app/css/*.min.css',
    'app/img/*/**',
    'app/fonts/*.woff2'
  ], { base: 'app' })
    .pipe(dest('dist'));
}

function cleanDist() {
  return del('dist/**/*', { force: true });
}

// WATCH

function startWatching() {
  watch('app/index.html').on('change', browserSync.reload);
  watch(styleModules, buildAppStyles);
}

exports.initBrowserSync = initBrowserSync;
exports.styles = buildAppStyles;

exports.minimazeImages = minimazeImages;
exports.cleanMinImages = cleanMinImages;

exports.build = series(cleanDist, buildDistStyles, buildCopy, minimazeImages);

exports.default = parallel(buildAppStyles,
  series(initBrowserSync, browserSync.reload), startWatching);