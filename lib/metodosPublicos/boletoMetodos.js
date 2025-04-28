const fs = require('fs');
const Boleto = require('../utils/functions/boletoUtils');
const BoletoStringify = require('../stringify/boletoStringify');

module.exports = class Boletos {
  constructor(boletos) {
    if (!Array.isArray(boletos)) {
      boletos = [boletos];
    }

    this.boletos = boletos;
    this.boletoInfo = [];
  }

  gerarBoleto() {
    const dataInstance = Boleto.Datas;

    for (const boleto of this.boletos) {
      const { datas, valor, especieDocumento, numeroDocumento, valorCobrado, ValorMoraMultaJuros } =
        boleto.boleto;

      const boletoInfo = Boleto.Boleto.novoBoleto()
        .comDatas(
          dataInstance
            .novasDatas()
            .comVencimento(datas.vencimento)
            .comProcessamento(datas.processamento)
            .comDocumento(datas.documentos)
        )
        .comBeneficiario(
          BoletoStringify.createBeneficiario(boleto.beneficiario)
        )
        .comPagador(BoletoStringify.createPagador(boleto.pagador))
        .comBanco(boleto.banco)
        .comValorBoleto(parseFloat(valor).toFixed(2))
        .comNumeroDoDocumento(numeroDocumento)
        .comEspecieDocumento(especieDocumento)
        .comInstrucoes(BoletoStringify.createInstrucoes(boleto.instrucoes))
        .comInformativo(BoletoStringify.createInformativo(boleto.informativo))
        .comCodigoBarras(boleto.boleto.codigoBarras)
        .comLinhaDigitavel(boleto.boleto.linhaDigitavel)
        .comQrCode(boleto.boleto.pixQrCode)
        .comValorCobrado(parseFloat(valorCobrado).toFixed(2))
        .comValorDescontos(
          boleto.boleto.valorDescontos
            ? parseFloat(boleto.boleto.valorDescontos).toFixed(2)
            : 0
        )
        .comValorMoraMultaJuros(parseFloat(ValorMoraMultaJuros).toFixed(2))
        .comIdUnico();

      this.boletoInfo.push(boletoInfo);
    }
  }

  pdfFile(modelo, dir = './tmp/boletos', filename = 'boleto') {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const stream = fs.createWriteStream(`${dir}/${filename}.pdf`);

    switch (modelo) {
      case 'carne':
        return new Promise((resolve) =>
          new Boleto.GeradorCarne(this.boletoInfo)
            .gerarPDF({
              creditos: '',
              stream,
            })
            .then(() => resolve({ boleto: this.boleto, stream }))
        );
      default:
        return new Promise((resolve) =>
          new Boleto.Gerador(this.boletoInfo)
            .gerarPDF({
              creditos: '',
              stream,
            })
            .then(() => resolve({ boleto: this.boleto, stream }))
        );
    }
  }
  pdfStream(stream) {
    return new Promise((resolve) =>
      new Boleto.Gerador(this.boletoInfo)
        .gerarPDF({
          creditos: '',
          stream,
        })
        .then(() => resolve({ boleto: this.boleto, stream }))
    );
  }

  pdfBuffer(modelo) {
    switch (modelo) {
      case 'carne':
        return new Promise((resolve) =>
          new Boleto.GeradorCarne(this.boletoInfo)
            .gerarPDF({
              creditos: '',
              base64: true,
            })
            .then((base64) =>
              resolve({
                boleto: this.boleto,
                buffer: Buffer.from(base64, 'base64'),
              })
            )
        );
      default:
        return new Promise((resolve) =>
          new Boleto.Gerador(this.boletoInfo)
            .gerarPDF({
              creditos: '',
              base64: true,
            })
            .then((base64) =>
              resolve({
                boleto: this.boleto,
                buffer: Buffer.from(base64, 'base64'),
              })
            )
        );
    }
  }
};
