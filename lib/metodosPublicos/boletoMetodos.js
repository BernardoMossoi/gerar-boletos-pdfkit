const fs = require('fs');
const Boleto = require('../utils/functions/boletoUtils');
const BoletoStringify = require('../stringify/boletoStringify');

module.exports = class Boletos {
  constructor({ banco, pagador, boleto, beneficiario, instrucoes, informativo }) {
    this.banco = banco;
    this.pagador = pagador;
    this.boleto = boleto;
    this.beneficiario = beneficiario;
    this.instrucoes = instrucoes;
    this.informativo = informativo;
    this.boletoInfo;
  }

  gerarBoleto() {
    const dataInstance = Boleto.Datas;
    const { datas, valor, especieDocumento, numeroDocumento } = this.boleto;

    this.boletoInfo = Boleto.Boleto.novoBoleto()
      .comDatas(dataInstance.novasDatas()
      .comVencimento(datas.vencimento)
      .comProcessamento(datas.processamento)
      .comDocumento(datas.documentos))
      .comBeneficiario(BoletoStringify.createBeneficiario(this.beneficiario))
      .comPagador(BoletoStringify.createPagador(this.pagador))
      .comBanco(this.banco)
      .comValorBoleto(parseFloat(valor).toFixed(2))
      .comNumeroDoDocumento(numeroDocumento)
      .comEspecieDocumento(especieDocumento)
      .comInstrucoes(BoletoStringify.createInstrucoes(this.instrucoes))
      .comInformativo(BoletoStringify.createInformativo(this.informativo))
      .comCodigoBarras(this.boleto.codigoBarras)
      .comLinhaDigitavel(this.boleto.linhaDigitavel)
      .comQrCode(this.boleto.pixQrCode)
      .comIdUnico();
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
    return new Promise((resolve) => new Boleto.Gerador(this.boletoInfo).gerarPDF({
      creditos: '',
      stream,
    }).then(() => resolve({ boleto: this.boleto, stream })));
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
