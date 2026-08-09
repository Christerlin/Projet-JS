// Konstwi yon faktir PDF pou yon kòmand. Nou sèvi ak PDFKit ki ekri
// dirèkteman nan yon flux, konsa nou pa bezwen sere okenn fichye sou disk.
const path = require('path');
const PDFDocument = require('pdfkit');

// Enfòmasyon antrepriz la. Yo isit la pou yon sèl kote gen pou chanje.
const ENTREPRISE = {
  nom: 'NovaTech',
  slogan: 'Solutions informatiques',
  adresse: 'Limonade, Nord, Haïti',
  courriel: 'info@novatech.ht',
  telephone: '+509 3000 0000',
};

const LOGO = path.join(__dirname, '..', 'public', 'images', 'logo.png');

// Koulè yo swiv menm idantite ak sit la
const BLEU_FONCE = '#021f51';
const BLEU = '#066ddd';
const GRIS = '#6c757d';
const GRIS_CLAIR = '#e6edf7';

const MARGE = 50;
const LARGEUR_UTILE = 595.28 - MARGE * 2; // A4 mwens de marj yo

function formaterMontant(valeur) {
  return Number(valeur).toFixed(2) + ' $';
}

function formaterDate(valeur) {
  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Nimewo faktir ki li fasil : FACT-0004
function numeroFacture(idCommande) {
  return 'FACT-' + String(idCommande).padStart(4, '0');
}

function dessinerEntete(doc) {
  doc.image(LOGO, MARGE, MARGE, { width: 70 });

  doc
    .fillColor(BLEU_FONCE)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text(ENTREPRISE.nom, MARGE + 85, MARGE + 8);

  doc
    .fillColor(GRIS)
    .fontSize(9)
    .font('Helvetica')
    .text(ENTREPRISE.slogan, MARGE + 85, MARGE + 34)
    .text(ENTREPRISE.adresse, MARGE + 85, MARGE + 46)
    .text(ENTREPRISE.courriel + '  |  ' + ENTREPRISE.telephone, MARGE + 85, MARGE + 58);

  // Tit la aliyen adwat, sou menm wotè ak logo a
  doc
    .fillColor(BLEU)
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('FACTURE', MARGE, MARGE + 8, { width: LARGEUR_UTILE, align: 'right' });

  doc.moveTo(MARGE, MARGE + 90).lineTo(MARGE + LARGEUR_UTILE, MARGE + 90).strokeColor(GRIS_CLAIR).lineWidth(2).stroke();
}

function dessinerInfos(doc, commande, client) {
  const y = MARGE + 110;

  // Kolòn goch : kliyan an
  doc.fillColor(GRIS).fontSize(9).font('Helvetica-Bold').text('FACTURÉ À', MARGE, y);
  doc.fillColor(BLEU_FONCE).fontSize(11).font('Helvetica-Bold')
    .text(client.prenom + ' ' + client.nom, MARGE, y + 15);

  // Anpil kliyan mete menm bagay nan `adresse` ak nan `ville, pays`.
  // Nou retire doub la pou faktir la pa repete menm liy nan de fwa.
  const villePays = [client.ville, client.pays].filter(Boolean).join(', ');
  const lignesClient = [
    client.entreprise,
    client.adresse,
    villePays === client.adresse ? null : villePays,
    client.courriel,
    client.telephone,
  ].filter(Boolean);

  doc.fillColor(GRIS).fontSize(9).font('Helvetica');
  let yClient = y + 32;
  lignesClient.forEach((ligne) => {
    doc.text(ligne, MARGE, yClient);
    yClient += 12;
  });

  // Kolòn dwat : detay faktir la
  const xDroite = MARGE + LARGEUR_UTILE - 200;
  const details = [
    ['Numéro', numeroFacture(commande.id_commande)],
    ['Date de commande', formaterDate(commande.date_commande)],
    ['Commande', '#' + commande.id_commande],
  ];

  let yDetail = y;
  details.forEach(([etiquette, valeur]) => {
    doc.fillColor(GRIS).fontSize(9).font('Helvetica').text(etiquette, xDroite, yDetail, { width: 100 });
    doc.fillColor(BLEU_FONCE).fontSize(9).font('Helvetica-Bold')
      .text(valeur, xDroite + 100, yDetail, { width: 100, align: 'right' });
    yDetail += 15;
  });

  return Math.max(yClient, yDetail) + 25;
}

function dessinerTableau(doc, details, y) {
  // Bòdi dwat chak kolòn se x + 5 + largeur. Dènye a dwe rete anndan
  // MARGE + LARGEUR_UTILE (545), sinon tit "Total" la koupe.
  const colonnes = [
    { titre: 'Service', x: MARGE, largeur: 235, align: 'left' },
    { titre: 'Qté', x: MARGE + 240, largeur: 40, align: 'center' },
    { titre: 'Prix unitaire', x: MARGE + 285, largeur: 95, align: 'right' },
    { titre: 'Total', x: MARGE + 385, largeur: 105, align: 'right' },
  ];

  // Tèt tablo a
  doc.rect(MARGE, y, LARGEUR_UTILE, 24).fill(BLEU_FONCE);
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
  colonnes.forEach((c) => {
    doc.text(c.titre, c.x + 5, y + 8, { width: c.largeur, align: c.align });
  });

  let yLigne = y + 24;

  details.forEach((d, index) => {
    const total = Number(d.prix) * Number(d.quantite);

    // Yon fon altène pou tablo a pi fasil pou li
    if (index % 2 === 1) {
      doc.rect(MARGE, yLigne, LARGEUR_UTILE, 22).fill('#f7fafd');
    }

    doc.fillColor(BLEU_FONCE).fontSize(9).font('Helvetica');
    doc.text(d.nom_service, colonnes[0].x + 5, yLigne + 7, { width: colonnes[0].largeur, align: 'left' });
    doc.text(String(d.quantite), colonnes[1].x + 5, yLigne + 7, { width: colonnes[1].largeur, align: 'center' });
    doc.text(formaterMontant(d.prix), colonnes[2].x + 5, yLigne + 7, { width: colonnes[2].largeur, align: 'right' });
    doc.font('Helvetica-Bold').text(formaterMontant(total), colonnes[3].x + 5, yLigne + 7, {
      width: colonnes[3].largeur,
      align: 'right',
    });

    yLigne += 22;
  });

  doc.moveTo(MARGE, yLigne).lineTo(MARGE + LARGEUR_UTILE, yLigne).strokeColor(GRIS_CLAIR).lineWidth(1).stroke();

  return yLigne;
}

function dessinerTotal(doc, commande, y) {
  const xEtiquette = MARGE + LARGEUR_UTILE - 250;

  doc.rect(xEtiquette, y + 12, 250, 30).fill(BLEU);
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
    .text('TOTAL', xEtiquette + 12, y + 22)
    .text(formaterMontant(commande.montant_total), xEtiquette, y + 22, { width: 238, align: 'right' });

  return y + 60;
}

function dessinerStatut(doc, commande, paiement, y) {
  const estPayee = commande.statut === 'payee' && paiement;

  doc.fillColor(GRIS).fontSize(9).font('Helvetica-Bold').text('STATUT DU PAIEMENT', MARGE, y);

  if (estPayee) {
    doc.fillColor('#0f7b3f').fontSize(11).font('Helvetica-Bold').text('Payée', MARGE, y + 15);

    const infos = [
      ['Date du paiement', formaterDate(paiement.date_paiement)],
      ['Mode de paiement', paiement.mode_paiement],
      ['Référence', paiement.transaction_id || '-'],
    ];
    let yInfo = y + 33;
    doc.fontSize(9).font('Helvetica');
    infos.forEach(([etiquette, valeur]) => {
      doc.fillColor(GRIS).text(etiquette + ' : ', MARGE, yInfo, { continued: true });
      doc.fillColor(BLEU_FONCE).text(valeur);
      yInfo += 13;
    });
    return yInfo;
  }

  doc.fillColor('#b25a00').fontSize(11).font('Helvetica-Bold').text('En attente de paiement', MARGE, y + 15);
  doc.fillColor(GRIS).fontSize(9).font('Helvetica')
    .text('Cette facture n\'est pas encore acquittée.', MARGE, y + 33);
  return y + 50;
}

function dessinerPied(doc) {
  // Nou kalkile depi anba paj la. Si nou te ekri sou yon pozisyon fiks,
  // tèks la t ap depase zòn nan epi PDFKit t ap louvri yon dezyèm paj.
  const y = doc.page.height - MARGE - 30;
  doc.moveTo(MARGE, y).lineTo(MARGE + LARGEUR_UTILE, y).strokeColor(GRIS_CLAIR).lineWidth(1).stroke();
  doc.fillColor(GRIS).fontSize(8).font('Helvetica')
    .text('Merci de votre confiance. Pour toute question, écrivez-nous à ' + ENTREPRISE.courriel + '.',
      MARGE, y + 10, { width: LARGEUR_UTILE, align: 'center', lineBreak: false });
}

// Konstwi dokiman an epi voye l nan flux `sortie` a (yon repons HTTP)
function construireFacture({ commande, client, details, paiement }, sortie) {
  const doc = new PDFDocument({ size: 'A4', margin: MARGE });
  doc.pipe(sortie);

  dessinerEntete(doc);
  let y = dessinerInfos(doc, commande, client);
  y = dessinerTableau(doc, details, y);
  y = dessinerTotal(doc, commande, y);
  dessinerStatut(doc, commande, paiement, y);
  dessinerPied(doc);

  doc.end();
}

module.exports = { construireFacture, numeroFacture };
