const fs = require('fs');

const dataRaw = fs.readFileSync('./data.json', 'utf8');
const jsonData = JSON.parse(dataRaw);

module.exports = {
	timestamp: new Date(),
	data: dataRaw,
	dataFormatted: jsonData,
	entitiesList: jsonData.entitiesList
};
