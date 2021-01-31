const fs = require('fs');

module.exports = {
	data: fs.readFileSync('./data.json', 'utf8')
};
