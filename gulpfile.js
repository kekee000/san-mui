/**
 * @file build
 * @author ielgnaw(wuji0223@gmail.com)
 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const babelHelpers = require('gulp-babel-external-helpers');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');
const path = require('path');

gulp.task('babel', () => {
    return gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(babelHelpers('babelHelpers.js', 'umd'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('lib'));
});

gulp.task('stylus-compile', () => {
    const rider = require('rider');
    const postcss = require('gulp-postcss');
    const autoprefixer = require('autoprefixer');

    return gulp.src('src/index.styl')
        .pipe(stylus({
            use: function (style) {
                // style.include(path.join(__dirname, 'node_modules'));
                style.define('url', stylus.stylus.resolver());
                style.use(rider());
            },
            compress: false
        }))
        .pipe(postcss([autoprefixer({
            browsers: [
                'iOS >= 7',
                'Android >= 4.0',
                'ExplorerMobile >= 10',
                'ie >= 9'
            ]
        })]))
        .pipe(gulp.dest('lib'))
        .pipe(gulp.dest('es'));
});

gulp.task('stylus-source', () => {
    return gulp.src('src/**/*.styl')
        .pipe(gulp.dest('lib'))
        .pipe(gulp.dest('es'));
});

gulp.task('font', () => {
    return gulp.src('src/**/font/*')
        .pipe(gulp.dest('lib'))
        .pipe(gulp.dest('es'));
});

gulp.task('es6Module', () => {
    return gulp.src('src/**/*.js').pipe(gulp.dest('es'));
});

gulp.task('build', [
    'babel', 'stylus-compile',
    'stylus-source', 'font',
    'es6Module'
]);

gulp.task('clean', () => {
    return gulp.src('lib', {read: false}).pipe(clean());
});

gulp.task('rebuild', ['clean', 'build']);

gulp.task('sync-md-font', () => {

    return gulp
        .src([
            './node_modules/material-design-icons/iconfont/MaterialIcons-Regular.*',
            './node_modules/material-design-icons/iconfont/codepoints'
        ])
        .pipe(gulp.dest('./src/common/font/'));

});
