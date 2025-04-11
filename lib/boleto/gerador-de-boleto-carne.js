'use strict';

const path = require('path');
const Pdf = require('pdfkit');
const { Base64Encode } = require('base64-stream');
const QRCode = require('qrcode');

const utils = require('../utils/utils');

const gerarLinhaDigitavel = require('./gerador-de-linha-digitavel');
const diretorioDeFontes = path.join(__dirname, '/fontes');
const timesNewRoman = path.join(diretorioDeFontes, 'Times New Roman.ttf');
const timesNewRomanNegrito = path.join(
  diretorioDeFontes,
  'Times New Roman Bold.ttf'
);
const timesNewRomanItalico = path.join(
  diretorioDeFontes,
  'Times New Roman Italic.ttf'
);
const timesNewRomanNegritoItalico = path.join(
  diretorioDeFontes,
  'Times New Roman Bold Italic.ttf'
);
const code25I = path.join(diretorioDeFontes, 'Code25I.ttf');

const pdfDefaults = {
  ajusteY: -80,
  ajusteX: 0,
  autor: '',
  titulo: '',
  criador: '',
  tamanhoDaFonteDoTitulo: 6,
  tamanhoDaFonte: 8,
  //tamanhoDaLinhaDigitavel: 12,
  tamanhoDaLinhaDigitavel: 10,
  //tamanhoDoCodigoDeBarras: 32,
  tamanhoDoCodigoDeBarras: 25,
  imprimirSequenciaDoBoleto: true,
  corDoLayout: 'black',
  alturaDaPagina: 600,
  larguraDaPagina: 844.68,
  exibirCampoUnidadeBeneficiaria: false,
  template: path.join(__dirname, '/templates/template.pdf'),
  informacoesPersonalizadas: function (pdf, x, y) {},
};

async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text); // Gera o QR Code em base64
  } catch (err) {
    console.error('Erro ao gerar o QR Code:', err);
  }
}

