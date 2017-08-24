const OdreianDate = require('./');

Object.keys(OdreianDate.ageEpochs).forEach(age => {
	console.log(age, new OdreianDate(OdreianDate.ageEpochs[age]).LLLL);
});
