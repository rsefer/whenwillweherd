const axios = require('axios');
const parse = require('csv-parse/lib/sync');
const url = 'https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/us_state_vaccinations.csv';
const populations = {
	'United States': 331996199,
	'Alabama': 4903185,
	'Alaska': 731545,
	'Arizona': 7278717,
	'Arkansas': 3017804,
	'California': 39512223,
	'Colorado': 5758736,
	'Connecticut': 3565287,
	'Delaware': 973764,
	'District of Columbia': 705749,
	'Florida': 21477737,
	'Georgia': 10617423,
	'Hawaii': 1415872,
	'Idaho': 1787065,
	'Illinois': 12671821,
	'Indiana': 6732219,
	'Iowa': 3155070,
	'Kansas': 2913314,
	'Kentucky': 4467673,
	'Louisiana': 4648794,
	'Maine': 1344212,
	'Maryland': 6045680,
	'Massachusetts': 6892503,
	'Michigan': 9986857,
	'Minnesota': 5639632,
	'Mississippi': 2976149,
	'Missouri': 6137428,
	'Montana': 1068778,
	'Nebraska': 1934408,
	'Nevada': 3080156,
	'New Hampshire': 1359711,
	'New Jersey': 8882190,
	'New Mexico': 2096829,
	'New York': 19453561,
	'New York State': 19453561,
	'North Carolina': 10488084,
	'North Dakota': 762062,
	'Ohio': 11689100,
	'Oklahoma': 3956971,
	'Oregon': 4217737,
	'Pennsylvania': 12801989,
	'Puerto Rico': 3193694,
	'Rhode Island': 1059361,
	'South Carolina': 5148714,
	'South Dakota': 884659,
	'Tennessee': 6829174,
	'Texas': 28995881,
	'Utah': 3205958,
	'Vermont': 623989,
	'Virginia': 8535519,
	'Washington': 7614893,
	'West Virginia': 1792147,
	'Wisconsin': 5822434,
	'Wyoming': 578759
};

const abbreviations = {
	'United States': 'US',
	'Alabama': 'AL',
	'Alaska': 'AK',
	'Arizona': 'AZ',
	'Arkansas': 'AR',
	'California': 'CA',
	'Colorado': 'CO',
	'Connecticut': 'CT',
	'Delaware': 'DE',
	'District of Columbia': 'DC',
	'Florida': 'FL',
	'Georgia': 'GA',
	'Hawaii': 'HI',
	'Idaho': 'ID',
	'Illinois': 'IL',
	'Indiana': 'IN',
	'Iowa': 'IA',
	'Kansas': 'KS',
	'Kentucky': 'KY',
	'Louisiana': 'LA',
	'Maine': 'ME',
	'Maryland': 'MD',
	'Massachusetts': 'MA',
	'Michigan': 'MI',
	'Minnesota': 'MN',
	'Mississippi': 'MS',
	'Missouri': 'MO',
	'Montana': 'MT',
	'Nebraska': 'NE',
	'Nevada': 'NV',
	'New Hampshire': 'NH',
	'New Jersey': 'NJ',
	'New Mexico': 'NM',
	'New York': 'NY',
	'New York State': 'NY',
	'North Carolina': 'NC',
	'North Dakota': 'ND',
	'Ohio': 'OH',
	'Oklahoma': 'OK',
	'Oregon': 'OR',
	'Pennsylvania': 'PA',
	'Puerto Rico': 'PR',
	'Rhode Island': 'RI',
	'South Carolina': 'SC',
	'South Dakota': 'SD',
	'Tennessee': 'TN',
	'Texas': 'TX',
	'Utah': 'UT',
	'Vermont': 'VT',
	'Virginia': 'VA',
	'Washington': 'WA',
	'West Virginia': 'WV',
	'Wyoming': 'WY',
	'Wisconsin': 'WI'
};

async function getData() {
	const response = await axios.get(url);
	return response.data;
}

