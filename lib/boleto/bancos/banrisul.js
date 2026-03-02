const path = require('path');
const StringUtils = require('../../utils/string-utils');
const pad = StringUtils.pad;

const CodigoDeBarrasBuilder = require('../codigo-de-barras-builder');

var Banrisul = (function() {
	var NUMERO_BANRISUL = '041',
		DIGITO_BANRISUL = '8';

	function Banrisul() {

	}

	Banrisul.prototype.getTitulos = function() {
		return {
			instrucoes: 'Instruções (texto de responsabilidade do beneficiário)',
			nomeDoPagador: 'Nome do Pagador',
			localDePagamento: 'Local de Pagamento',
			vencimento: 'Vencimento',
			agenciaECodigoBeneficiario: 'Agência/Código do Beneficiário',
			nossoNumero: 'Nosso Número',
			especie: 'Moeda',
			quantidade: 'Quantidade',
			valor: '(x) Valor',
			valorDocumento: '(=) Valor do Documento',
			descontos: '(-) Desconto/Abatimento',
			outrasDeducoes: '(-) Outras Deduções',
			moraMulta: '(+) Juros/Multa',
			outrosAcrescimos: '(+) Outros Acréscimos',
			valorCobrado: '(=) Valor Cobrado'
		};
	};

	Banrisul.prototype.exibirReciboDoPagadorCompleto = function() {
		return true;
	};

	Banrisul.prototype.exibirCampoCip = function() {
		return true;
	};

	Banrisul.prototype.geraCodigoDeBarrasPara = function(boleto) {
		var beneficiario = boleto.getBeneficiario(),
			campoLivre = [];

		// Campo livre do Banrisul (25 posições)
		// Posição 20-20: Produto (fixo 1)
		campoLivre.push('1');
		// Posição 21-24: Agência (4 posições)
		campoLivre.push(beneficiario.getAgenciaFormatada());
		// Posição 25-31: Conta (7 posições)
		campoLivre.push(this.getCodigoFormatado(beneficiario));
		// Posição 32-39: Nosso Número (8 posições)
		campoLivre.push(this.getNossoNumeroFormatado(beneficiario));
		// Posição 40-41: Zeros (2 posições)
		campoLivre.push('00');
		// Posição 42-43: Duplo Dígito (calculado)
		campoLivre.push(this.calculaDuploDigito(beneficiario));
		// Posição 44-44: Produto (fixo 1)
		campoLivre.push('1');

		return new CodigoDeBarrasBuilder(boleto).comCampoLivre(campoLivre);
	};

	Banrisul.prototype.calculaDuploDigito = function(beneficiario) {
		var nossoNumero = this.getNossoNumeroFormatado(beneficiario);
		
		return this.calcularDVNossoNumero(nossoNumero);
	};

	Banrisul.prototype.calcularDVNossoNumero = function(nossoNumero) {
		// Primeiro dígito - Módulo 10
		var digito1 = this.calcularModulo10(nossoNumero);
		
		// Segundo dígito - Módulo 11
		var nossoNumeroComDV1 = nossoNumero + digito1;
		var digito2 = this.calcularModulo11(nossoNumeroComDV1);
		
		// Tratamento especial: se resto = 1, DV é inválido
		// Soma 1 ao primeiro DV e recalcula módulo 11
		if (digito2 === -1) {
			digito1 = (digito1 + 1) % 10; // Se digito1 era 9, vira 0
			nossoNumeroComDV1 = nossoNumero + digito1;
			digito2 = this.calcularModulo11(nossoNumeroComDV1);
		}
		
		return pad(digito1.toString() + digito2.toString(), 2, '0');
	};

	Banrisul.prototype.calcularModulo10 = function(campo) {
		// Atribuir pesos 2 e 1 da direita para esquerda
		var soma = 0;
		var peso = 2;
		
		for (var i = campo.length - 1; i >= 0; i--) {
			var resultado = parseInt(campo.charAt(i)) * peso;
			// Se resultado > 9, subtrair 9
			if (resultado > 9) {
				resultado -= 9;
			}
			soma += resultado;
			peso = peso === 2 ? 1 : 2;
		}
		
		var resto = soma % 10;
		// Se resto = 0, DV = 0, senão DV = 10 - resto
		return resto === 0 ? 0 : 10 - resto;
	};

	Banrisul.prototype.calcularModulo11 = function(campo) {
		// Atribuir pesos de 2 a 7 ciclicamente, da direita para esquerda
		var soma = 0;
		var peso = 2;
		
		for (var i = campo.length - 1; i >= 0; i--) {
			soma += parseInt(campo.charAt(i)) * peso;
			peso++;
			if (peso > 7) {
				peso = 2;
			}
		}
		
		var resto = soma % 11;
		
		// Se resto = 0, DV = 0
		if (resto === 0) {
			return 0;
		}
		// Se resto = 1, DV inválido (retorna -1 para tratamento especial)
		if (resto === 1) {
			return -1;
		}
		// Senão, DV = 11 - resto
		return 11 - resto;
	};

	Banrisul.prototype.getNumeroFormatadoComDigito = function() {
		return [
			NUMERO_BANRISUL,
			DIGITO_BANRISUL
		].join('-');
	};

	Banrisul.prototype.getNumeroFormatado = function() {
		return NUMERO_BANRISUL;
	};

	Banrisul.prototype.getCarteiraFormatado = function(beneficiario) {
		return pad(beneficiario.getCarteira(), 2, '0');
	};

	Banrisul.prototype.getCarteiraTexto = function(beneficiario) {
		return pad(beneficiario.getCarteira(), 2, '0');
	};

	Banrisul.prototype.getCodigoFormatado = function(beneficiario) {
		return pad(beneficiario.getCodigoBeneficiario(), 7, '0');
	};

	Banrisul.prototype.getImagem = function() {
		return path.join(__dirname, 'logotipos/banrisul.png');
	};

	Banrisul.prototype.getNossoNumeroFormatado = function(beneficiario) {
		return pad(beneficiario.getNossoNumero(), 8, '0');
	};

	Banrisul.prototype.getNossoNumeroECodigoDocumento = function(boleto) {
		var beneficiario = boleto.getBeneficiario();
		var duploDigito = this.calculaDuploDigito(beneficiario);

		return [
			this.getNossoNumeroFormatado(beneficiario),
			duploDigito
		].join('');
	};

	Banrisul.prototype.getNome = function() {
		return 'Banco do Estado do Rio Grande do Sul S.A.';
	};

	Banrisul.prototype.getImprimirNome = function() {
		return false;
	};

	Banrisul.prototype.getAgenciaECodigoBeneficiario = function(boleto) {
		var beneficiario = boleto.getBeneficiario(),

			codigo = this.getCodigoFormatado(beneficiario),
			digitoCodigo = beneficiario.getDigitoCodigoBeneficiario();

		if (digitoCodigo) {
			codigo += '.' + digitoCodigo;
		}

		return beneficiario.getAgenciaFormatada() + '.' + codigo;
	};

	Banrisul.novoBanrisul = function() {
		return new Banrisul();
	};

	return Banrisul;
})();

module.exports = Banrisul;
