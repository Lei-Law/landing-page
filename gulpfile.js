const {src, dest, parallel, series, watch: monitor} = require('gulp'),
    fs =  require('fs'),
    del = require('del'),
    browsersync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    fileinclude = require('gulp-file-include'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    groupmedia = require('gulp-group-css-media-queries'),
    cleancss = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    babel = require('gulp-babel'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require('gulp-webp-css'),
    svgsprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require('gulp-fonter');


// ПАПКИ ИСТОЧНИКА И ГОТОВОГО ПРОЕКТА
const srcFolder = 'src';
const buildFolder = 'dist';


// ОСНОВНЫЕ ПУТИ
const paths = {
    src: {
        html: srcFolder,
        includes: srcFolder + '/_includes',
        styles: srcFolder + '/styles',
        scripts: srcFolder + '/scripts',
        images: srcFolder + '/images',
        svg2sprite: srcFolder + '/images/svg2sprite',
        fonts: srcFolder + '/fonts',
    },
    build: {
        html: buildFolder + '/',
        styles: buildFolder + '/styles',
        scripts: buildFolder + '/scripts',
        images: buildFolder + '/images',
        fonts: buildFolder + '/fonts',
    },
    taskFiles: {
        fontsStyle: srcFolder + '/styles/_fonts.scss',
        testWebp: srcFolder + '/scripts/_test-webp.js',
    },
};


// ФУНКЦИИ БИЛДА ДЛЯ ПУТЕЙ
function html() {
    return src([paths.src.html + '/index.html'])
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(paths.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src([
        'node_modules/select2/dist/css/select2.css',
        'node_modules/normalize.css/normalize.css',
        paths.taskFiles.fontsStyle,
        paths.src.styles + '/_general.scss',
        paths.src.styles + '/_settings.scss',
        'node_modules/slick-carousel/slick/*.css',
        paths.src.includes + '/**/*.scss',
        paths.src.styles + '/main.scss'
    ])
        .pipe(concat('main.scss'))
        .pipe(scss())
        .pipe(groupmedia())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
        }))
        .pipe(dest(paths.build.styles))
        .pipe(cleancss({
            level: {
                1: {specialComments: 0},
            },
        }))
        .pipe(webpcss())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(paths.build.styles))
        .pipe(browsersync.stream());
}

function js() {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/select2/dist/js/select2.js',
        'node_modules/scrollreveal/dist/scrollreveal.min.js',
        'node_modules/slick-carousel/slick/slick.js',
        paths.src.includes + '/**/*.js',
        paths.src.scripts + '/main.js'
    ])
        .pipe(fileinclude())
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: ['@babel/env'],
        }))
        .pipe(dest(paths.build.scripts))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(paths.build.scripts))
        .pipe(browsersync.stream());
}

function img() {
    const imgSrc = [
        paths.src.images + '/**/*.{jpg,png,svg,gif,ico,webp}',
        '!' + paths.src.svg2sprite + '/**/*'
    ];

    return src(imgSrc)
        .pipe(webp({quality: 70}))
        .pipe(dest(paths.build.images))
        .pipe(src(imgSrc))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3,
        }))
        .pipe(dest(paths.build.images))
        .pipe(browsersync.stream());
}

function fonts() {
    const fontsSrc = [paths.src.fonts + '/**/*'];

    src(fontsSrc)
        .pipe(ttf2woff())
        .pipe(dest(paths.build.fonts));

    return src(fontsSrc)
        .pipe(ttf2woff2())
        .pipe(dest(paths.build.fonts))
        .pipe(browsersync.stream());
}


// ОТДЕЛЬНЫЕ ТАСКИ
//создание в папки со скриптами файла _test-webp.js для тестирования браузера на поддержку webp
function testwebp() {
    fs.writeFileSync(
        paths.taskFiles.testWebp,
        "const webP = new Image();\n" +
        "webP.onload = webP.onerror = () => {\n" +
        "    document.querySelector('body').classList.add(webP.height === 2 ? 'webp' : 'no-webp');\n" +
        "};\n" +
        "webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';"
    );
    return Promise.resolve();
}

