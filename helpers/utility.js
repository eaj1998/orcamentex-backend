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