function formatCpfCnpj(cpfCnpj) {
  if (cpfCnpj.length === 11) {
    return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else return false;
}

class GeradorDeBoletoCarne {
  constructor(boletos) {
    if (!Array.isArray(boletos)) {
      boletos = [boletos];
    }
    this._boletos = boletos;
  }

  gerarPDF(args) {
    return new Promise(async (resolve) => {
      function i25(text) {
        var start = String.fromCharCode(201),
          stop = String.fromCharCode(202);

        return (
          text.match(/.{2}/g).reduce(function (acc, part) {
            var value = parseInt(part, 10),
              ascii;

            if (value >= 0 && value <= 93) {
              ascii = value + 33;
            }

            if (value >= 94 && value <= 99) {
              ascii = value + 101;
            }

            return acc + String.fromCharCode(ascii);
          }, start) + stop
        );
      }
      if (typeof args === 'function') {
        args = pdfDefaults;
      }

      args = utils.merge(pdfDefaults, args);

      const boletos = this._boletos;


      console.log(`Quantidade de boletos a serem gerados: ${boletos.length}`);

      const informacoesPersonalizadas = args.informacoesPersonalizadas;
      const pdf = new Pdf({
        size: [args.alturaDaPagina, args.larguraDaPagina],
        info: {
          Author: args.autor,
          Title: args.titulo,
          Creator: args.criador,
        },
      });

      if (args.stream) {
        pdf.pipe(args.stream);
      }

      pdf.registerFont('normal', timesNewRoman);
      pdf.registerFont('negrito', timesNewRomanNegrito);
      pdf.registerFont('italico', timesNewRomanItalico);
      pdf.registerFont('negrito-italico', timesNewRomanNegritoItalico);
      pdf.registerFont('codigoDeBarras', code25I);

      let contador = 1;
      let ajusteYAtual = args.ajusteY; 

      for (const [indice, boleto] of boletos.entries()) {
        // Ajusta o deslocamento vertical para o próximo boleto
        args.ajusteY = ajusteYAtual;

        // DESENHAR LAYOUT

        const banco = boleto.getBanco();
        const pagador = boleto.getPagador();
        const beneficiario = boleto.getBeneficiario();
        //var enderecoDoBeneficiario = beneficiario.getEndereco();
        const datas = boleto.getDatas();
        const codigoDeBarras = boleto._codigoBarras;
        const ESPACO_ENTRE_LINHAS = 18;
        //const ESPACO_ENTRE_LINHAS = 17;

        var zeroLinha = 105;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + zeroLinha)
          .lineTo(args.ajusteX + 130, args.ajusteY + zeroLinha)
          .stroke(args.corDoLayout);

        var zeroLinha1 = 105;
        pdf
          .moveTo(args.ajusteX + 150, args.ajusteY + zeroLinha1)
          .lineTo(args.ajusteX + 572, args.ajusteY + zeroLinha1)
          .stroke(args.corDoLayout);




          var colunaSuperior = 237;
          pdf
            .moveTo(
              args.ajusteX + colunaSuperior,
              args.ajusteY + zeroLinha1 - 17,
            )
            .lineTo(
              args.ajusteX + colunaSuperior,
              args.ajusteY + zeroLinha1
            )
            .stroke(args.corDoLayout);

            var colunaSuperior1 = colunaSuperior + 33;
            pdf
              .moveTo(
                args.ajusteX + colunaSuperior1,
                args.ajusteY + zeroLinha1 - 17,
              )
              .lineTo(
                args.ajusteX + colunaSuperior1,
                args.ajusteY + zeroLinha1
              )
              .stroke(args.corDoLayout);

        var linha1 = zeroLinha + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha1)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha1)
          .stroke(args.corDoLayout);

        var linha2 = linha1 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha2)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha2)
          .stroke(args.corDoLayout);

        var linha3 = linha2 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha3)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha3)
          .stroke(args.corDoLayout);

        var linha4 = linha3 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha4)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha4)
          .stroke(args.corDoLayout);
        var linha5 = linha4 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha5)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha5)
          .stroke(args.corDoLayout);
        var linha6 = linha5 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha6)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha6)
          .stroke(args.corDoLayout);

        var linha7 = linha6 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha7)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha7)
          .stroke(args.corDoLayout);

        var linha8 = linha7 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha8)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha8)
          .stroke(args.corDoLayout);

        var linha9 = linha8 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 15, args.ajusteY + linha9)
          .lineTo(args.ajusteX + 130, args.ajusteY + linha9)
          .stroke(args.corDoLayout);

        // CONJUNTO DE LINHA DA zeroLinha1

        var Layout2linha1 = zeroLinha1 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 150, args.ajusteY + Layout2linha1)
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linha1)
          .stroke(args.corDoLayout);
        var Layout2linha2 = Layout2linha1 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 150, args.ajusteY + Layout2linha2)
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linha2)
          .stroke(args.corDoLayout);

        var Layout2linha3 = Layout2linha2 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 150, args.ajusteY + Layout2linha3)
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linha3)
          .stroke(args.corDoLayout);

        var Layout2linha4 = Layout2linha3 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 150, args.ajusteY + Layout2linha4)
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linha4)
          .stroke(args.corDoLayout);

        var camposLaterais = 450;

        var Layout2linhaLateral1 = Layout2linha4 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(
            args.ajusteX + camposLaterais,
            args.ajusteY + Layout2linhaLateral1
          )
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linhaLateral1)
          .stroke(args.corDoLayout);

        var Layout2linhaLateral2 = Layout2linhaLateral1 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(
            args.ajusteX + camposLaterais,
            args.ajusteY + Layout2linhaLateral2
          )
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linhaLateral2)
          .stroke(args.corDoLayout);

        var Layout2linhaLateral3 = Layout2linhaLateral2 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(
            args.ajusteX + camposLaterais,
            args.ajusteY + Layout2linhaLateral3
          )
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linhaLateral3)
          .stroke(args.corDoLayout);

        var Layout2linhaLateral4 = Layout2linhaLateral3 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(
            args.ajusteX + camposLaterais,
            args.ajusteY + Layout2linhaLateral4
          )
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linhaLateral4)
          .stroke(args.corDoLayout);

        var Layout2linhaLateral5 = Layout2linhaLateral4 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 150, args.ajusteY + Layout2linhaLateral5)
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linhaLateral5)
          .stroke(args.corDoLayout);

        var Layout2linhaLateral6 =
          Layout2linhaLateral5 + +ESPACO_ENTRE_LINHAS + +ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 150, args.ajusteY + Layout2linhaLateral6)
          .lineTo(args.ajusteX + 572, args.ajusteY + Layout2linhaLateral6)
          .stroke(args.corDoLayout);

        ////
        var colunaLinhaDataDocumento = 207;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaDataDocumento,
            args.ajusteY + Layout2linha2
          )
          .lineTo(
            args.ajusteX + colunaLinhaDataDocumento,
            args.ajusteY + Layout2linha3
          )
          .stroke(args.corDoLayout);

        var colunaLinhaDataDocumento1 = colunaLinhaDataDocumento + 60;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaDataDocumento1,
            args.ajusteY + Layout2linha2
          )
          .lineTo(
            args.ajusteX + colunaLinhaDataDocumento1,
            args.ajusteY + Layout2linha3
          )
          .stroke(args.corDoLayout);

        var colunaLinhaDataDocumento2 = colunaLinhaDataDocumento1 + 60;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaDataDocumento2,
            args.ajusteY + Layout2linha2
          )
          .lineTo(
            args.ajusteX + colunaLinhaDataDocumento2,
            args.ajusteY + Layout2linha3
          )
          .stroke(args.corDoLayout);

        var colunaLinhaDataDocumento3 = colunaLinhaDataDocumento2 + 60;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaDataDocumento3,
            args.ajusteY + Layout2linha2
          )
          .lineTo(
            args.ajusteX + colunaLinhaDataDocumento3,
            args.ajusteY + Layout2linha3
          )
          .stroke(args.corDoLayout);

        //

        var colunaLinhaUsoDoBanco = 207;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaUsoDoBanco,
            args.ajusteY + Layout2linha3
          )
          .lineTo(
            args.ajusteX + colunaLinhaUsoDoBanco,
            args.ajusteY + Layout2linha4
          )
          .stroke(args.corDoLayout);

        var colunaLinhaUsoDoBanco1 = colunaLinhaUsoDoBanco + 60;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaUsoDoBanco1,
            args.ajusteY + Layout2linha3
          )
          .lineTo(
            args.ajusteX + colunaLinhaUsoDoBanco1,
            args.ajusteY + Layout2linha4
          )
          .stroke(args.corDoLayout);

        var colunaLinhaUsoDoBanco2 = colunaLinhaUsoDoBanco1 + 60;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaUsoDoBanco2,
            args.ajusteY + Layout2linha3
          )
          .lineTo(
            args.ajusteX + colunaLinhaUsoDoBanco2,
            args.ajusteY + Layout2linha4
          )
          .stroke(args.corDoLayout);

        var colunaLinhaUsoDoBanco3 = colunaLinhaUsoDoBanco2 + 60;
        pdf
          .moveTo(
            args.ajusteX + colunaLinhaUsoDoBanco3,
            args.ajusteY + Layout2linha3
          )
          .lineTo(
            args.ajusteX + colunaLinhaUsoDoBanco3,
            args.ajusteY + Layout2linha4
          )
          .stroke(args.corDoLayout);

        var colunaLateral1 = 450;
        pdf
          .moveTo(
            args.ajusteX + colunaLateral1,
            args.ajusteY + zeroLinha1 - 0.5
          )
          .lineTo(
            args.ajusteX + colunaLateral1,
            args.ajusteY + Layout2linhaLateral5
          )
          .stroke(args.corDoLayout);

        var colunaLateral2 = 572;
        pdf
          .moveTo(
            args.ajusteX + colunaLateral2,
            args.ajusteY + zeroLinha1 - 0.5
          )
          .lineTo(
            args.ajusteX + colunaLateral2,
            args.ajusteY + Layout2linhaLateral6
          )
          .stroke(args.corDoLayout);
        //

        var margemDaLinhaSeparadoraCorte = 16;

        var linhaSeparadora =
          Layout2linhaLateral6 + margemDaLinhaSeparadoraCorte + 20;

        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linhaSeparadora)
          .lineTo(args.ajusteX + 572, args.ajusteY + linhaSeparadora)
          .dash(3, { space: 5 })
          .stroke(args.corDoLayout);

          var colunaSeparadoraX = 140;
          pdf
          .moveTo(args.ajusteX + colunaSeparadoraX, args.ajusteY + zeroLinha1 - 17) 
          .lineTo(args.ajusteX + colunaSeparadoraX, args.ajusteY + linhaSeparadora - 7) 
          .dash(3, { space: 5 }) 
          .stroke(args.corDoLayout);

        /// IMPRIMIR LAYOUT
        var titulos = utils.merge(
          {
            instrucoes: 'Instruções',
            informativo: 'INFORMATIVO',
            dataDocumento: 'Data Documento',
            nomeDoPagador: 'Nome do Cliente',
            agenciaECodigoDoBeneficiario: 'Agência / Código do Beneficiário',
            nossoNumero: 'Nosso Número',
            especie: 'Espécie',
            especieDoDocumento: 'Espécie Doc.',
            quantidade: 'Quantidade',
            numeroDoDocumento: 'Nº do Documento',
            dataDeProcessamento: 'Data Processamento',
            valorDoDocumento: 'Valor do Documento',
            valor: 'Valor',
            carteira: 'Carteira',
            moraMulta: '(+) Mora / Multa / Juros',
            localDoPagamento: 'Local do Pagamento',
            igualDoValorDoDocumento: '(=) ',
          },
          banco.titulos || {}
        );

        var margemDaLinhaSeparadora = 16,
          divisoresVerticais = linha1 + 2 * margemDaLinhaSeparadora - 4,
          margemDoSegundoBloco = 25,
          margemDoSegundoBlocoLayout = margemDoSegundoBloco - 4,
          alturaDoLogotipoDoBanco = 15;

        var linha001 = divisoresVerticais + alturaDoLogotipoDoBanco + 4;

        const linhaDigitavel = gerarLinhaDigitavel(boleto._linhaDigitavel);

        const logoSupeirior = zeroLinha - 17.25;
        const logoSupeirior1 = zeroLinha1 - 17.25;

        pdf.image(
          banco.getImagem(),
          args.ajusteX + margemDoSegundoBlocoLayout,
          args.ajusteY + logoSupeirior,
          {
            height: alturaDoLogotipoDoBanco,
          }
        );

        banco.imprimirNome &&
          pdf
            .font('negrito')
            .fontSize(args.tamanhoDaLinhaDigitavel)
            .text(
              banco.nome,
              args.ajusteX + margemDoSegundoBlocoLayout + 26,
              args.ajusteY + linha1,
              {
                lineBreak: false,
                width: 100,
                align: 'left',
              }
            );

        pdf.image(
          banco.getImagem(),
          args.ajusteX + margemDoSegundoBlocoLayout + 135,
          args.ajusteY + logoSupeirior1,
          {
            height: alturaDoLogotipoDoBanco,
          }
        );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaLinhaDigitavel)
          .text(
            banco.getNumeroFormatadoComDigito(),
            args.ajusteX + margemDoSegundoBlocoLayout + 220,
            args.ajusteY + logoSupeirior1 + 4,
            {
              lineBreak: false,
              //width: 39.8,
              align: 'center',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaLinhaDigitavel)
          .text(
            linhaDigitavel,
            args.ajusteX + margemDoSegundoBlocoLayout + 260,
            args.ajusteY + logoSupeirior1  + 4,
            {
              lineBreak: false,
              width: 400,
             // align: 'right',
            }
          );

        //var tamanhoDasCelulasADireita = 124.5;
        var tamanhoDasCelulasADireita = 104.5;
        pdf
        .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            'Vencimento',
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + zeroLinha,
            {
              lineBreak: false,
              // width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getVencimentoFormatado(),
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + zeroLinha + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.agenciaECodigoDoBeneficiario,
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            banco.getAgenciaECodigoBeneficiario(boleto),
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha1 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.nossoNumero,
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            beneficiario._nossoNumero,
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha2 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.igualDoValorDoDocumento + titulos.valorDoDocumento,
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha3,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorFormatadoBRL(),
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha3 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(-) Desconto / Abatimento',
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha4,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDescontosFormatadoBRL(),
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha4 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.moraMulta,
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha6,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(-) Outras Deduções',
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha5,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDeducoesFormatadoBRL(),
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha5 + 7,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(+) Outros Acréscimos',
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha7,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(=) Valor Cobrado',
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha8,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text('Pagador', args.ajusteX + 20, args.ajusteY + linha9, {
            lineBreak: false,
            width: 294,
            align: 'left',
          });

          pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            pagador.getNomeSomente(),
            args.ajusteX + 20,
            args.ajusteY + linha9 + 7,
            {
              lineBreak: true, 
              width: 100, 
              align: 'left', 
            }
          );
        //lado 2

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.localDoPagamento,
            args.ajusteX + margemDoSegundoBlocoLayout + 135,
            args.ajusteY + zeroLinha1,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        boleto
          .getLocaisDePagamento()
          .forEach(function (localDePagamento, indice) {
            if (indice > 1) {
              return;
            }

            pdf
              .font('normal')
              .fontSize(args.tamanhoDaFonteDoTitulo)
              .text(
                localDePagamento,
                args.ajusteX + margemDoSegundoBlocoLayout + 135,
                args.ajusteY +
                  (zeroLinha1 +
                    2 -
                    args.tamanhoDaFonte +
                    indice * args.tamanhoDaFonte),
                {
                  lineBreak: false,
                  width: 400,
                  align: 'left',
                }
              );
          });

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            'Beneficiário',
            args.ajusteX + margemDoSegundoBlocoLayout + 135,
            args.ajusteY + Layout2linha1,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            beneficiario.getIdentificacao(),
            args.ajusteX + margemDoSegundoBlocoLayout + 135,
            args.ajusteY + Layout2linha1 + 7,
            {
              lineBreak: false,
              width: 400,
              align: 'left',
            }
          );

        // linha data do documento
        var tituloDataDocumento = margemDoSegundoBlocoLayout + 135;
        var tituloNumeroDoDocumento = tituloDataDocumento + 58,
          tituloCip = tituloNumeroDoDocumento + 110;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.dataDocumento,
            args.ajusteX + tituloDataDocumento,
            args.ajusteY + Layout2linha2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getDocumentoFormatado(),
            args.ajusteX + margemDoSegundoBlocoLayout + 135,
            args.ajusteY + Layout2linha2 + 7,
            {
              lineBreak: false,
              width: 61.5,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getNumeroDoDocumentoFormatado(),
            args.ajusteX + margemDoSegundoBlocoLayout + 135 + 65,
            args.ajusteY + Layout2linha2 + 7,
            {
              lineBreak: false,
              width: 84,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.numeroDoDocumento,
            args.ajusteX + tituloNumeroDoDocumento,
            args.ajusteY + Layout2linha2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        var tituloEspecieDoc = tituloNumeroDoDocumento + 60;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.especieDoDocumento,
            args.ajusteX + tituloEspecieDoc,
            args.ajusteY + Layout2linha2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getEspecieDocumento(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90 + 70,
            args.ajusteY + Layout2linha2 + 7,
            {
              lineBreak: false,
              width: 81,
              align: 'center',
            }
          );

        var tituloAceite = tituloEspecieDoc + 70;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            'Aceite',
            args.ajusteX + tituloAceite,
            args.ajusteY + Layout2linha2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getAceiteFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90 + 145,
            args.ajusteY + Layout2linha2 + 7,
            {
              lineBreak: false,
              width: 55,
              align: 'center',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getProcessamentoFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90 + 215,
            args.ajusteY + Layout2linha2 + 7,
            {
              lineBreak: false,
              width: 93.5,
              align: 'left',
            }
          );

        var tituloDataProcessamento = tituloAceite + 50;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.dataDeProcessamento,
            args.ajusteX + tituloDataProcessamento,
            args.ajusteY + Layout2linha2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );
        // linha Uso do banco

        var tituloUsoDoBancoX = margemDoSegundoBloco + 135;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            'Uso do Banco',
            args.ajusteX + tituloUsoDoBancoX,
            args.ajusteY + Layout2linha3,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        var tituloCarteira = tituloUsoDoBancoX + 65;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.carteira,
            args.ajusteX + tituloCarteira,
            args.ajusteY + Layout2linha3,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            banco.getCarteiraTexto(beneficiario),
            args.ajusteX + margemDoSegundoBlocoLayout + 135 + 44,
            args.ajusteY + Layout2linha3 + 7,
            {
              lineBreak: false,
              width: 71,
              align: 'center',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getEspecieMoeda(),
            args.ajusteX + margemDoSegundoBloco + 135 + 100,
            args.ajusteY + Layout2linha3 + 7,
            {
              lineBreak: false,
              width: 71,
              align: 'center',
            }
          );

        var tituloEspecieMoeda = tituloCarteira + 60;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.especie,
            args.ajusteX + tituloEspecieMoeda,
            args.ajusteY + Layout2linha3,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        var tituloQuantidadeMoeda = tituloEspecieMoeda + 60;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.quantidade,
            args.ajusteX + tituloQuantidadeMoeda,
            args.ajusteY + Layout2linha3,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        var tituloValorMoeda = tituloQuantidadeMoeda + 65;
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.valor,
            args.ajusteX + tituloValorMoeda,
            args.ajusteY + Layout2linha3,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        // linha instrucoes
        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.instrucoes,
            args.ajusteX + margemDoSegundoBloco + 135,
            args.ajusteY + Layout2linha4,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        var instrucaoY = Layout2linha4 + 12;
        boleto.getInstrucoes().forEach(function (instrucao, indice) {
          pdf
            .font('normal')
            .fontSize(args.tamanhoDaFonte)
            .text(
              instrucao,
              args.ajusteX + margemDoSegundoBloco + 135,
              args.ajusteY + instrucaoY + indice * args.tamanhoDaFonte,
              {
                lineBreak: false,
                width: 400,
                align: 'left',
              }
            );
        });

        // lateral
        var colunaLateralDireita = 455;

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            'Vencimento',
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + zeroLinha1 + 1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getVencimentoFormatado(),
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + zeroLinha1 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.agenciaECodigoDoBeneficiario,
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha1 + 1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            banco.getAgenciaECodigoBeneficiario(boleto),
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha1 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.nossoNumero,
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            beneficiario._nossoNumero,
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha2 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.igualDoValorDoDocumento + titulos.valorDoDocumento,
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha3,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorFormatadoBRL(),
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha3 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(-) Desconto / Abatimento',
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha4,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDescontosFormatadoBRL(),
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linha4 + 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: 'right',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(-) Outras Deduções',
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDeducoesFormatadoBRL(),
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linhaLateral1 + 7,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.moraMulta,
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linhaLateral2,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(+) Outros Acréscimos',
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linhaLateral3,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            '(=) Valor Cobrado',
            args.ajusteX + colunaLateralDireita,
            args.ajusteY + Layout2linhaLateral4,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        pdf
          .font('negrito')
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            'Pagador',
            args.ajusteX + margemDoSegundoBlocoLayout + 135,
            args.ajusteY + Layout2linhaLateral5,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        var cpfCnpj = formatCpfCnpj(pagador._registroNacional);
        if (!cpfCnpj) {
          cpfCnpj = '';
        } else {
          cpfCnpj = `(CPF: ${cpfCnpj})`;
        }

        pdf
          .font('normal')
          .fontSize(args.tamanhoDaFonte) // TODO: Diminuir tamanho da fonte caso seja maior que X caracteres
          .text(
            `${pagador.getIdentificacao()} ${cpfCnpj}`,
            args.ajusteX + margemDoSegundoBlocoLayout + 135,
            args.ajusteY + Layout2linhaLateral5 + 7,
            {
              lineBreak: false,
              width: 294,
              align: 'left',
            }
          );

        var enderecoDoPagador = pagador.getEndereco();
        if (enderecoDoPagador) {
          var espacamento = args.tamanhoDaFonte;

          if (enderecoDoPagador.getPrimeiraLinha()) {
            pdf
              .font('normal')
              .fontSize(args.tamanhoDaFonte)
              .text(
                enderecoDoPagador.getPrimeiraLinha(),
                args.ajusteX + margemDoSegundoBlocoLayout + 135,
                args.ajusteY + Layout2linhaLateral5 + 10 + espacamento,
                {
                  lineBreak: false,
                  width: 535,
                  align: 'left',
                }
              );

            espacamento += espacamento;
          }

          if (enderecoDoPagador.getSegundaLinha()) {
            pdf
              .font('normal')
              .fontSize(args.tamanhoDaFonte)
              .text(
                enderecoDoPagador.getSegundaLinha(),
                args.ajusteX + margemDoSegundoBlocoLayout + 135,
                args.ajusteY + Layout2linhaLateral5 + 10 + espacamento,
                {
                  lineBreak: false,
                  width: 535,
                  align: 'left',
                }
              );
          }
        }

        //
        pdf
          .font('codigoDeBarras')
          .fontSize(args.tamanhoDoCodigoDeBarras)
          .text(
            i25(codigoDeBarras),
            args.ajusteX + margemDoSegundoBlocoLayout + 135,
            args.ajusteY + Layout2linhaLateral6 + 4.5,
            {
              lineBreak: false,
              width: 340,
              align: 'left',
            }
          );

        informacoesPersonalizadas(
          pdf,
          args.ajusteX + margemDoSegundoBlocoLayout,
          args.ajusteY +
            Layout2linhaLateral6 +
            args.tamanhoDoCodigoDeBarras +
            10
        );

        // Incrementa o deslocamento vertical para o próximo boleto
        ajusteYAtual += 270; // Ajuste conforme necessário para evitar sobreposição

        // Adiciona uma nova página após imprimir 3 carnês
        if (contador === 3) {
          pdf.addPage();
          contador = 1; // Reinicia o contador
          ajusteYAtual = args.ajusteY; // Reinicia o deslocamento vertical para a nova página
        } else {
          contador++; // Incrementa o contador
        }
      }

      if (args.base64) {
        var finalString = '';
        var stream = pdf.pipe(new Base64Encode());

        pdf.end();

        stream.on('data', function (chunk) {
          finalString += chunk;
        });

        stream.on('end', function () {
          resolve(finalString);
        });
      } else {
        pdf.end();
        resolve(pdf);
      }
    });
  }

  gerarLinhaDigitavel() {
    return new Promise((resolve) => {
      const boletos = this._boletos;
      const linhaDigitavel = [];
      boletos.forEach((boleto, indice) => {
        const banco = boleto.getBanco();
        const numeroDocumento = boleto.getNumeroDoDocumentoFormatado();
        const linha = gerarLinhaDigitavel(
          banco.geraCodigoDeBarrasPara(boleto),
          banco
        );
        if (indice <= boletos.length - 1) {
          linhaDigitavel.push({ linha, numeroDocumento });
        }
      });
      resolve(linhaDigitavel);
    });
  }
}

module.exports = GeradorDeBoletoCarne;
