// Validasyon ak nòmalizasyon nimewo telefòn.
//
// Tout nimewo ayisyen gen 8 chif. Fòm yo mande itilizatè a 8 chif sèlman,
// endikatif +509 la deja parèt akote chan an. Men nou aksepte tou yon nimewo
// ki rive ak endikatif la (ansyen done, oswa yon kliyan ki voye l konsa),
// epi nou sere tout bagay nan yon sèl fòma : +509 XXXX XXXX.

const INDICATIF = '+509';

function normaliserTelephone(valeur) {
  // Chan an fakiltatif : vid vle di pa gen nimewo
  if (valeur === undefined || valeur === null || String(valeur).trim() === '') {
    return { ok: true, valeur: null };
  }

  // Nou kenbe chif yo sèlman, konsa espas, tirè ak parantèz pa deranje
  const chiffres = String(valeur).replace(/\D/g, '');

  // Si moun nan mete endikatif la, nou wete l anvan nou konte
  const local = chiffres.length === 11 && chiffres.startsWith('509') ? chiffres.slice(3) : chiffres;

  if (!/^\d{8}$/.test(local)) {
    return {
      ok: false,
      message: 'Le numéro de téléphone doit contenir exactement 8 chiffres.',
    };
  }

  return { ok: true, valeur: `${INDICATIF} ${local.slice(0, 4)} ${local.slice(4)}` };
}

module.exports = { normaliserTelephone, INDICATIF };
