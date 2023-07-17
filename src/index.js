import './styles.scss';
import i18next from 'i18next';
import app from './app.js';
import locales from './locales/index.js';

i18next.init({
  lng: 'ru',
  debug: true,
  returnObjects: true,
  resources: {
    ru: locales.ru,
  },
}).then(() => {
  app(i18next);
});
