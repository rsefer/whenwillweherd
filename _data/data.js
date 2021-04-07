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
		}
		let thisEntityObj = {
			name: entity,
			days: [],
			total_vaccinations: 0,
			rolling_average_7: 0,
			people_vaccinated_rolling_average_7: 0,
			people_fully_vaccinated_rolling_average_7: 0,
			pop: formattedData.populations[entity],
			abbreviation: formattedData.abbreviations[entity]
		};
		thisEntityObj.herd_population = thisEntityObj.pop * formattedData.herdPercentage;
		parsed.filter((row) => row[1] == entity).forEach((row, i) => {
			let day = {};
			row.map((cell, x) => day[cols[x]] = cell);
			day.total_vaccinations = parseFloat(day.total_vaccinations);
			day.people_vaccinated = parseFloat(day.people_vaccinated);
			day.people_fully_vaccinated = parseFloat(day.people_fully_vaccinated);
			day.daily_vaccinations_raw = parseFloat(day.daily_vaccinations_raw);
			day.daily_vaccinations = parseFloat(day.daily_vaccinations);
			thisEntityObj.days.push(day);
		});
		thisEntityObj.days.forEach((day, i) => {
			if (i > 0) {
				day.people_vaccinated_today = day.people_vaccinated - thisEntityObj.days[i - 1].pv;
				day.people_fully_vaccinated_today = day.people_fully_vaccinated - thisEntityObj.days[i - 1].pfv;
			}
			if (i == thisEntityObj.days.length - 1) {
				thisEntityObj.total_vaccinations = parseInt(day.total_vaccinations);
				thisEntityObj.rolling_average_7 = day.daily_vaccinations;
				thisEntityObj.total_vaccinations_per_hundred = parseFloat(day.total_vaccinations_per_hundred);
				formattedData.lastDate = day.date;
				thisEntityObj.people_vaccinated = day.people_vaccinated;
				thisEntityObj.people_fully_vaccinated = day.people_fully_vaccinated;
			}
			day.d = day.date;
			day.dv = day.daily_vaccinations;
			day.dvr = day.daily_vaccinations_raw;
			day.tv = day.total_vaccinations;
			day.pv = day.people_vaccinated;
			day.pvt = day.people_vaccinated_today;
			day.pfv = day.people_fully_vaccinated;
			day.pfvt = day.people_fully_vaccinated_today;
			// remove unused keys
			delete day.date;
			delete day.daily_vaccinations;
			delete day.daily_vaccinations_raw;
			delete day.people_vaccinated;
			delete day.total_vaccinations;
			delete day.people_vaccinated_today;
			delete day.people_fully_vaccinated_today;
			delete day.location;
			delete day.total_distributed;
			delete day.distributed_per_hundred;
			delete day.total_vaccinations_per_hundred;
			delete day.people_vaccinated_per_hundred;
			delete day.people_fully_vaccinated;
			delete day.people_fully_vaccinated_per_hundred;
			delete day.daily_vaccinations_per_million;
			delete day.share_doses_used;
		});
		if (populations[thisEntityObj.name]) {
			const today = new Date();
			thisEntityObj.pop = populations[thisEntityObj.name];

			thisEntityObj.people_vaccinated_rolling_average_7 = Math.round(thisEntityObj.days.slice(Math.max(thisEntityObj.days.length - 7, 0)).reduce((accumulator, currentValue) => {
				return accumulator + currentValue.pvt
			}, 0) / 7);

			thisEntityObj.people_fully_vaccinated_rolling_average_7 = Math.round(thisEntityObj.days.slice(Math.max(thisEntityObj.days.length - 7, 0)).reduce((accumulator, currentValue) => {
				return accumulator + currentValue.people_fully_vaccinated_today
			}, 0) / 7);

			// herd - double dose
			thisEntityObj.herd_vacs_needed_double = Math.ceil((thisEntityObj.pop * 2 * formattedData.herdPercentage) - thisEntityObj.total_vaccinations);
			thisEntityObj.herd_days_needed_double = Math.ceil(thisEntityObj.herd_vacs_needed_double / thisEntityObj.rolling_average_7);
			let herdDateDouble = new Date();
			herdDateDouble.setDate(today.getDate() + thisEntityObj.herd_days_needed_double);
			thisEntityObj.herd_date_double = herdDateDouble;
			thisEntityObj.herd_date_double_label = roughDate(thisEntityObj.herd_date_double);

			// herd - at least one dose
			thisEntityObj.herd_people_needed = Math.ceil((thisEntityObj.pop * formattedData.herdPercentage) - thisEntityObj.people_vaccinated);

			thisEntityObj.herd_days_needed = Math.ceil(thisEntityObj.herd_people_needed / thisEntityObj.people_vaccinated_rolling_average_7);
			let herdDate = new Date();
			herdDate.setDate(today.getDate() + thisEntityObj.herd_days_needed);
			thisEntityObj.herd_date = herdDate;
			thisEntityObj.herd_date_label = roughDate(thisEntityObj.herd_date);

		}
		thisEntityObj.days.splice(0, thisEntityObj.days.length - keepLastCount);

		thisEntityObj.abv = thisEntityObj.abbreviation;
		thisEntityObj.tv = thisEntityObj.total_vaccinations;
		thisEntityObj.tvh = thisEntityObj.total_vaccinations_per_hundred;
		thisEntityObj.hp = thisEntityObj.herd_population;
		thisEntityObj.hdn = thisEntityObj.herd_days_needed;
		thisEntityObj.hdnd = thisEntityObj.herd_days_needed_double;
		thisEntityObj.hd = thisEntityObj.herd_date;
		thisEntityObj.hdl = thisEntityObj.herd_date_label;
		thisEntityObj.hddl = thisEntityObj.herd_date_double_label;

		delete thisEntityObj.abbreviation;
		delete thisEntityObj.total_vaccinations;
		delete thisEntityObj.total_vaccinations_per_hundred;
		delete thisEntityObj.herd_population;
		delete thisEntityObj.herd_people_needed;
		delete thisEntityObj.herd_vacs_needed_double;
		delete thisEntityObj.herd_days_needed;;
		delete thisEntityObj.herd_days_needed_double;
		delete thisEntityObj.herd_date;
		delete thisEntityObj.herd_date_double;
		delete thisEntityObj.herd_date_label;
		delete thisEntityObj.herd_date_double_label;
		delete thisEntityObj.people_vaccinated;
		delete thisEntityObj.people_vaccinated_rolling_average_7;
		delete thisEntityObj.people_fully_vaccinated;
		delete thisEntityObj.people_fully_vaccinated_rolling_average_7;
		delete thisEntityObj.rolling_average_7;
		formattedData.entities.push(thisEntityObj);
	}

	delete formattedData.abbreviations;
	delete formattedData.populations;

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