//создание в папке с изображениями svg-спрайта на основе папки с svg для него
function svg2sprite() {
    return src(paths.src.svg2sprite + '/**/*')
        .pipe(svgsprite({
            mode: {
                stack: {sprite: '../sprite/sprite.svg'},
            },
        }))
        .pipe(dest(paths.src.images))
        .pipe(browsersync.stream());
}

//конвертация otf в ttf
function otf2ttf() {
    return src(paths.src.fonts + '/*.otf')
        .pipe(fonter({
            formats: ['ttf'],
        }))
        .pipe(dest(paths.src.fonts));
}

//конвертация ttf в woff2
function woff2() {
    return src(paths.src.fonts + '/*')
        .pipe(ttf2woff2())
        .pipe(dest(paths.src.fonts));
}

//создание в папке со стилями файла _fonts.scss с настройками шрифтов на основе папки с ними
//вес 400, стиль normal
//файл подключается автоматически
function fonts2style() {
    fs.readdir(paths.src.fonts, (err, fonts) => {
        if (!fonts) return;

        fs.stat(paths.taskFiles.fontsStyle, err => {
            if (err && err.code === 'ENOENT') {
                fs.writeFileSync(paths.taskFiles.fontsStyle, '');
            }

            const fontMixin = '@mixin font($font_name, $file_name, $weight, $style) {\n' +
                '  @font-face {\n' +
                '    font-family: $font_name;\n' +
                '    font-display: swap;\n' +
                '    src: url("../fonts/#{$file_name}.woff") format("woff"), url("../fonts/#{$file_name}.woff2") format("woff2");\n' +
                '    font-weight: #{$weight};\n' +
                '    font-style: #{$style};\n' +
                '  }\n' +
                '}\n\n'; //генератор @font-face

            fs.readFile(paths.taskFiles.fontsStyle, 'utf8', (err, content) => {
                fs.writeFile(paths.taskFiles.fontsStyle, fontMixin, () => {
                    return fs.readdir(paths.src.fonts, (err, fonts) => {
                        if (fonts) {
                            fonts.reduce((prevShortName, currFullName) => {

                                const currShortName = currFullName.split('.')[0];
                                if (!prevShortName || prevShortName !== currShortName) {
                                    fs.appendFile(
                                        paths.taskFiles.fontsStyle,
                                        `@include font("${currShortName}", "${currShortName}", "400", "normal");\r\n`,
                                        () => {}
                                    );
                                }
                                return currShortName;
                            });
                        }
                    });
                });
            });
        });
    });

    return Promise.resolve();
}


// ДОПОЛНИТЕЛЬНО
function watchFiles() {
    monitor([paths.src.html + '/**/*.html'], html);
    monitor([
        paths.src.styles + '/**/*.scss',
        paths.src.includes + '/**/*.scss',
    ], css);
    monitor([
        paths.src.scripts + '/**/*.js',
        '!' + paths.src.scripts + '/**/*.min.js',
        paths.src.includes + '/**/*.js',
    ], js);
    monitor([paths.src.images + '/**/*'], img);
}

function browserSync() {
    browsersync.init({
        server: {
            baseDir: buildFolder,
            notify: false,
        },
    });
}

function clean() {
    return del([buildFolder + '/*']);
}


// ЭКСПОРТЫ
const build = series(clean, html, fonts, css, js, img);
const watch = parallel(build, watchFiles, browserSync);
// основное
exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.default = watch;
// отдельные таски
exports.testwebp = testwebp;
exports.svg2sprite = svg2sprite;
exports.otf2ttf = otf2ttf;
exports.woff2 = woff2;
exports.fonts2style = fonts2style;