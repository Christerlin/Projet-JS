// Notifikasyon an tan reyèl pou administratè yo (bonis).
//
// Nou sèvi ak Server-Sent Events olye WebSocket. Se yon rekèt HTTP nòmal ki
// rete louvri, donk li pase nan menm middleware sesyon an epi estAdmin
// pwoteje l dirèkteman. Navigatè a menm rekonekte poukont li si li koupe.
const express = require('express');
const { estAdmin } = require('../middleware/auth');

const router = express.Router();

// Chak administratè ki konekte gen yon repons ki rete louvri isit la
const abonnes = new Set();

// Kèk proxy fèmen yon koneksyon ki rete an silans twò lontan.
// Nou voye yon ti kòmantè chak 30 segonn pou kenbe l vivan.
const INTERVALLE_BATTEMENT = 30000;

// GET /api/notifications/flux — kanal la
router.get('/flux', estAdmin, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(': connecté\n\n');
  abonnes.add(res);

  const battement = setInterval(() => res.write(': battement\n\n'), INTERVALLE_BATTEMENT);

  // Lè onglè a fèmen, nou lage plas la
  req.on('close', () => {
    clearInterval(battement);
    abonnes.delete(res);
  });
});

// Voye yon evènman bay tout administratè ki konekte.
// Si pa gen okenn, fonksyon an pa fè anyen : rès aplikasyon an pa bezwen
// konnen si gen yon admin ki ap gade oswa non.
function diffuser(type, message) {
  const donnees = JSON.stringify({ type, message, date: new Date().toISOString() });
  abonnes.forEach((res) => {
    try {
      res.write(`data: ${donnees}\n\n`);
    } catch (err) {
      abonnes.delete(res);
    }
  });
}

module.exports = { router, diffuser };
