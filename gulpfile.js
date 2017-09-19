const gulp = require('gulp'),
      sass = require('gulp-sass'),
      gulpif = require('gulp-if'),
      cleanCSS = require('gulp-clean-css'),
      fs = require('fs-extra'),
      browserSync = require('browser-sync').create(),
      autoprefixer = require('gulp-autoprefixer')
      templateEngine = require('./templateEngine'),
      firebaseAccessor = require('./firebase-accessor');

const SRC = 'src',
      DIST = 'dist',
      SASS_SRC = 'src/scss/pages',
      SASS_DEST = 'dist/css',

      ASSETS_SRC = 'src/assets',
      ASSETS_DEST = 'dist/assets',

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
         process.exit();  // HACK: Does all the other tasks then exits after this one
      })
      .catch(err => { throw err });
   return;
});

gulp.task('default', ['styles', 'copy-assets', 'copy-index'], () => {
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
   gulp.watch(`./data.json`, ['compile-templates']);
   gulp.watch(`${DIST}/**/*`, browserSync.reload)
});