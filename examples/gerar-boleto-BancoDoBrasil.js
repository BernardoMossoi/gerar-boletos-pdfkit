const { Bancos, Boletos, streamToPromise } = require('../lib/index');
const QrCode = require('qrcode');

//gerarBoletoBB(3);

gerarBoletoBB();
async function gerarBoletoBB() {
  const boleto = {
    banco: new Bancos.BancoBrasil(),
    pagador: {
      nome: 'José Bonifácio de Andrada',
      registroNacional: '20031219000246',
      endereco: {
        logradouro: 'Rua Pedro Lessa, 15',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estadoUF: 'RJ',
        cep: '20030-030',
      },
    },
    informativo: [''],
    instrucoes: [
      'Após o vencimento Mora dia R$ 1,59',
      'Após o vencimento, multa de 2%',
      '',
      '',
      ' ',
    ],
    beneficiario: {
      nome: 'Empresa Fictícia LTDA',
      cnpj: '43.576.788/0001-91',
      dadosBancarios: {
        carteira: '17',
        agencia: '4559-X',
        conta: '115737-X',
        nossoNumero: '22219670000000007',
      },
      endereco: {
        logradouro: 'Rua Pedro Lessa, 15',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estadoUF: 'RJ',
        cep: '20030-030',
      },
    },
    boleto: {
      numeroDocumento: '6',
      especieDocumento: 'DM',
      valor: 125448.54,
      linhaDigitavel: '00190000090222196700900000007179998810000000100',
      codigoBarras: '00199988100000001000000002221967000000000717',
      pixQrCode:
        '00020101021226900014br.gov.bcb.pix2568qrcodepix.bb.com.br/pix/v2/cobv/d02d51b4-c363-44b4-84a7-726b1cd3cd3552040000530398654041.005802BR5925SORVEDOCES INDUSTRIA E CO6010VILA VELHA62070503***6304B3A4',
      datas: {
        vencimento: '2025-04-22',
        processamento: '2024-10-25',
        documentos: '2024-10-25',
      },
    },
  };

  if (boleto.boleto.emv) {
    boleto.boleto.imagemQrCode = await gerarQrCodePix(boleto.boleto.emv);
  }

  const novoBoleto = new Boletos([
    boleto,
    boleto,
    boleto,
    boleto,
    boleto,
    boleto,
  ]);
  novoBoleto.gerarBoleto();

  novoBoleto
    .pdfFile('carne')
    //.pdfFile()
    .then(async ({ stream }) => {
      // ctx.res.set('Content-type', 'application/pdf');
      await streamToPromise(stream);
    })
    .catch((error) => {
      return error;
    });
}

async function gerarQrCodePix(emv) {
  return QrCode.toDataURL(emv, { errorCorrectionLevel: 'H' });
}