async function formatData() {
	const dataRaw = await getData();
	const parsed = parse(dataRaw);
	const cols = parsed[0];
	let entities = [];
	parsed.forEach((row, i) => {
		if (i == 0) { return; }
		entities.push(row[1]);
	});
	entities = entities.filter((v, i, a) => a.indexOf(v) === i);
	let keepLastCount = 14;
	let formattedData = {
		entities: [],
		entitiesList: [],
		herdPercentage: 0.75,
		populations: populations,
		abbreviations: abbreviations,
		labels: {
			lastXDays: `Last ${keepLastCount} Days`
		}
	};
	formattedData.herdPercentageLabel = parseInt(formattedData.herdPercentage * 100);

	for (var entity of entities) {
		if (!Object.keys(formattedData.populations).includes(entity)) {
			continue;
		} else {
			formattedData.entitiesList.push(entity);
		}
		let thisEntityObj = {
			name: entity,
			days: [],
			total_vaccinations: 0,
			rolling_average_7: 0,
			population: formattedData.populations[entity],
			abbreviation: formattedData.abbreviations[entity]
		};
		thisEntityObj.herd_population = thisEntityObj.population * formattedData.herdPercentage;
		parsed.filter((row) => row[1] == entity).forEach((row, i) => {
			let dayLabel = `${row[0]}-${row[1]}`;
			let day = {};
			row.map((cell, x) => day[cols[x]] = cell);
			thisEntityObj.days.push(day);
		});
		thisEntityObj.days.forEach((day, i) => {
			if (i == thisEntityObj.days.length - 1) {
				thisEntityObj.total_vaccinations = parseInt(day.total_vaccinations);
				thisEntityObj.rolling_average_7 = day.daily_vaccinations;
				thisEntityObj.total_vaccinations_per_hundred = parseFloat(day.total_vaccinations_per_hundred);
				formattedData.lastDate = day.date;
			}
			// remove unused keys
			delete day.total_distributed;
			delete day.distributed_per_hundred;
			delete day.total_vaccinations_per_hundred;
			delete day.people_vaccinated;
			delete day.people_vaccinated_per_hundred;
			delete day.people_vaccinated_per_hundred;
			delete day.people_fully_vaccinated_per_hundred;
			delete day.daily_vaccinations_per_million;
			delete day.share_doses_used;
		});
		if (populations[thisEntityObj.name]) {
			const today = new Date();
			thisEntityObj.population = populations[thisEntityObj.name];

			// herd
			thisEntityObj.herd_vacs_needed_double = Math.ceil((thisEntityObj.population * 2 * formattedData.herdPercentage) - thisEntityObj.total_vaccinations);
			thisEntityObj.herd_days_needed_double = Math.ceil(thisEntityObj.herd_vacs_needed_double / thisEntityObj.rolling_average_7);
			let herdDateDouble = new Date();
			herdDateDouble.setDate(today.getDate() + thisEntityObj.herd_days_needed_double);
			thisEntityObj.herd_date_double = herdDateDouble;
			thisEntityObj.herd_date_double_label = roughDate(thisEntityObj.herd_date_double);

			// // complete
			// thisEntityObj.completion_vacs_needed_double = Math.ceil((thisEntityObj.population * 2) - thisEntityObj.total_vaccinations);
			// thisEntityObj.completion_days_needed_double = Math.ceil(thisEntityObj.completion_vacs_needed_double / thisEntityObj.rolling_average_7);
			// let completionDateDouble = new Date();
			// completionDateDouble.setDate(today.getDate() + thisEntityObj.completion_days_needed_double);
			// thisEntityObj.completion_date_double = completionDateDouble;
			// thisEntityObj.completion_date_double_label = roughDate(thisEntityObj.completion_date_double);

		}
		thisEntityObj.days.splice(0, thisEntityObj.days.length - keepLastCount);
		formattedData.entities.push(thisEntityObj);
	}
	formattedData.entitiesList = formattedData.entitiesList.filter((v, i, a) => a.indexOf(v) === i);
	return {
		timestamp: new Date(),
		formatted: formattedData,
		raw: JSON.stringify(formattedData)
	};
}

function roughDate(date) {
	const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
	let label = '';
	if (date.getDate() < 10) {
		label += 'Early ';
	} else if (date.getDate() < 20) {
		label += 'Mid-';
	} else {
		label += 'Late ';
	}
	label += monthNames[date.getMonth()];
	label += ' ' + date.getFullYear();
	return label;
}

module.exports = async function() {
	return await formatData();
};
