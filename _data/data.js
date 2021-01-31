const fs = require('fs');

const dataRaw = fs.readFileSync('./data.json', 'utf8');
const jsonData = JSON.parse(dataRaw);

module.exports = {
	data: dataRaw,
	entitiesList: jsonData.entitiesList
};
