const gulp = require('gulp');
const { series, parallel, dest } = require('gulp');


const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const del = require('del');

filesPath = {
    sass: './src/sass/**/*.scss',
    js: './src/js/**/*.js',
    images: './src/img/**/*.+(png|jpg|gif|svg)',
    html: '**/*.html'
}

function sassTask(done) {
    gulp.src([filesPath.sass, '!./src/sass/widget.scss'])
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        .pipe(rename(function(path) {
            if (!path.extname.endsWith('.map')) {
                path.basename += '.min'
            }
        }))
        .pipe(dest('./dist/css'));
    done();
}


function jsTask(done) {
    gulp.src(filesPath.js)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('project.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest('./dist/js'))
    done();
}


function imagesTask(done) {
    gulp.src(filesPath.images)
        .pipe(cache(imagemin()))
        .pipe(dest('./dist/img'))
    done();
}

// Watch task with browser sync
function watchTask() {
    browserSync.init({
        server: {
            baseDir: './'
        }
        // browser: 'firefox developer edition'
    })
    // gulp.watch(
    //     [
    //         filesPath.sass,
    //         filesPath.js,
    //         filesPath.html,
    //         filesPath.images
    //     ],
    //     parallel(sassTask, jsTask, imagesTask)
    // )
    // .on('change', browserSync.reload);

    gulp.watch(filesPath.sass, gulp.task("sassTask")).on('change', browserSync.reload);
    gulp.watch(filesPath.js, gulp.task("jsTask")).on('change', browserSync.reload);
    gulp.watch(filesPath.html).on('change', browserSync.reload);
    gulp.watch(filesPath.images, gulp.task("imagesTask")).on('change', browserSync.reload);
}


function clearCache(done) {
    return cache.clearAll(done);
}

// Clean dist folder
function clean(done) {
    del(['./dist/**/*']);
    done();
}


// Gulp individual tasks
exports.sassTask = sassTask;
exports.jsTask = jsTask;
exports.imagesTask = imagesTask;
exports.watchTask = watchTask;
exports.clearCache = clearCache;
exports.clean = clean;

// Gulp serve
exports.build = parallel(sassTask, jsTask, imagesTask);

// Gulp default command
exports.default = series(exports.build, watchTask);