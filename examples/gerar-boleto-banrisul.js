const { Bancos, Boletos, streamToPromise } = require('../lib/index');
const QrCode = require('qrcode');

async function gerarQrCodePix(emv) {
  try {
    const qrCodeDataURL = await QrCode.toDataURL(emv, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1,
    });
    return qrCodeDataURL;
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
    return null;
  }
}

gerarBoletoBanrisul();

async function gerarBoletoBanrisul() {
  const boleto = {
    banco: new Bancos.Banrisul(),
    pagador: {
      nome: 'José da Silva',
      registroNacional: '12345678901',
      endereco: {
        logradouro: 'Rua dos Andradas, 1234',
        bairro: 'Centro Histórico',
        cidade: 'Porto Alegre',
        estadoUF: 'RS',
        cep: '90020-000'
      }
    },
    locaisDePagamento: [
      'Pagável em qualquer banco até o vencimento',
    ],
    informativo: [''],
    instrucoes: [
      'Após o vencimento Mora dia R$ 1,00',
      'Após o vencimento, multa de 2%',
      '',
      'SAC Banrisul: 0800-646-1515',
      'Ouvidoria Banrisul: 0800-644-2200'
    ],
    beneficiario: {
      nome: 'Empresa Exemplo LTDA',
      cnpj: '12345678000199',
      dadosBancarios: {
        carteira: '1',
        agencia: '1234',
        agenciaDigito: '0',
        conta: '0012345',
        contaDigito: '6',
        nossoNumero: '00189274', // Exemplo da documentação gerará DV 46
        nossoNumeroDigito: ''
      },
      endereco: {
        logradouro: 'Av. Borges de Medeiros, 123',
        bairro: 'Centro',
        cidade: 'Porto Alegre',
        estadoUF: 'RS',
        cep: '90020-020'
      }
    },
    boleto: {
      numeroDocumento: '1001',
      especieDocumento: 'DM',
      valor: 150.00,
      pixQrCode: '00020101021226900014br.gov.bcb.pix2568qrcodepix.banrisul.com.br/pix/v2/cobv/d02d51b4-c363-44b4-84a7-726b1cd3cd3552040000530398654041.005802BR5925EMPRESA EXEMPLO LTDA6013PORTO ALEGRE62070503***6304B3A4',
      datas: {
        vencimento: '04-15-2024',
        processamento: '03-02-2024',
        documentos: '03-02-2024'
      }
    }
  };

  if (boleto.boleto.pixQrCode) {
    boleto.boleto.imagemQrCode = await gerarQrCodePix(boleto.boleto.pixQrCode);
  }

  const novoBoleto = new Boletos(boleto);
  novoBoleto.gerarBoleto();

  novoBoleto.pdfFile().then(async ({ stream }) => {
    // ctx.res.set('Content-type', 'application/pdf');	
    await streamToPromise(stream);
  }).catch((error) => {
    return error;
  });
}
