const fs = require('fs');
const UglifyJS = require('uglify-js');
const sass = require('node-sass');

module.exports = {
	css: sass.renderSync({ file: './_src/style/style.scss', outputStyle: 'compressed' }).css.toString(),
	js: UglifyJS.minify(fs.readFileSync('./_src/scripts/main.js', 'utf8')).code
};
