const gulp = require('gulp'),
      sass = require('gulp-sass'),
      gulpif = require('gulp-if'),
      cleanCSS = require('gulp-clean-css'),
      fs = require('fs-extra'),
      browserSync = require('browser-sync').create(),
      autoprefixer = require('gulp-autoprefixer'),
      babel = require('gulp-babel'),
      templateEngine = require('./template-engine'),
      firebaseAccessor = require('./firebase-accessor');

const SRC = 'src',
      DIST = 'dist',
      SASS_SRC = 'src/scss/pages',
      SASS_DEST = 'dist/css',

      ASSETS_SRC = 'src/assets',
      ASSETS_DEST = 'dist/assets',

      JS_SRC = 'src/js',
      JS_DEST = 'dist/js',

      TEMPLATES_SRC = 'src/templates',
      TEMPLATES_DEST = 'dist';

var deploy = false;

gulp.task('styles', () => {
   gulp.src(`${SASS_SRC}/*.scss`)
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer({
         browsers: ['last 2 versions'],
         cascade: false
      }))
      .pipe(gulpif(deploy, cleanCSS()))
      .pipe(gulp.dest(SASS_DEST));
});

gulp.task('js', () => {
   gulp.src(`${JS_SRC}/**/*.js`)
      .pipe(babel({
         presets: ['env']
      }))
      .pipe(gulp.dest(JS_DEST));
});

gulp.task('copy-assets', () => {
   fs.copySync(ASSETS_SRC, ASSETS_DEST);
});

gulp.task('copy-index', () => {
   fs.copySync(`${SRC}/index.html`, `${DIST}/index.html`);
});

gulp.task('compile-templates', (cb) => {
      
   firebaseAccessor.getData(deploy, true)
      .then(data => { 
         templateEngine.reCompile(data);
         cb();
      })
      .catch(err => { throw err });
});

gulp.task('default', () => {
   gulp.start('styles');
   gulp.start('js');
   gulp.start('copy-assets');
   gulp.start('copy-index');
   gulp.start('compile-templates');
});

gulp.task('deploy', () => {
   deploy = true;
   gulp.start('default');
});

gulp.task('push-local-to-firebase', () => {
   firebaseAccessor.pushLocalToFirebase();
});

gulp.task('dev', ['default'], () => {
   browserSync.init({
      server: {
         baseDir: "./dist"
      }
   });
   gulp.watch(`${SASS_SRC}/**/*.scss`, ['styles']);
   gulp.watch(`${TEMPLATES_SRC}/**/*.html`, ['compile-templates']);
   //lp.watch(`${TEMPLATES_SRC}/**/*.html`, ['create-admin-pages']);
   gulp.watch(`${JS_SRC}/**/*.js`, ['js']);
   gulp.watch(firebaseAccessor.getDataPath(), ['compile-templates']);
   gulp.watch(`${DIST}/**/*`, browserSync.reload)
});