const gulp = require('gulp'),
      sass = require('gulp-sass'),
      gulpif = require('gulp-if'),
      cleanCSS = require('gulp-clean-css'),
      fs = require('fs-extra'),
      autoprefixer = require('gulp-autoprefixer');

const SASS_SRC = 'src/scss/pages/',
      SASS_DEST = 'dist/css',
      ASSETS_SRC = 'src/assets',
      ASSETS_DEST = 'dist/assets';

var deploy = false;

gulp.task('styles', () => {
   gulp.src(`${SASS_SRC}*.scss`)	
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulpif(deploy,cleanCSS()))
		.pipe(gulp.dest(SASS_DEST));
});

gulp.task('copy-assets', () => {
   fs.copySync(ASSETS_SRC, ASSETS_DEST);   
});

gulp.task('default', () => {
   gulp.start('styles');
   gulp.start('copy-assets');
});

gulp.task('deploy',() => {
   deploy = true;
   gulp.start('default');
});