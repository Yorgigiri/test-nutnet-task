"use strict";
const gulp = require("gulp");
const concat = require("gulp-concat");
const sass = require("gulp-sass");
const source = require("vinyl-source-buffer");
const buffer = require("vinyl-buffer")
const browserify = require("browserify");
const watch = require("gulp-watch");
const merge = require("merge-stream");
const babelify = require("babelify");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const cssnano = require("gulp-cssnano");
const uglify = require('gulp-uglify-es').default;
const util = require("gulp-util");
const imagemin = require("gulp-imagemin");
const spritesmith = require("gulp.spritesmith");
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const changed = require("gulp-changed");
const pug = require('gulp-pug');

const autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];

gulp.task("browser-sync", function () {
    // Таск для запуска локального сервера

    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
    });

});

gulp.task("clean", function () {
    // Очищаем папку dist

    return gulp.src("dist", {
            read: false
        })
        .pipe(clean())
        .on("error", util.log);

});

gulp.task('pug', function buildHTML() {
    return gulp.src('assets/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('dist/'))
        .on("error", util.log)
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task("fonts", function () {
    // Перемещаем файлы шрифтов из assets/fonts в dist/fonts 

    return gulp.src("assets/fonts/**/*.*")
        .pipe(gulp.dest("dist/fonts/"))
        .on("error", util.log);

});

gulp.task("images", function () {
    // Прогоняем все картинки из assets через оптимизатор и отправляем в папку dist/img

    gulp.src(["assets/img/**/*.*", "!assets/img/sprite/*.*"])
        /* .pipe(imagemin([
            imagemin.jpegtran({
                interlaced: true,
                progressive: true,
                optimizationLevel: 5,

            })
        ], {
            verbose: true
        })) */
        .pipe(gulp.dest("dist/img/"))
        .on("error", util.log);

});

gulp.task("sprite", function () {
    // Генерируем спрайт

    var spriteData = gulp.src("assets/img/sprite/*.png").pipe(spritesmith({
        imgName: "../img/sprite/sprite.png",
        cssName: "_sprite.scss"
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
        // DEV: We must buffer our stream into a Buffer for `imagemin`
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest("./dist/img/"))
        .on("error", util.log);

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(gulp.dest("./assets/scss/partials/"))
        .on("error", util.log);

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);

});

gulp.task("js:serve", function () {
    // Таск для кастомных js файлов во время работы локального сервера

    var b = browserify({
        entries: "assets/js/custom/main.js",
        debug: true,
        transform: babelify.configure({
            presets: ["es2015"]
        })
    });

    return b.bundle()
        .pipe(source("main.min.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .on("error", util.log)
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("dist/js/"))
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task("js_libs", function () {
    // Таск для создания js файла с библиотеками

    return gulp.src("./assets/js/lib/*.js")
        .pipe(concat("lib.js", {
            newLine: ";"
        }))
        .pipe(uglify())
        .pipe(rename("lib.min.js"))
        .pipe(gulp.dest("./dist/js/"))
        .on("error", util.log);

});

gulp.task("sass:serve", function () {
    // Таск для компиляции scss файлов в css с сорсмапами с запущенным локальным сервером

    return gulp.src(["./assets/scss/*.scss", "!./assets/scss/sprite.scss"])
        .pipe(changed("dist/css"))
        .pipe(sourcemaps.init())
        .pipe(sass({
                includePaths: require("node-normalize-scss").includePaths
            })
            .on("error", sass.logError)
        )
        .pipe(autoprefixer({
            browsers: autoprefixerList
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./dist/css/"))
        .on("error", util.log)
        .pipe(browserSync.reload({
            stream: true
        }));

});

gulp.task("js:build", function () {
    // Таск билда js файла без сорс мапов для продакшена

    return browserify({
            entries: "assets/js/custom/main.js"
        })
        .transform(babelify, {
            presets: ["es2015"]
        })
        .bundle()
        .pipe(source("main.min.js"))
        .pipe(gulp.dest("dist/js"))
        .on("error", util.log);

});

gulp.task("sass:build", function () {
    // Таск билда js файла без сорс мапов для продакшена

    return gulp.src("./assets/scss/*.scss")
        .pipe(sass({
            includePaths: require("node-normalize-scss").includePaths
        }).on("error", sass.logError))
        .pipe(autoprefixer({
            browsers: ["last 8 versions"],
            cascade: false
        }))
        .pipe(cssnano())
        .pipe(gulp.dest("./dist/css/"))
        .on("error", util.log);

});

gulp.task("watch", function () {
    gulp.watch(["./assets/img/sprite/*.png"], ["sprite"]);
});

gulp.task("serve", ["pug", "fonts", "images", "sprite", "watch", "browser-sync"], function () {
    // Таск со всеми вотчерами (Следим за файлами - в случае каких либо изменений запускаем соответствующие таски)

    gulp.watch("./assets/scss/**/*.scss", ["sass:serve"]);
    gulp.watch("./assets/js/custom/**/*.js", ["js:serve"]);
    gulp.watch("./assets/js/lib/**/*.js", ["js_libs"]);
    gulp.watch("./assets/*.html", ["html"]);
    gulp.watch('./assets/pug/**/*.pug', ['pug']);
    gulp.watch("./dist/*.html").on("change", browserSync.reload);
    gulp.watch("./dist/js/*.js").on("change", browserSync.reload);
    gulp.watch("./dist/css/*.css").on("change", browserSync.reload);
    gulp.watch(["./assets/img/*.*", "!./assets/img/sprite/*.png"], ["images"]);

});

gulp.task("build", ["fonts", "sprite", "images", "pug", "sass:build", "js:build", "js_libs"]);
gulp.task("default", ["serve"]);