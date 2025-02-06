function gerarLinhaDigitavel(linhaDigitavel) {
	const part1 = linhaDigitavel.substring(0, 5);
	const part2 = linhaDigitavel.substring(5, 10);
	const part3 = linhaDigitavel.substring(10, 15);
	const part4 = linhaDigitavel.substring(15, 21);
	const part5 = linhaDigitavel.substring(21, 26);
	const part6 = linhaDigitavel.substring(26, 32);
	const part7 = linhaDigitavel.substring(32, 33);
	const part8 = linhaDigitavel.substring(33, 34);
	const part9 = linhaDigitavel.substring(34, 47);

	return `${part1}.${part2} ${part3}.${part4} ${part5}.${part6} ${part7} ${part8}${part9}`;
}

module.exports = gerarLinhaDigitavel;

// const formatarLinhaDigitavel = require('../utils/functions/formatacoesUtils').linhaDigitavel;
// const ValidaCodigoBarras = require('./valida-codigo-barras');
// const GeradorDeDigitoPadrao = require('./gerador-de-digito-padrao');

// module.exports = function(codigoDeBarras, banco) {
// 	ValidaCodigoBarras.validar(codigoDeBarras);

// 	const linhaDigitavel = [];

// 	linhaDigitavel.push(codigoDeBarras.substring(0, 3));
// 	linhaDigitavel.push(codigoDeBarras.substring(3, 4));
// 	linhaDigitavel.push(codigoDeBarras.substring(19, 24));
// 	linhaDigitavel.push(GeradorDeDigitoPadrao.mod10(linhaDigitavel.join('')));

// 	linhaDigitavel.push(codigoDeBarras.substring(24, 34));
// 	linhaDigitavel.push(GeradorDeDigitoPadrao.mod10(linhaDigitavel.join('').substring(10, 20)));

// 	linhaDigitavel.push(codigoDeBarras.substring(34));
// 	linhaDigitavel.push(GeradorDeDigitoPadrao.mod10(linhaDigitavel.join('').substring(21, 31)));

// 	linhaDigitavel.push(codigoDeBarras.substring(4, 5));
// 	linhaDigitavel.push(codigoDeBarras.substring(5, 9));
// 	linhaDigitavel.push(codigoDeBarras.substring(9, 19));

// 	return formatarLinhaDigitavel(linhaDigitavel.join(''));
// };
