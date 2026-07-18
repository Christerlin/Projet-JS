// Middleware pou pwoteje routes yo selon eta koneksyon ak wòl itilizatè a

// Verifye si itilizatè a konekte (gen yon sesyon aktif)
function estConnecte(req, res, next) {
  if (req.session && req.session.utilisateur) {
    return next();
  }
  return res.status(401).json({ message: 'Vous devez être connecté pour accéder à cette ressource.' });
}

// Verifye si itilizatè a konekte epi li se yon administratè
function estAdmin(req, res, next) {
  if (req.session && req.session.utilisateur && req.session.utilisateur.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
}

module.exports = { estConnecte, estAdmin };
