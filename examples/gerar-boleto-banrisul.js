const { Bancos, Boletos, streamToPromise } = require('../lib/index');

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
    datas: {
      vencimento: '04-15-2024',
      processamento: '03-02-2024',
      documentos: '03-02-2024'
    }
  }
};

const novoBoleto = new Boletos(boleto);
novoBoleto.gerarBoleto();

novoBoleto.pdfFile().then(async ({ stream }) => {
  // ctx.res.set('Content-type', 'application/pdf');	
  await streamToPromise(stream);
}).catch((error) => {
  return error;
});
