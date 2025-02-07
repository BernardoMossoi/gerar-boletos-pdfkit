"use strict";

const path = require("path");
const Pdf = require("pdfkit");
const { Base64Encode } = require("base64-stream");
const QRCode = require("qrcode");

const utils = require("../utils/utils");

const gerarLinhaDigitavel = require("./gerador-de-linha-digitavel");
const diretorioDeFontes = path.join(__dirname, "/fontes");
const timesNewRoman = path.join(diretorioDeFontes, "Times New Roman.ttf");
const timesNewRomanNegrito = path.join(
  diretorioDeFontes,
  "Times New Roman Bold.ttf"
);
const timesNewRomanItalico = path.join(
  diretorioDeFontes,
  "Times New Roman Italic.ttf"
);
const timesNewRomanNegritoItalico = path.join(
  diretorioDeFontes,
  "Times New Roman Bold Italic.ttf"
);
const code25I = path.join(diretorioDeFontes, "Code25I.ttf");

const pdfDefaults = {
  ajusteY: -80,
  ajusteX: 0,
  autor: "",
  titulo: "",
  criador: "",
  tamanhoDaFonteDoTitulo: 8,
  tamanhoDaFonte: 10,
  tamanhoDaLinhaDigitavel: 14,
  tamanhoDoCodigoDeBarras: 32,
  imprimirSequenciaDoBoleto: true,
  corDoLayout: "black",
  alturaDaPagina: 600,
  larguraDaPagina: 844.68,
  exibirCampoUnidadeBeneficiaria: false,
  template: path.join(__dirname, "/templates/template.pdf"),
  informacoesPersonalizadas: function (pdf, x, y) {},
};

async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text); // Gera o QR Code em base64
  } catch (err) {
    console.error("Erro ao gerar o QR Code:", err);
  }
}

