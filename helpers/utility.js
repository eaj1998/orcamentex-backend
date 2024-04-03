exports.randomNumber = function (length) {
	var text = "";
	var possible = "123456789";
	for (var i = 0; i < length; i++) {
		var sup = Math.floor(Math.random() * possible.length);
		text += i > 0 && sup == i ? "0" : possible.charAt(sup);
	}
	return Number(text);
};

exports.currencyFormatter = function (amount, lang = 'pt-BR', currency = 'BRL'){
	console.log('amount', amount);
	return new Intl.NumberFormat(lang, {
		style: 'currency',
		maximumFractionDigits: 2,
		currency
	} ).format(amount);
}

exports.getExpirationDate = async function () {
	const currentDate = new Date();
	// Add 7 days to the current date
	currentDate.setDate(currentDate.getDate() + 7);

	// Extract day, month, and year components
	const day = currentDate.getDate();
	const month = currentDate.getMonth() + 1; // Month is zero-based
	const year = currentDate.getFullYear();

	// Pad single-digit day and month with leading zeros if necessary
	const formattedDay = day < 10 ? '0' + day : day;
	const formattedMonth = month < 10 ? '0' + month : month;

	// Format the date as "dd/mm/YYYY"
	const formattedDate = `${formattedDay}/${formattedMonth}/${year}`;

	return formattedDate
}