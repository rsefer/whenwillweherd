const fs = require('fs');
const UglifyJS = require('uglify-js');
const sass = require('node-sass');

module.exports = {
	js: UglifyJS.minify(fs.readFileSync('./_src/scripts/main.js', 'utf8')).code
};
