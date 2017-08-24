const ordinal = require('@quarterto/ordinal');

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

const secondsInMinute = 60;
const minutesInHour = 60;
const hoursInDay = 24;
const daysInMonth = 30;

const daysInWeek = days.length;
const monthsInYear = months.length;

const secondsInHour = secondsInMinute * minutesInHour;
const secondsInDay = secondsInHour * hoursInDay;
const secondsInWeek = secondsInDay * daysInWeek;
const secondsInMonth = secondsInDay * daysInMonth;
const secondsInYear = secondsInMonth * monthsInYear;

const ages = [
	'First Histories',
	'Quarried Stone',
	'Roads',
	'Kingdom in Unity',
	'Great Empire',
	'Nine Kings',
];

const ageYears = [332, 281, 101, 298, 563];

const ageEpochs = ageYears.reduce(
	({epochs, total}, years, i) => ({
		epochs: Object.assign(epochs, {
			[ages[i + 1]]: total + (years - 1) * secondsInYear
		}),
		total: total + (years - 1) * secondsInYear,
	}),
	{
		epochs: {
			'First Histories': 0
		},
		total: 0,
	}
).epochs;

const ageAbbreviations = {
	'First Histories': 'FH',
	'Quarried Stone': 'QS',
	'Roads': 'R',
	'Kingdom in Unity': 'KU',
	'Great Empire': 'GE',
	'Nine Kings': 'NK',
};

const epochYear = (timestamp, epoch) => Math.floor(1 + (timestamp - epoch) / secondsInYear);
const previousAge = age => ages[ages.indexOf(age) - 1];

class OdreianDate {
	static parse(string) {
		const [
			matches,
			hourString,
			minuteString,
			ampm,
			dayString,
			dateString,
			monthString,
			yearString,
			ageString
		] = string.match(/(\d?\d):(\d\d)([ap]m), (\w+dæ), (\d\d?)\w\w of (\w+), (\d+)(\w+)/) || [false];

		if(!matches) throw new Error(`Could not parse date ${string}`);

		const [hour12, minute, date, year] = [hourString, minuteString, dateString, yearString].map(s => parseInt(s, 10));
		const hour = (hour12 === 12 ? 0 : hour12) + (ampm === 'pm' ? 12 : 0);

		const monthIndex = months.indexOf(monthString);

		const age = Object.keys(ageAbbreviations).find(abbr => ageAbbreviations[abbr] === ageString);
		const ageEpoch = ageEpochs[age];

		return new OdreianDate(
			ageEpoch +
			secondsInYear * (year - 1) +
			secondsInMonth * monthIndex +
			secondsInDay * (date - 1) +
			secondsInHour * hour +
			secondsInMinute * minute
		);
	}

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

	get monthIndex() {
		return Math.floor(this.yearSeconds / secondsInMonth);
	}

	get monthSeconds() {
		return this.timestamp % secondsInMonth;
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

	get hour() {
		return Math.floor(this.daySeconds / secondsInHour);
	}

	get hourSeconds() {
		return this.timestamp % secondsInHour;
	}

	get minute() {
		return Math.floor(this.hourSeconds / secondsInMinute);
	}

	get second() {
		return this.timestamp % secondsInMinute;
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

	get Mo() {
		return this.M + ordinal(this.M);
	}

	get MM() {
		return months[this.monthIndex];
	}

	get MMMM() {
		return `the Month of ${months[this.monthIndex]}`;
	}

	get D() {
		return this.dateIndex + 1;
	}

	get Do() {
		return this.D + ordinal(this.D);
	}

	get d() {
		return this.dayIndex;
	}

	get dddd() {
		return days[this.dayIndex];
	}

	get H() {
		return this.hour;
	}

	get h() {
		return this.hour % 12 || 12;
	}

	get a() {
		return this.hour >= 12 ? 'pm' : 'am';
	}

	get mm() {
		return (this.minute < 10 ? '0' : '') + this.minute;
	}

	get ss() {
		return (this.second < 10 ? '0' : '') + this.second;
	}

	get LT() {
		return this.format`${'h'}:${'mm'}${'a'}`;
	}

	get LTS() {
		return this.format`${'h'}:${'mm'}:${'ss'}${'a'}`;
	}

	get l() {
		return this.format`${'D'}/${'M'}/${'YY'}`;
	}

	get ll() {
		return this.format`${'Do'} of ${'MM'}, ${'YY'}`;
	}

	get LL() {
		return this.format`${'Do'} of ${'MMMM'}, ${'YYYY'}`;
	}

	get lll() {
		return this.format`${'dddd'}, ${'ll'}`;
	}

	get LLL() {
		return this.format`${'dddd'}, ${'LL'}`;
	}

	get llll() {
		return this.format`${'LT'}, ${'lll'}`;
	}

	get LLLL() {
		return this.format`${'LT'}, ${'LLL'}`;
	}
}

Object.assign(OdreianDate, {
	months, days, ages, ageEpochs
});

module.exports = OdreianDate;
