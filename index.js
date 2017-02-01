const months = [
	'Gathering',
	'Dry',
	'Grass',
	'Flower',
	'Fallow',
	'Hay',
	'Harvest',
	'Barley',
	'Wine',
	'Slaughter',
	'Wolves',
	'Frost',
];

const days = [
	'Avandæ',
	'Coreldæ',
	'Moradæ',
	'Bahamdæ',
	'Sehandæ',
	'Pelordæ',
];

const ages = [
	'First Histories',
	'Quarried Stone',
	'Roads',
	'Kingdom in Unity',
	'Great Empire',
	'Nine Kings',
];

const ageEpochs = {
	'First Histories': 0,
	'Quarried Stone': 10295424000,
	'Roads': 19066752000,
	'Kingdom in Unity': 19004544000,
	'Great Empire': 31383936000,
	'Nine Kings': 48864384000,
};

const ageAbbreviations = {
	'First Histories': 'FH',
	'Quarried Stone': 'QS',
	'Roads': 'R',
	'Kingdom in Unity': 'KU',
	'Great Empire': 'GE',
	'Nine Kings': 'NK',
};

const secondsInMinute = 60;
const minutesInHour = 60;
const hoursInDay = 24;
const daysInMonth = 30;

const daysInWeek = days.length;
const monthsInYear = months.length;

const secondsInDay = secondsInMinute * minutesInHour * hoursInDay;
const secondsInWeek = secondsInDay * daysInWeek;
const secondsInMonth = secondsInDay * daysInMonth;
const secondsInYear = secondsInMonth * monthsInYear;

const epochYear = (timestamp, epoch) => Math.floor(1 + (timestamp - epoch) / secondsInYear);
const previousAge = age => ages[ages.indexOf(age) - 1];

class OdreianDate {
	constructor(timestamp) {
		this.timestamp = timestamp;
	}

	get age() {
		let age;
		for(const a of ages) {
			if(ageEpochs[a] > this.timestamp) {
				if(ageEpochs[age] && ageEpochs[age] + secondsInYear > this.timestamp) {
					return [previousAge(age), age];
				}

				return [age];
			}

			age = a;
		}

		if(ageEpochs[age] && ageEpochs[age] + secondsInYear > this.timestamp) {
			return [previousAge(age), age];
		}

		return [age];
	}

	format(strings, ...vars) {
		return strings.reduce((cat, string, i) => cat + string + (vars[i] in this ? this[vars[i]] : ''), '');
	}

	get year() {
		return this.age.map(age => ({
			year: epochYear(this.timestamp, ageEpochs[age]),
			age
		}));
	}

	get yearSeconds() {
		return this.timestamp % secondsInYear;
	}

	get startOfYear() {
		return this.timestamp - this.yearSeconds;
	}

	get monthIndex() {
		return Math.floor(this.yearSeconds / secondsInMonth);
	}

	get monthSeconds() {
		return this.timestamp % secondsInMonth;
	}

	get startOfMonth() {
		return this.timestamp - this.monthSeconds;
	}

	get dateIndex() {
		return Math.floor(this.monthSeconds / secondsInDay);
	}

	get dayIndex() {
		return this.dateIndex % daysInWeek;
	}

	get daySeconds() {
		return this.timestamp % secondsInDay;
	}

	get startOfDay() {
		return this.timestamp - this.daySeconds;
	}

	get YY() {
		return this.year.map(({year, age}) => `${year}${ageAbbreviations[age]}`).join('/');
	}

	get YYYY() {
		return this.year.map(({year, age}) => `${year}, Age of ${age}`).join('/');
	}

	get M() {
		return this.monthIndex + 1;
	}

	get MMMM() {
		return months[this.monthIndex];
	}

	get D() {
		return this.dateIndex + 1;
	}

	get d() {
		return this.dayIndex;
	}

	get dddd() {
		return days[this.dayIndex];
	}
}

module.exports = OdreianDate;