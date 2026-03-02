const PdfGerador = require('../../../lib/pdf-gerador');
var fs = require('fs'),
	boletos = require('../../../lib/utils/functions/boletoUtils.js'),
	Banrisul = require('../../../lib/boleto/bancos/banrisul.js'),
	geradorDeLinhaDigitavel = require('../../../lib/boleto/gerador-de-linha-digitavel.js'),

	Datas = boletos.Datas,
	Endereco = boletos.Endereco,
	Beneficiario = boletos.Beneficiario,
	Pagador = boletos.Pagador,
	Boleto = boletos.Boleto,

	banco,
	boleto;

module.exports = {
	setUp: function(done) {
		banco = new Banrisul();

		var datas = Datas.novasDatas();
		
		datas.comDocumento('02-04-2020');
		datas.comProcessamento('02-04-2020');
		datas.comVencimento('02-04-2020');

		var beneficiario = Beneficiario.novoBeneficiario();
		beneficiario.comNome('Empresa Exemplo LTDA');
		beneficiario.comRegistroNacional('12345678000199');
		beneficiario.comAgencia('1234');
		beneficiario.comDigitoAgencia('0');
		beneficiario.comCodigoBeneficiario('0012345');
		beneficiario.comDigitoCodigoBeneficiario('6');
		beneficiario.comCarteira('1');
		beneficiario.comNossoNumero('00000001');

		var enderecoDoBeneficiario = Endereco.novoEndereco();
		enderecoDoBeneficiario.comLogradouro('Av. Borges de Medeiros, 123');
		enderecoDoBeneficiario.comBairro('Centro');
		enderecoDoBeneficiario.comCep('90020020');
		enderecoDoBeneficiario.comCidade('Porto Alegre');
		enderecoDoBeneficiario.comUf('RS');
		beneficiario.comEndereco(enderecoDoBeneficiario);

		var pagador = Pagador.novoPagador();
		pagador.comNome('José da Silva');
		pagador.comRegistroNacional('12345678901');

		var enderecoDoPagador = Endereco.novoEndereco();
		enderecoDoPagador.comLogradouro('Rua dos Andradas, 1234');
		enderecoDoPagador.comBairro('Centro Histórico');
		enderecoDoPagador.comCep('90020000');
		enderecoDoPagador.comCidade('Porto Alegre');
		enderecoDoPagador.comUf('RS');
		pagador.comEndereco(enderecoDoPagador);

		boleto = Boleto.novoBoleto();
		boleto.comDatas(datas);
		boleto.comBeneficiario(beneficiario);
		boleto.comBanco(banco);
		boleto.comPagador(pagador);
		boleto.comValor(150.00);
		boleto.comNumeroDoDocumento('1001');
		boleto.comLocaisDePagamento([
			'Pagável preferencialmente na rede Banrisul ou em qualquer banco até o vencimento'
		]);

		done();
	},

	'Nosso número formatado deve ter 8 digitos': function(test) {
		var nossoNumero = banco.getNossoNumeroFormatado(boleto.getBeneficiario());
		test.equals(8, nossoNumero.length);
		test.equals('00000001', nossoNumero);

		test.done();
	},

	'Carteira formatado deve ter dois dígitos': function(test) {
		var carteiraFormatado = banco.getCarteiraFormatado(boleto.getBeneficiario());

		test.equals(2, carteiraFormatado.length);
		test.equals('01', carteiraFormatado);
		test.done();
	},

	'Conta corrente formatada deve ter sete dígitos': function(test) {
		var codigoFormatado = banco.getCodigoFormatado(boleto.getBeneficiario());

		test.equals(7, codigoFormatado.length);
		test.equals('0012345', codigoFormatado);
		test.done();
	},

	'Testa geração de linha digitavel': function(test) {
		var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto),
			linhaDigitavel = geradorDeLinhaDigitavel(codigoDeBarras, banco);

		test.ok(linhaDigitavel);
		// Linha digitável tem 47 dígitos + espaços e pontos
		var digitosApenas = linhaDigitavel.replace(/[\s.]/g, '');
		test.equals(47, digitosApenas.length);

		test.done();
	},

	'Deve gerar o código de barras': function(test) {
		var codigoDeBarras = banco.geraCodigoDeBarrasPara(boleto);

		test.ok(codigoDeBarras);
		test.equals(codigoDeBarras.length, 44);

		test.done();
	},

	'Deve retornar o nome do banco': function(test) {
		test.equals('Banco do Estado do Rio Grande do Sul S.A.', banco.getNome());
		test.done();
	},

	'Deve retornar o número do banco formatado com dígito': function(test) {
		test.equals('041-8', banco.getNumeroFormatadoComDigito());
		test.done();
	},

	'Deve retornar o número do banco': function(test) {
		test.equals('041', banco.getNumeroFormatado());
		test.done();
	},

	'Deve retornar agência e código do beneficiário formatados': function(test) {
		var agenciaECodigo = banco.getAgenciaECodigoBeneficiario(boleto);
		test.equals('1234.0012345.6', agenciaECodigo);
		test.done();
	},

	'Deve calcular duplo dígito corretamente': function(test) {
		var duploDigito = banco.calculaDuploDigito(boleto.getBeneficiario());
		test.equals(2, duploDigito.length);
		test.ok(duploDigito);
		test.done();
	},

	'Deve calcular duplo dígito conforme exemplo da documentação': function(test) {
		// Exemplo da documentação: Nosso Número 00189274 deve gerar DV 46
		var nossoNumeroTeste = '00189274';
		var dvCalculado = banco.calcularDVNossoNumero(nossoNumeroTeste);
		test.equals('46', dvCalculado);
		test.done();
	},

	'Deve calcular módulo 10 corretamente': function(test) {
		// Exemplo: 00189274 -> DV1 = 4
		var dv1 = banco.calcularModulo10('00189274');
		test.equals(4, dv1);
		test.done();
	},

	'Deve calcular módulo 11 corretamente': function(test) {
		// Exemplo: 001892744 -> DV2 = 6
		var dv2 = banco.calcularModulo11('001892744');
		test.equals(6, dv2);
		test.done();
	}
};