function formatCpfCnpj(cpfCnpj) {
  if (cpfCnpj.length === 11) {
    return cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else return false;
}

class GeradorDeBoleto {
  constructor(boletos) {
    if (!Array.isArray(boletos)) {
      boletos = [boletos];
    }
    this._boletos = boletos;
  }

  gerarPDF(args) {
    return new Promise(async (resolve) => {
      if (typeof args === "function") {
        args = pdfDefaults;
      }

      args = utils.merge(pdfDefaults, args);

      const boletos = this._boletos;
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

      pdf.registerFont("normal", timesNewRoman);
      pdf.registerFont("negrito", timesNewRomanNegrito);
      pdf.registerFont("italico", timesNewRomanItalico);
      pdf.registerFont("negrito-italico", timesNewRomanNegritoItalico);
      pdf.registerFont("codigoDeBarras", code25I);

      for (const [indice, boleto] of boletos.entries()) {
        // DESENHAR LAYOUT

        const banco = boleto.getBanco();
        const pagador = boleto.getPagador();
        const beneficiario = boleto.getBeneficiario();
        //var enderecoDoBeneficiario = beneficiario.getEndereco();
        const datas = boleto.getDatas();

        const ESPACO_ENTRE_LINHAS = 23;

        if (boleto._qrCode) {
          //var zeroLinha = 220;
          var zeroLinha = 190;
        } else {
          zeroLinha = 120;
        }

        var linha1 = zeroLinha + 45;
        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linha1)
          .lineTo(args.ajusteX + 572, args.ajusteY + linha1)
          .stroke(args.corDoLayout);

        var linha2 = linha1 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linha2)
          .lineTo(args.ajusteX + 572, args.ajusteY + linha2)
          .stroke(args.corDoLayout);

        var linha3 = linha2 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linha3)
          .lineTo(
            args.ajusteX + (banco.exibirReciboDoPagadorCompleto ? 572 : 329),
            args.ajusteY + linha3
          )
          .stroke(args.corDoLayout);

        if (banco.exibirReciboDoPagadorCompleto) {
          var linha4Opcional = linha3 + ESPACO_ENTRE_LINHAS;
          pdf
            .moveTo(args.ajusteX + 27, args.ajusteY + linha4Opcional)
            .lineTo(args.ajusteX + 572, args.ajusteY + linha4Opcional)
            .stroke(args.corDoLayout);
        }

        var linha5 = linha4Opcional + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linha5)
          .lineTo(
            args.ajusteX + (banco.exibirReciboDoPagadorCompleto ? 572 : 329),
            args.ajusteY + linha5
          )
          .stroke(args.corDoLayout);

        var linhaTeste = linha5 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 434, args.ajusteY + linhaTeste)
          .lineTo(args.ajusteX + 572, args.ajusteY + linhaTeste)
          .stroke(args.corDoLayout);

        var linha6 = linhaTeste + 90;
        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linha6)
          .lineTo(args.ajusteX + 572, args.ajusteY + linha6)
          .stroke(args.corDoLayout);

        var linha7 = linha6 + 50;
        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linha7)
          .lineTo(args.ajusteX + 572, args.ajusteY + linha7)
          .stroke(args.corDoLayout);

        var linhaLateral1 = linhaTeste + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 434, args.ajusteY + linhaLateral1)
          .lineTo(args.ajusteX + 571, args.ajusteY + linhaLateral1)
          .stroke(args.corDoLayout);

        var linhaLateral2 = linhaLateral1 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 434, args.ajusteY + linhaLateral2)
          .lineTo(args.ajusteX + 571, args.ajusteY + linhaLateral2)
          .stroke(args.corDoLayout);

        var linhaLateral3 = linhaLateral2 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + 434, args.ajusteY + linhaLateral3)
          .lineTo(args.ajusteX + 571, args.ajusteY + linhaLateral3)
          .stroke(args.corDoLayout);

        var coluna1 = 27;
        pdf
          .moveTo(args.ajusteX + coluna1, args.ajusteY + linha1 - 0.5)
          .lineTo(args.ajusteX + coluna1, args.ajusteY + linha7)
          .stroke(args.corDoLayout);

        var coluna5 = 572;
        pdf
          .moveTo(args.ajusteX + coluna5, args.ajusteY + linha1 - 0.5)
          .lineTo(args.ajusteX + coluna5, args.ajusteY + linha7)
          .stroke(args.corDoLayout);

        var colunaLateralLayout1 = 434;
        pdf
          .moveTo(args.ajusteX + colunaLateralLayout1, args.ajusteY + linha1)
          .lineTo(args.ajusteX + colunaLateralLayout1, args.ajusteY + linha6)
          .stroke(args.corDoLayout);

        var coluna001 = 93.5;
        pdf
          .moveTo(args.ajusteX + coluna001, args.ajusteY + linha3)
          .lineTo(args.ajusteX + coluna001, args.ajusteY + linha4Opcional)
          .stroke(args.corDoLayout);

        var coluna002 = coluna001 + 92.5;
        pdf
          .moveTo(args.ajusteX + coluna002, args.ajusteY + linha3)
          .lineTo(args.ajusteX + coluna002, args.ajusteY + linha4Opcional)
          .stroke(args.corDoLayout);

        var coluna003 = coluna002 + 84.5;
        pdf
          .moveTo(args.ajusteX + coluna003, args.ajusteY + linha3)
          .lineTo(args.ajusteX + coluna003, args.ajusteY + linha4Opcional)
          .stroke(args.corDoLayout);

        var coluna004 = coluna003 + 61;
        pdf
          .moveTo(args.ajusteX + coluna004, args.ajusteY + linha3)
          .lineTo(args.ajusteX + coluna004, args.ajusteY + linha4Opcional)
          .stroke(args.corDoLayout);

        var coluna24 = 93.5;
        pdf
          .moveTo(args.ajusteX + coluna24, args.ajusteY + linha4Opcional)
          .lineTo(args.ajusteX + coluna24, args.ajusteY + linha5)
          .stroke(args.corDoLayout);

        if (banco.exibirCampoCip) {
          pdf
            .moveTo(args.ajusteX + coluna24, args.ajusteY + linha4Opcional)
            .lineTo(args.ajusteX + coluna24, args.ajusteY + linha5)
            .stroke(args.corDoLayout);
        }

        var coluna281 = 26 + 106;
        pdf
          .moveTo(args.ajusteX + coluna281, args.ajusteY + linha4Opcional)
          .lineTo(args.ajusteX + coluna281, args.ajusteY + linha5)
          .stroke(args.corDoLayout);

        var coluna291 = coluna281 + 76.5;
        pdf
          .moveTo(args.ajusteX + coluna291, args.ajusteY + linha4Opcional)
          .lineTo(args.ajusteX + coluna291, args.ajusteY + linha5)
          .stroke(args.corDoLayout);

        var coluna2101 = coluna291 + 77;
        pdf
          .moveTo(args.ajusteX + coluna2101, args.ajusteY + linha4Opcional)
          .lineTo(args.ajusteX + coluna2101, args.ajusteY + linha5)
          .stroke(args.corDoLayout);

        var coluna2111 = coluna2101 + 92;
        pdf
          .moveTo(args.ajusteX + coluna2111, args.ajusteY + linha4Opcional)
          .lineTo(args.ajusteX + coluna2111, args.ajusteY + linha5)
          .stroke(args.corDoLayout);

        var colunaSuperior = 154;
        pdf
          .moveTo(args.ajusteX + colunaSuperior, args.ajusteY + linha1 - 25)
          .lineTo(args.ajusteX + colunaSuperior, args.ajusteY + linha1)
          .stroke(args.corDoLayout);

        var colunaSuperior2 = colunaSuperior + 41.5;
        pdf
          .moveTo(args.ajusteX + colunaSuperior2, args.ajusteY + linha1 - 25)
          .lineTo(args.ajusteX + colunaSuperior2, args.ajusteY + linha1)
          .stroke(args.corDoLayout);

        //////////////////

        var margemDaLinhaSeparadora = 16,
          divisoresVerticais = linha7 + 2 * margemDaLinhaSeparadora - 4,
          margemDoSegundoBloco = 30,
          margemDoSegundoBlocoLayout = margemDoSegundoBloco - 4,
          alturaDoLogotipoDoBanco = 20;

        var linha21 = divisoresVerticais + alturaDoLogotipoDoBanco + 4;
        pdf
          .moveTo(
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha21
          )
          .lineTo(args.ajusteX + 571, args.ajusteY + linha21)
          .stroke(args.corDoLayout);

        var linha22 = linha21 + ESPACO_ENTRE_LINHAS + 8;
        pdf
          .moveTo(
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha22
          )
          .lineTo(args.ajusteX + 571, args.ajusteY + linha22)
          .stroke(args.corDoLayout);

        var linha23 = linha22 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha23
          )
          .lineTo(args.ajusteX + 571, args.ajusteY + linha23)
          .stroke(args.corDoLayout);

        var linha24 = linha23 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha24
          )
          .lineTo(args.ajusteX + 571, args.ajusteY + linha24)
          .stroke(args.corDoLayout);

        var linha25 = linha24 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha25
          )
          .lineTo(args.ajusteX + 571, args.ajusteY + linha25)
          .stroke(args.corDoLayout);

        var camposLaterais = 434,
          linha26 = linha25 + ESPACO_ENTRE_LINHAS;

        pdf
          .moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha26)
          .lineTo(args.ajusteX + 571, args.ajusteY + linha26)
          .stroke(args.corDoLayout);

        var linha27 = linha26 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha27)
          .lineTo(args.ajusteX + 571, args.ajusteY + linha27)
          .stroke(args.corDoLayout);

        var linha28 = linha27 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha28)
          .lineTo(args.ajusteX + 571, args.ajusteY + linha28)
          .stroke(args.corDoLayout);

        if (args.exibirCampoUnidadeBeneficiaria) {
          var linha28_2 = linha28 + 12.4;
          pdf
            .moveTo(
              args.ajusteX + margemDoSegundoBlocoLayout,
              args.ajusteY + linha28_2
            )
            .lineTo(args.ajusteX + camposLaterais, args.ajusteY + linha28_2)
            .stroke(args.corDoLayout);
        }

        var linha29 = linha28 + ESPACO_ENTRE_LINHAS;
        pdf
          .moveTo(args.ajusteX + camposLaterais, args.ajusteY + linha29)
          .lineTo(args.ajusteX + 571, args.ajusteY + linha29)
          .stroke(args.corDoLayout);

        var linha211 = linha29 + ESPACO_ENTRE_LINHAS + 0.4;
        pdf
          .moveTo(
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha211
          )
          .lineTo(args.ajusteX + 571, args.ajusteY + linha211)
          .stroke(args.corDoLayout);

        var linha212 = linha211 + 56.6;
        pdf
          .moveTo(
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha212
          )
          .lineTo(args.ajusteX + 571, args.ajusteY + linha212)
          .stroke(args.corDoLayout);

        var coluna21 = margemDoSegundoBlocoLayout + 0.5;
        pdf
          .moveTo(args.ajusteX + coluna21, args.ajusteY + linha21)
          .lineTo(args.ajusteX + coluna21, args.ajusteY + linha212)
          .stroke(args.corDoLayout);

        var coluna22 = 571 - 0.5;
        pdf
          .moveTo(args.ajusteX + coluna22, args.ajusteY + linha21)
          .lineTo(args.ajusteX + coluna22, args.ajusteY + linha212)
          .stroke(args.corDoLayout);

        var coluna23 = camposLaterais;
        pdf
          .moveTo(args.ajusteX + coluna23, args.ajusteY + linha21)
          .lineTo(args.ajusteX + coluna23, args.ajusteY + linha211)
          .stroke(args.corDoLayout);

        var coluna24 = 93.5;
        pdf
          .moveTo(args.ajusteX + coluna24, args.ajusteY + linha23)
          .lineTo(args.ajusteX + coluna24, args.ajusteY + linha24)
          .stroke(args.corDoLayout);

        if (banco.exibirCampoCip) {
          pdf
            .moveTo(args.ajusteX + coluna24, args.ajusteY + linha24)
            .lineTo(args.ajusteX + coluna24, args.ajusteY + linha25)
            .stroke(args.corDoLayout);
        }

        var coluna25 = coluna24 + 92.5;
        pdf
          .moveTo(args.ajusteX + coluna25, args.ajusteY + linha23)
          .lineTo(args.ajusteX + coluna25, args.ajusteY + linha24)
          .stroke(args.corDoLayout);

        var coluna26 = coluna25 + 84.5;
        pdf
          .moveTo(args.ajusteX + coluna26, args.ajusteY + linha23)
          .lineTo(args.ajusteX + coluna26, args.ajusteY + linha24)
          .stroke(args.corDoLayout);

        var coluna27 = coluna26 + 61;
        pdf
          .moveTo(args.ajusteX + coluna27, args.ajusteY + linha23)
          .lineTo(args.ajusteX + coluna27, args.ajusteY + linha24)
          .stroke(args.corDoLayout);

        var coluna28 = margemDoSegundoBlocoLayout + 106;
        pdf
          .moveTo(args.ajusteX + coluna28, args.ajusteY + linha24)
          .lineTo(args.ajusteX + coluna28, args.ajusteY + linha25)
          .stroke(args.corDoLayout);

        var coluna29 = coluna28 + 76.5;
        pdf
          .moveTo(args.ajusteX + coluna29, args.ajusteY + linha24)
          .lineTo(args.ajusteX + coluna29, args.ajusteY + linha25)
          .stroke(args.corDoLayout);

        var coluna210 = coluna29 + 77;
        pdf
          .moveTo(args.ajusteX + coluna210, args.ajusteY + linha24)
          .lineTo(args.ajusteX + coluna210, args.ajusteY + linha25)
          .stroke(args.corDoLayout);

        var coluna211 = coluna210 + 92;
        pdf
          .moveTo(args.ajusteX + coluna211, args.ajusteY + linha24)
          .lineTo(args.ajusteX + coluna211, args.ajusteY + linha25)
          .stroke(args.corDoLayout);

        var coluna212 = 154;
        pdf
          .moveTo(args.ajusteX + coluna212, args.ajusteY + divisoresVerticais)
          .lineTo(args.ajusteX + coluna212, args.ajusteY + linha21)
          .stroke(args.corDoLayout);

        var coluna213 = coluna212 + 1;
        pdf
          .moveTo(args.ajusteX + coluna213, args.ajusteY + divisoresVerticais)
          .lineTo(args.ajusteX + coluna213, args.ajusteY + linha21)
          .stroke(args.corDoLayout);

        var coluna214 = coluna213 + 1;
        pdf
          .moveTo(args.ajusteX + coluna214, args.ajusteY + divisoresVerticais)
          .lineTo(args.ajusteX + coluna214, args.ajusteY + linha21)
          .stroke(args.corDoLayout);

        var coluna215 = coluna214 + 41.5;
        pdf
          .moveTo(args.ajusteX + coluna215, args.ajusteY + divisoresVerticais)
          .lineTo(args.ajusteX + coluna215, args.ajusteY + linha21)
          .stroke(args.corDoLayout);

        var coluna216 = coluna215 + 1;
        pdf
          .moveTo(args.ajusteX + coluna216, args.ajusteY + divisoresVerticais)
          .lineTo(args.ajusteX + coluna216, args.ajusteY + linha21)
          .stroke(args.corDoLayout);

        var coluna217 = coluna216 + 1;
        pdf
          .moveTo(args.ajusteX + coluna217, args.ajusteY + divisoresVerticais)
          .lineTo(args.ajusteX + coluna217, args.ajusteY + linha21)
          .stroke(args.corDoLayout);

        var linhaSeparadora = linha7 + margemDaLinhaSeparadora;

        pdf
          .moveTo(args.ajusteX + 27, args.ajusteY + linhaSeparadora)
          .lineTo(args.ajusteX + 572, args.ajusteY + linhaSeparadora)
          .dash(3, { space: 5 })
          .stroke(args.corDoLayout);

        var caminhoParaTesoura = path.join(__dirname, "imagens/tesoura128.png");
        pdf.image(
          caminhoParaTesoura,
          args.ajusteX + margemDoSegundoBlocoLayout,
          args.ajusteY + linhaSeparadora - 3.2,
          {
            width: 10,
          }
        );

        /// IMPRIMIR LAYOUT
        var titulos = utils.merge(
          {
            instrucoes: "Instruções",
            informativo: "INFORMATIVO",
            dataDocumento: "Data Documento",
            nomeDoPagador: "Nome do Cliente",
            agenciaECodigoDoBeneficiario: "Agência / Código do Beneficiário",
            nossoNumero: "Nosso Número",
            especie: "Espécie",
            especieDoDocumento: "Espécie Doc.",
            quantidade: "Quantidade",
            numeroDoDocumento: "Nº do Documento",
            dataDeProcessamento: "Data Processamento",
            valorDoDocumento: "Valor do Documento",
            valor: "Valor",
            carteira: "Carteira",
            moraMulta: "(+) Mora / Multa",
            localDoPagamento: "Local do Pagamento",
            igualDoValorDoDocumento: "(=) ",
          },
          banco.titulos || {}
        );

        args.creditos &&
          pdf
            .font("italico")
            .fontSize(8)
            .text(args.creditos, args.ajusteX + 3, args.ajusteY + 90, {
              width: 560,
              align: "center",
            });

        // PIX CODE
        if (boleto._qrCode) {
          var pixQrCode = boleto._qrCode;
          var pixLinha0 = 95;

          var qrCodeBase64 = await generateQRCode(pixQrCode);
          var qrCodeBuffer = Buffer.from(
            qrCodeBase64.replace(/^data:image\/png;base64,/, ""),
            "base64"
          );

          pdf.image(
            qrCodeBuffer,
            args.ajusteX + 480,
            args.ajusteY + pixLinha0,
            {
              width: 90,
            }
          );

          pdf
            .font("negrito")
            .fontSize(10)
            .text(
              titulos.informativo,
              args.ajusteX + 250,
              args.ajusteY + pixLinha0,
              {
                lineBreak: false,
                width: 294,
                align: "left",
              }
            );

          var instrucaoY = pixLinha0 + 12;
          boleto.getInformativo().forEach(function (informativo, indice) {
            pdf
              .font("normal")
              .fontSize(args.tamanhoDaFonte)
              .text(
                informativo,
                args.ajusteX + margemDoSegundoBloco,
                args.ajusteY + instrucaoY + indice * args.tamanhoDaFonte,
                {
                  lineBreak: false,
                  width: 400,
                  align: "left",
                }
              );
          });

          pdf
            .fontSize(10)
            .text(
              "Pague agora via PIX, basta acessar o aplicativo de sua instituição financeira",
              args.ajusteX + 30,
              args.ajusteY + pixLinha0 + 66,
              {
                lineBreak: false,
                width: 350,
                align: "left",
              }
            );

          pdf
            .font("negrito")
            .fontSize(10)
            .text(
              "PIX copia e cola",
              args.ajusteX + 30,
              args.ajusteY + pixLinha0 + 75,
              {
                lineBreak: false,
                width: 294,
                align: "left",
              }
            );

          // Fundo cinza
          pdf
            .rect(args.ajusteX + 27, args.ajusteY + pixLinha0 + 88, 545, 23)
            .fill("#DFDFDF");

          // Texto do copia e cola
          pdf
            .font("negrito")
            .fontSize(6)
            .fillColor("black")
            .text(pixQrCode, args.ajusteX + 32, args.ajusteY + pixLinha0 + 90, {
              lineBreak: false,
              width: 500,
              align: "left",
            });

          var pixMarginX = args.ajusteX + 27;
          var pixMarginY = args.ajusteY + pixLinha0 - 10;
          var pixWidth = 545;
          var pixHeight = 120;

          // Margem ao redor da sessão pix
          pdf
            .rect(pixMarginX, pixMarginY, pixWidth, pixHeight)
            .undash()
            .stroke();
        }
        const segundaLinha3 = linha1 - 20.25;

        pdf.image(
          banco.getImagem(),
          args.ajusteX + margemDoSegundoBlocoLayout,
          args.ajusteY + segundaLinha3 - 5,
          {
            height: alturaDoLogotipoDoBanco,
          }
        );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaLinhaDigitavel)
          .text(
            "Recibo do Pagador",
            args.ajusteX + margemDoSegundoBlocoLayout + 145,
            args.ajusteY + segundaLinha3,
            {
              lineBreak: false,
              width: 400,
              align: "right",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaLinhaDigitavel)
          .text(
            banco.getNumeroFormatadoComDigito(),
            args.ajusteX + margemDoSegundoBlocoLayout + 131,
            args.ajusteY + linha1 - 20.25,
            {
              lineBreak: false,
              width: 39.8,
              align: "center",
            }
          );

        var primeiraLinha = linha1 + 9,
          diferencaEntreTituloEValor = 10,
          tituloDaPrimeiraLinha = primeiraLinha - diferencaEntreTituloEValor,
          colunaLateralLinhaSuperior = 440;

        var tituloLocalDoPagamento = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.localDoPagamento,
            args.ajusteX + margemDoSegundoBloco,
            args.ajusteY + primeiraLinha - 7,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        boleto
          .getLocaisDePagamento()
          .forEach(function (localDePagamento, indice) {
            if (indice > 1) {
              return;
            }

            pdf
              .font("normal")
              .fontSize(args.tamanhoDaFonteDoTitulo)
              .text(
                localDePagamento,
                args.ajusteX + margemDoSegundoBloco,
                args.ajusteY +
                  (terceiraLinha +
                    2 -
                    args.tamanhoDaFonte +
                    indice * args.tamanhoDaFonte),
                {
                  lineBreak: false,
                  width: 400,
                  align: "left",
                }
              );
          });

        const LinhaBaseBloco1 = linha2 - 20.25;
        var linhaSuperiorLayout1 = LinhaBaseBloco1 + 9,
          tituloDaTerceiraLinha =
            linhaSuperiorLayout1 - diferencaEntreTituloEValor,
          tituloDaTerceiraLinhaLateral1 =
            linhaSuperiorLayout1 - diferencaEntreTituloEValor,
          colunaLateral = 440;
        var tamanhoDasCelulasADireita = 124.5;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Vencimento",
            args.ajusteX + colunaLateralLinhaSuperior,
            args.ajusteY + tituloDaTerceiraLinhaLateral1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getVencimentoFormatado(),
            args.ajusteX + colunaLateralLinhaSuperior,
            args.ajusteY + linhaSuperiorLayout1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var primeiraLinhaOpcional = primeiraLinha + ESPACO_ENTRE_LINHAS,
          tituloDaPrimeiraLinhaOpcional =
            primeiraLinhaOpcional - diferencaEntreTituloEValor;

        var quartaLinha1 = LinhaBaseBloco1 + 30,
          tituloDaQuartaLinhaLateral1 =
            quartaLinha1 - diferencaEntreTituloEValor;

        var tituloBeneficiario = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Beneficiário",
            args.ajusteX + tituloBeneficiario,
            args.ajusteY + tituloDaQuartaLinhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            beneficiario.getIdentificacao(),
            args.ajusteX + margemDoSegundoBloco,
            args.ajusteY + quartaLinha1,
            {
              lineBreak: false,
              width: 400,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.agenciaECodigoDoBeneficiario,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaQuartaLinhaLateral1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            banco.getAgenciaECodigoBeneficiario(boleto),
            args.ajusteX + colunaLateral,
            args.ajusteY + quartaLinha1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var quintaLinha1 = quartaLinha1 + ESPACO_ENTRE_LINHAS,
          tituloDaQuintaLinha1 = quintaLinha1 - diferencaEntreTituloEValor,
          tituloDaQuintaLinhaLateral1 =
            quintaLinha1 - diferencaEntreTituloEValor;

        var tituloDataDocumento = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.dataDocumento,
            args.ajusteX + tituloDataDocumento,
            args.ajusteY + tituloDaQuintaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getDocumentoFormatado(),
            args.ajusteX + margemDoSegundoBloco,
            args.ajusteY + quintaLinha1,
            {
              lineBreak: false,
              width: 61.5,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getNumeroDoDocumentoFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68,
            args.ajusteY + quintaLinha1,
            {
              lineBreak: false,
              width: 84,
              align: "left",
            }
          );

        var tituloNumeroDoDocumento = tituloDataDocumento + 68,
          tituloCip = tituloNumeroDoDocumento;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.numeroDoDocumento,
            args.ajusteX + tituloNumeroDoDocumento,
            args.ajusteY + tituloDaQuintaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var tituloEspecieDoc = tituloNumeroDoDocumento + 90;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.especieDoDocumento,
            args.ajusteX + tituloEspecieDoc,
            args.ajusteY + tituloDaQuintaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getEspecieDocumento(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90,
            args.ajusteY + quintaLinha1,
            {
              lineBreak: false,
              width: 81,
              align: "center",
            }
          );

        var tituloAceite = tituloEspecieDoc + 86;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Aceite",
            args.ajusteX + tituloAceite,
            args.ajusteY + tituloDaQuintaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getAceiteFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86,
            args.ajusteY + quintaLinha1,
            {
              lineBreak: false,
              width: 55,
              align: "center",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getProcessamentoFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86 + 61.5,
            args.ajusteY + quintaLinha1,
            {
              lineBreak: false,
              width: 93.5,
              align: "left",
            }
          );

        var tituloDataProcessamento = tituloAceite + 61;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.dataDeProcessamento,
            args.ajusteX + tituloDataProcessamento,
            args.ajusteY + tituloDaQuintaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.nossoNumero,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaQuintaLinhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            beneficiario._nossoNumero,
            args.ajusteX + colunaLateral,
            args.ajusteY + quintaLinha1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var sextaLinha1 = quintaLinha1 + ESPACO_ENTRE_LINHAS,
          tituloDaSextaLinha1 = sextaLinha1 - diferencaEntreTituloEValor;

        var tituloUsoDoBancoX = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Uso do Banco",
            args.ajusteX + tituloUsoDoBancoX,
            args.ajusteY + tituloDaSextaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        if (banco.exibirCampoCip) {
          pdf
            .font("negrito")
            .fontSize(args.tamanhoDaFonteDoTitulo)
            .text(
              "CIP",
              args.ajusteX + tituloCip,
              args.ajusteY + tituloDaSextaLinha1,
              {
                lineBreak: false,
                width: 31,
                align: "left",
              }
            );

          // TODO: Implementar campo CIP no boleto
          pdf
            .font("normal")
            .fontSize(args.tamanhoDaFonte)
            .text("", args.ajusteX + tituloCip, args.ajusteY + sextaLinha1, {
              lineBreak: false,
              width: 31,
              align: "center",
            });
        }

        var tituloCarteira = tituloUsoDoBancoX + 105;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.carteira,
            args.ajusteX + tituloCarteira,
            args.ajusteY + tituloDaSextaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            banco.getCarteiraTexto(beneficiario),
            args.ajusteX + margemDoSegundoBloco + 104.5,
            args.ajusteY + sextaLinha1,
            {
              lineBreak: false,
              width: 71,
              align: "center",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getEspecieMoeda(),
            args.ajusteX + margemDoSegundoBloco + 104.5 + 77,
            args.ajusteY + sextaLinha1,
            {
              lineBreak: false,
              width: 71,
              align: "center",
            }
          );

        var tituloEspecieMoeda = tituloCarteira + 77;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.especie,
            args.ajusteX + tituloEspecieMoeda,
            args.ajusteY + tituloDaSextaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var tituloQuantidadeMoeda = tituloEspecieMoeda + 77;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.quantidade,
            args.ajusteX + tituloQuantidadeMoeda,
            args.ajusteY + tituloDaSextaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var tituloValorMoeda = tituloQuantidadeMoeda + 92;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.valor,
            args.ajusteX + tituloValorMoeda,
            args.ajusteY + tituloDaSextaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.igualDoValorDoDocumento + titulos.valorDoDocumento,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaSextaLinha1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorFormatadoBRL(),
            args.ajusteX + colunaLateral,
            args.ajusteY + sextaLinha1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var setimaLinhaLateral1 = sextaLinha1 + ESPACO_ENTRE_LINHAS,
          tituloDaSetimaLinha1 = tituloDaSextaLinha1 + ESPACO_ENTRE_LINHAS,
          tituloDaSetimaLinhaLateral1 =
            setimaLinhaLateral1 - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.instrucoes,
            args.ajusteX + margemDoSegundoBloco,
            args.ajusteY + tituloDaSetimaLinha1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var instrucaoY = tituloDaSetimaLinha1 + 12;
        boleto.getInstrucoes().forEach(function (instrucao, indice) {
          pdf
            .font("normal")
            .fontSize(args.tamanhoDaFonte)
            .text(
              instrucao,
              args.ajusteX + margemDoSegundoBloco,
              args.ajusteY + instrucaoY + indice * args.tamanhoDaFonte,
              {
                lineBreak: false,
                width: 400,
                align: "left",
              }
            );
        });

        if (args.exibirCampoUnidadeBeneficiaria) {
          pdf
            .font("negrito")
            .fontSize(args.tamanhoDaFonteDoTitulo)
            .text(
              "Unidade Beneficiária",
              args.ajusteX + 30,
              args.ajusteY + tituloDaSetimaLinha1 + 70,
              {
                lineBreak: false,
                width: 294,
                align: "left",
              }
            );
        }

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Pagador",
            args.ajusteX + 30,
            args.ajusteY + tituloDaSetimaLinha1 + 115,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var cpfCnpj = formatCpfCnpj(pagador._registroNacional);
        if (!cpfCnpj) {
          cpfCnpj = "";
        } else {
          cpfCnpj = `(CPF: ${cpfCnpj})`;
        }

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte) // TODO: Diminuir tamanho da fonte caso seja maior que X caracteres
          .text(
            `${pagador.getIdentificacao()} ${cpfCnpj}`,
            args.ajusteX + 30,
            args.ajusteY + tituloDaSetimaLinha1 + 115 + 10,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var enderecoDoPagador = pagador.getEndereco();
        if (enderecoDoPagador) {
          var espacamento = args.tamanhoDaFonte;

          if (enderecoDoPagador.getPrimeiraLinha()) {
            pdf
              .font("normal")
              .fontSize(args.tamanhoDaFonte)
              .text(
                enderecoDoPagador.getPrimeiraLinha(),
                args.ajusteX + 30,
                args.ajusteY + tituloDaSetimaLinha1 + 115 + 10 + espacamento,
                {
                  lineBreak: false,
                  width: 535,
                  align: "left",
                }
              );

            espacamento += espacamento;
          }

          if (enderecoDoPagador.getSegundaLinha()) {
            pdf
              .font("normal")
              .fontSize(args.tamanhoDaFonte)
              .text(
                enderecoDoPagador.getSegundaLinha(),
                args.ajusteX + 30,
                args.ajusteY + tituloDaSetimaLinha1 + 115 + 10 + espacamento,
                {
                  lineBreak: false,
                  width: 535,
                  align: "left",
                }
              );
          }
        }

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Código de Baixa",
            args.ajusteX + 370,
            args.ajusteY + tituloDaSetimaLinha1 + 150,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Autenticação Mecânica",
            args.ajusteX + 360,
            args.ajusteY + tituloDaSetimaLinha1 + 165,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo + 1)
          .text(
            "FICHA DE COMPENSAÇÃO",
            args.ajusteX + 421,
            args.ajusteY + tituloDaSetimaLinha1 + 165,
            {
              lineBreak: false,
              width: 150,
              align: "right",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(-) Desconto / Abatimento",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaSetimaLinhaLateral1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDescontosFormatadoBRL(),
            args.ajusteX + colunaLateral,
            args.ajusteY + setimaLinhaLateral1,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var oitavaLinhaLateral1 = setimaLinhaLateral1 + ESPACO_ENTRE_LINHAS,
          tituloDaOitavaLinhaLateral1 =
            oitavaLinhaLateral1 - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(-) Outras Deduções",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaOitavaLinhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDeducoesFormatadoBRL(),
            args.ajusteX + colunaLateral,
            args.ajusteY + oitavaLinhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var nonaLinhaLateral1 = oitavaLinhaLateral1 + ESPACO_ENTRE_LINHAS,
          tituloDaNonaLinhaLateral1 =
            nonaLinhaLateral1 - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.moraMulta,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaNonaLinhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var decimaLinhaLateral1 = nonaLinhaLateral1 + ESPACO_ENTRE_LINHAS,
          tituloDaDecimaLinhaLateral1 =
            decimaLinhaLateral1 - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(+) Outros Acréscimos",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaDecimaLinhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var decimaPrimLinhaLateral1 = decimaLinhaLateral1 + ESPACO_ENTRE_LINHAS,
          tituloDaDecimaPrimLinhaLateral1 =
            decimaPrimLinhaLateral1 - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(=) Valor Cobrado",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaDecimaPrimLinhaLateral1,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var cpfCnpj = formatCpfCnpj(pagador._registroNacional);
        if (!cpfCnpj) {
          cpfCnpj = "";
        } else {
          cpfCnpj = `(CPF: ${cpfCnpj})`;
        }

        var primeiraLinhaOpcional = primeiraLinha + ESPACO_ENTRE_LINHAS,
          tituloDaPrimeiraLinhaOpcional =
            primeiraLinhaOpcional - diferencaEntreTituloEValor;

        var segundaLinha = banco.exibirReciboDoPagadorCompleto
            ? primeiraLinhaOpcional + ESPACO_ENTRE_LINHAS
            : primeiraLinha + ESPACO_ENTRE_LINHAS,
          tituloDaSegundaLinha = segundaLinha - diferencaEntreTituloEValor;

        const segundaLinha2 = linha21 - 20.25;
        const codigoDeBarras = boleto._codigoBarras;
        const linhaDigitavel = gerarLinhaDigitavel(boleto._linhaDigitavel);

        pdf.image(
          banco.getImagem(),
          args.ajusteX + margemDoSegundoBlocoLayout,
          args.ajusteY + segundaLinha2 - 5,
          {
            height: alturaDoLogotipoDoBanco,
          }
        );

        banco.imprimirNome &&
          pdf
            .font("negrito")
            .fontSize(args.tamanhoDaLinhaDigitavel)
            .text(
              banco.nome,
              args.ajusteX + margemDoSegundoBlocoLayout + 26,
              args.ajusteY + segundaLinha2,
              {
                lineBreak: false,
                width: 100,
                align: "left",
              }
            );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaLinhaDigitavel)
          .text(
            banco.getNumeroFormatadoComDigito(),
            args.ajusteX + margemDoSegundoBlocoLayout + 131,
            args.ajusteY + segundaLinha2,
            {
              lineBreak: false,
              width: 39.8,
              align: "center",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaLinhaDigitavel)
          .text(
            linhaDigitavel,
            args.ajusteX + margemDoSegundoBlocoLayout + 145,
            args.ajusteY + segundaLinha2,
            {
              lineBreak: false,
              width: 400,
              align: "right",
            }
          );

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

        pdf
          .font("codigoDeBarras")
          .fontSize(args.tamanhoDoCodigoDeBarras)
          .text(
            i25(codigoDeBarras),
            args.ajusteX + margemDoSegundoBlocoLayout,
            args.ajusteY + linha212 + 3.5,
            {
              lineBreak: false,
              width: 340,
              align: "left",
            }
          );

        var terceiraLinha = segundaLinha2 + 38,
          tituloDaTerceiraLinha = terceiraLinha - diferencaEntreTituloEValor,
          tituloDaTerceiraLinhaLateral =
            terceiraLinha - diferencaEntreTituloEValor,
          colunaLateral = 440;

        var tituloLocalDoPagamento = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.localDoPagamento,
            args.ajusteX + tituloLocalDoPagamento,
            args.ajusteY + tituloDaTerceiraLinha - 7,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        boleto
          .getLocaisDePagamento()
          .forEach(function (localDePagamento, indice) {
            if (indice > 1) {
              return;
            }

            pdf
              .font("normal")
              .fontSize(args.tamanhoDaFonteDoTitulo)
              .text(
                localDePagamento,
                args.ajusteX + margemDoSegundoBloco,
                args.ajusteY +
                  (terceiraLinha +
                    2 -
                    args.tamanhoDaFonte +
                    indice * args.tamanhoDaFonte),
                {
                  lineBreak: false,
                  width: 400,
                  align: "left",
                }
              );
          });

        var tamanhoDasCelulasADireita = 124.5;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Vencimento",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaTerceiraLinhaLateral - 7,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getVencimentoFormatado(),
            args.ajusteX + colunaLateral,
            args.ajusteY + terceiraLinha,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var quartaLinha = terceiraLinha + 24,
          tituloDaQuartaLinhaLateral = quartaLinha - diferencaEntreTituloEValor;

        var tituloBeneficiario = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Beneficiário",
            args.ajusteX + tituloBeneficiario,
            args.ajusteY + tituloDaQuartaLinhaLateral,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            beneficiario.getIdentificacao(),
            args.ajusteX + margemDoSegundoBloco,
            args.ajusteY + quartaLinha,
            {
              lineBreak: false,
              width: 400,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.agenciaECodigoDoBeneficiario,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaQuartaLinhaLateral,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            banco.getAgenciaECodigoBeneficiario(boleto),
            args.ajusteX + colunaLateral,
            args.ajusteY + quartaLinha,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var quintaLinha = quartaLinha + ESPACO_ENTRE_LINHAS,
          tituloDaQuintaLinha = quintaLinha - diferencaEntreTituloEValor,
          tituloDaQuintaLinhaLateral = quintaLinha - diferencaEntreTituloEValor;

        var tituloDataDocumento = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.dataDocumento,
            args.ajusteX + tituloDataDocumento,
            args.ajusteY + tituloDaQuintaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getDocumentoFormatado(),
            args.ajusteX + margemDoSegundoBloco,
            args.ajusteY + quintaLinha,
            {
              lineBreak: false,
              width: 61.5,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getNumeroDoDocumentoFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68,
            args.ajusteY + quintaLinha,
            {
              lineBreak: false,
              width: 84,
              align: "left",
            }
          );

        var tituloNumeroDoDocumento = tituloDataDocumento + 68,
          tituloCip = tituloNumeroDoDocumento;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.numeroDoDocumento,
            args.ajusteX + tituloNumeroDoDocumento,
            args.ajusteY + tituloDaQuintaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var tituloEspecieDoc = tituloNumeroDoDocumento + 90;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.especieDoDocumento,
            args.ajusteX + tituloEspecieDoc,
            args.ajusteY + tituloDaQuintaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getEspecieDocumento(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90,
            args.ajusteY + quintaLinha,
            {
              lineBreak: false,
              width: 81,
              align: "center",
            }
          );

        var tituloAceite = tituloEspecieDoc + 86;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Aceite",
            args.ajusteX + tituloAceite,
            args.ajusteY + tituloDaQuintaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getAceiteFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86,
            args.ajusteY + quintaLinha,
            {
              lineBreak: false,
              width: 55,
              align: "center",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            datas.getProcessamentoFormatado(),
            args.ajusteX + margemDoSegundoBloco + 68 + 90 + 86 + 61.5,
            args.ajusteY + quintaLinha,
            {
              lineBreak: false,
              width: 93.5,
              align: "left",
            }
          );

        var tituloDataProcessamento = tituloAceite + 61;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.dataDeProcessamento,
            args.ajusteX + tituloDataProcessamento,
            args.ajusteY + tituloDaQuintaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.nossoNumero,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaQuintaLinhaLateral,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            beneficiario._nossoNumero,
            args.ajusteX + colunaLateral,
            args.ajusteY + quintaLinha,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var sextaLinha = quintaLinha + ESPACO_ENTRE_LINHAS,
          tituloDaSextaLinha = sextaLinha - diferencaEntreTituloEValor;

        var tituloUsoDoBancoX = margemDoSegundoBloco;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Uso do Banco",
            args.ajusteX + tituloUsoDoBancoX,
            args.ajusteY + tituloDaSextaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        if (banco.exibirCampoCip) {
          pdf
            .font("negrito")
            .fontSize(args.tamanhoDaFonteDoTitulo)
            .text(
              "CIP",
              args.ajusteX + tituloCip,
              args.ajusteY + tituloDaSextaLinha,
              {
                lineBreak: false,
                width: 31,
                align: "left",
              }
            );

          // TODO: Implementar campo CIP no boleto
          pdf
            .font("normal")
            .fontSize(args.tamanhoDaFonte)
            .text("", args.ajusteX + tituloCip, args.ajusteY + sextaLinha, {
              lineBreak: false,
              width: 31,
              align: "center",
            });
        }

        var tituloCarteira = tituloUsoDoBancoX + 105;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.carteira,
            args.ajusteX + tituloCarteira,
            args.ajusteY + tituloDaSextaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            banco.getCarteiraTexto(beneficiario),
            args.ajusteX + margemDoSegundoBloco + 104.5,
            args.ajusteY + sextaLinha,
            {
              lineBreak: false,
              width: 71,
              align: "center",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getEspecieMoeda(),
            args.ajusteX + margemDoSegundoBloco + 104.5 + 77,
            args.ajusteY + sextaLinha,
            {
              lineBreak: false,
              width: 71,
              align: "center",
            }
          );

        var tituloEspecieMoeda = tituloCarteira + 77;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.especie,
            args.ajusteX + tituloEspecieMoeda,
            args.ajusteY + tituloDaSextaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var tituloQuantidadeMoeda = tituloEspecieMoeda + 77;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.quantidade,
            args.ajusteX + tituloQuantidadeMoeda,
            args.ajusteY + tituloDaSextaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var tituloValorMoeda = tituloQuantidadeMoeda + 92;
        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.valor,
            args.ajusteX + tituloValorMoeda,
            args.ajusteY + tituloDaSextaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.igualDoValorDoDocumento + titulos.valorDoDocumento,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaSextaLinha,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorFormatadoBRL(),
            args.ajusteX + colunaLateral,
            args.ajusteY + sextaLinha,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var setimaLinhaLateral = sextaLinha + ESPACO_ENTRE_LINHAS,
          tituloDaSetimaLinha = tituloDaSextaLinha + ESPACO_ENTRE_LINHAS,
          tituloDaSetimaLinhaLateral =
            setimaLinhaLateral - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.instrucoes,
            args.ajusteX + margemDoSegundoBloco,
            args.ajusteY + tituloDaSetimaLinha,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var instrucaoY = tituloDaSetimaLinha + 12;
        boleto.getInstrucoes().forEach(function (instrucao, indice) {
          pdf
            .font("normal")
            .fontSize(args.tamanhoDaFonte)
            .text(
              instrucao,
              args.ajusteX + margemDoSegundoBloco,
              args.ajusteY + instrucaoY + indice * args.tamanhoDaFonte,
              {
                lineBreak: false,
                width: 400,
                align: "left",
              }
            );
        });

        if (args.exibirCampoUnidadeBeneficiaria) {
          pdf
            .font("negrito")
            .fontSize(args.tamanhoDaFonteDoTitulo)
            .text(
              "Unidade Beneficiária",
              args.ajusteX + 30,
              args.ajusteY + tituloDaSetimaLinha + 70,
              {
                lineBreak: false,
                width: 294,
                align: "left",
              }
            );
        }

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Pagador",
            args.ajusteX + 30,
            args.ajusteY + tituloDaSetimaLinha + 115,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            `${pagador.getIdentificacao()} ${cpfCnpj}`,
            args.ajusteX + 30,
            args.ajusteY + tituloDaSetimaLinha + 115 + 10,
            {
              lineBreak: false,
              width: 535,
              align: "left",
            }
          );

        var enderecoDoPagador = pagador.getEndereco();
        if (enderecoDoPagador) {
          var espacamento = args.tamanhoDaFonte;

          if (enderecoDoPagador.getPrimeiraLinha()) {
            pdf
              .font("normal")
              .fontSize(args.tamanhoDaFonte)
              .text(
                enderecoDoPagador.getPrimeiraLinha(),
                args.ajusteX + 30,
                args.ajusteY + tituloDaSetimaLinha + 115 + 10 + espacamento,
                {
                  lineBreak: false,
                  width: 535,
                  align: "left",
                }
              );

            espacamento += espacamento;
          }

          if (enderecoDoPagador.getSegundaLinha()) {
            pdf
              .font("normal")
              .fontSize(args.tamanhoDaFonte)
              .text(
                enderecoDoPagador.getSegundaLinha(),
                args.ajusteX + 30,
                args.ajusteY + tituloDaSetimaLinha + 115 + 10 + espacamento,
                {
                  lineBreak: false,
                  width: 535,
                  align: "left",
                }
              );
          }
        }

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Código de Baixa",
            args.ajusteX + 370,
            args.ajusteY + tituloDaSetimaLinha + 159,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "Autenticação Mecânica",
            args.ajusteX + 360,
            args.ajusteY + tituloDaSetimaLinha + 171.5,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo + 1)
          .text(
            "FICHA DE COMPENSAÇÃO",
            args.ajusteX + 421,
            args.ajusteY + tituloDaSetimaLinha + 171.5,
            {
              lineBreak: false,
              width: 150,
              align: "right",
            }
          );

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(-) Desconto / Abatimento",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaSetimaLinhaLateral,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDescontosFormatadoBRL(),
            args.ajusteX + colunaLateral,
            args.ajusteY + setimaLinhaLateral,
            {
              lineBreak: false,
              width: tamanhoDasCelulasADireita,
              align: "right",
            }
          );

        var oitavaLinhaLateral = setimaLinhaLateral + ESPACO_ENTRE_LINHAS,
          tituloDaOitavaLinhaLateral =
            oitavaLinhaLateral - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(-) Outras Deduções",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaOitavaLinhaLateral,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        pdf
          .font("normal")
          .fontSize(args.tamanhoDaFonte)
          .text(
            boleto.getValorDeducoesFormatadoBRL(),
            args.ajusteX + colunaLateral,
            args.ajusteY + oitavaLinhaLateral,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var nonaLinhaLateral = oitavaLinhaLateral + ESPACO_ENTRE_LINHAS,
          tituloDaNonaLinhaLateral =
            nonaLinhaLateral - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            titulos.moraMulta,
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaNonaLinhaLateral,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var decimaLinhaLateral = nonaLinhaLateral + ESPACO_ENTRE_LINHAS,
          tituloDaDecimaLinhaLateral =
            decimaLinhaLateral - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(+) Outros Acréscimos",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaDecimaLinhaLateral,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        var decimaPrimLinhaLateral = decimaLinhaLateral + ESPACO_ENTRE_LINHAS,
          tituloDaDecimaPrimLinhaLateral =
            decimaPrimLinhaLateral - diferencaEntreTituloEValor;

        pdf
          .font("negrito")
          .fontSize(args.tamanhoDaFonteDoTitulo)
          .text(
            "(=) Valor Cobrado",
            args.ajusteX + colunaLateral,
            args.ajusteY + tituloDaDecimaPrimLinhaLateral,
            {
              lineBreak: false,
              width: 294,
              align: "left",
            }
          );

        informacoesPersonalizadas(
          pdf,
          args.ajusteX + margemDoSegundoBlocoLayout,
          args.ajusteY + linha212 + args.tamanhoDoCodigoDeBarras + 10
        );

        if (indice < boletos.length - 1) {
          pdf.addPage();
        }
      }

      if (args.base64) {
        var finalString = "";
        var stream = pdf.pipe(new Base64Encode());

        pdf.end();

        stream.on("data", function (chunk) {
          finalString += chunk;
        });

        stream.on("end", function () {
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

module.exports = GeradorDeBoleto;
