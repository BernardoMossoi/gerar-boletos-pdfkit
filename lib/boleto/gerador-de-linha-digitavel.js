const formatarLinhaDigitavel = require('../utils/functions/formatacoesUtils').linhaDigitavel;
const ValidaCodigoBarras = require('./valida-codigo-barras');
const GeradorDeDigitoPadrao = require('./gerador-de-digito-padrao');

module.exports = function(codigoDeBarras, banco) {
	// Se receber apenas um parâmetro e for string (linha digitável pronta), apenas formata
	if (typeof codigoDeBarras === 'string' && codigoDeBarras.length === 47 && !banco) {
		const part1 = codigoDeBarras.substring(0,5);
		const part2 = codigoDeBarras.substring(5, 10);
		const part3 = codigoDeBarras.substring(10, 15);
		const part4 = codigoDeBarras.substring(15, 21);
		const part5 = codigoDeBarras.substring(21, 26);
		const part6 = codigoDeBarras.substring(26, 32);
		const part7 = codigoDeBarras.substring(32, 33);
		const part8 = codigoDeBarras.substring(33, 34);
		const part9 = codigoDeBarras.substring(34, 47);
		
		return `${part1}.${part2} ${part3}.${part4} ${part5}.${part6} ${part7} ${part8}${part9}`;
	}
	
	// Caso contrário, gera a linha digitável a partir do código de barras
	ValidaCodigoBarras.validar(codigoDeBarras);

	const linhaDigitavel = [];

	linhaDigitavel.push(codigoDeBarras.substring(0, 3));
	linhaDigitavel.push(codigoDeBarras.substring(3, 4));
	linhaDigitavel.push(codigoDeBarras.substring(19, 24));
	linhaDigitavel.push(GeradorDeDigitoPadrao.mod10(linhaDigitavel.join('')));

	linhaDigitavel.push(codigoDeBarras.substring(24, 34));
	linhaDigitavel.push(GeradorDeDigitoPadrao.mod10(linhaDigitavel.join('').substring(10, 20)));

	linhaDigitavel.push(codigoDeBarras.substring(34));
	linhaDigitavel.push(GeradorDeDigitoPadrao.mod10(linhaDigitavel.join('').substring(21, 31)));

	linhaDigitavel.push(codigoDeBarras.substring(4, 5));
	linhaDigitavel.push(codigoDeBarras.substring(5, 9));
	linhaDigitavel.push(codigoDeBarras.substring(9, 19));

	return formatarLinhaDigitavel(linhaDigitavel.join(''));
};
