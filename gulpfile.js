import { src, dest, series, parallel, watch} from 'gulp';
import plumber from 'gulp-plumber';
import concat from 'gulp-concat-css';
import gulpConat from 'gulp-concat'
import { deleteAsync } from 'del';
import browserSync from 'browser-sync';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import mediaquery from 'postcss-combine-media-query';
import cssnano from 'cssnano';
import htmlMinify from 'html-minifier';

function html() {
  const options = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
      minifyCSS: true,
      keepClosingSlash: true
  };
  return src('src/**/*.html')
        .pipe(plumber())
        .on('data', function(file) {
              const buferFile = Buffer.from(htmlMinify.minify(file.contents.toString(), options))
              return file.contents = buferFile
            })
        .pipe(dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
}

function css() {
  const plugins = [autoprefixer(), mediaquery(), cssnano()];
  src('src/vendor/**/*.css')
  .pipe(plumber())
  .pipe(postcss(plugins))
  .pipe(dest('dist/'));
  return src('src/blocks/**/*.css')
        .pipe(plumber())
        .pipe(gulpConat('bundle.css'))
        .pipe(postcss(plugins))
        .pipe(dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
}

function images() {
  return src('src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}', { encoding: false })
            .pipe(dest('dist/images'))
            .pipe(browserSync.reload({stream: true}));
}

function videos() {
  return src('src/videos/**/*.{}')
            .pipe(dest('dist/videos'))
            .pipe(browserSync.reload({stream: true}));
}

function fonts() {
  return src('src/vendor/fonts/**/*.{ttf, woff, woff2}', { encoding: false })
            .pipe(dest('dist/fonts'))
            .pipe(browserSync.reload({stream: true}));
}

function clean() {
  return deleteAsync('dist');
}

function watchFiles() {
  watch(['src/**/*.html'], html);
  watch(['src/blocks/**/*.css'], css);
  watch(['src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}'], images);
  watch(['src/videos/**/*.{webm, mp4}'], videos);
  watch(['src/vendor/fonts/**/*.{ttf, woff, woff2}'], fonts);
}

const createBrowserSync = browserSync.create();

function serve() {
  createBrowserSync.init({
    server: {
      baseDir: './dist'
    }
  });
}

const build = series(clean, parallel(html, css, images, videos, fonts));
export const watchApp = parallel(build, watchFiles, serve);

export default watchApp;