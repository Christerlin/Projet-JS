// Pwen antre prensipal aplikasyon an — konfigire serveur Express la
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Sou yon tè deplwaman, HTTPS la fini sou yon proxy anvan li rive sou Express.
// San liy sa a, Express kwè koneksyon an an clair, epi li refize voye cookie
// sesyon an ki make "secure". Rezilta : koneksyon an sanble reyisi men
// itilizatè a pa janm rete konekte.
app.set('trust proxy', 1);

// Middleware pou li kò rekèt yo an JSON ak an fòm URL ankode
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Jesyon sesyon — nou konsève sesyon yo nan baz done a (tab "session")
app.use(
  session({
    store: new pgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // Yon jou
    },
  })
);

// Routes API yo
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/temoignages', require('./routes/temoignages'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/paiement', require('./routes/paiement'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications').router);

// Fichye estatik front-end yo (HTML, CSS, JS, imaj)
app.use(express.static(path.join(__dirname, 'public')));

// Jesyon global erè yo — evite serveur la tonbe san rezon
app.use((err, req, res, next) => {
  console.error('Erè serveur :', err);
  res.status(500).json({ message: 'Une erreur interne est survenue.' });
});

app.listen(PORT, () => {
  console.log(`Serveur an mach sou http://localhost:${PORT}`);
});
