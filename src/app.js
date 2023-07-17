import * as yup from 'yup';
import onChange from 'on-change';

export default (i18n) => {
  const state = {
    rss: '',
    errorsList: [],
    rssList: [],
    isValid() {
      return this.errorsList.length === 0;
    },
  };

  const form = document.querySelector('.rss-form');
  const userInputEl = form.elements.url;
  const userLabel = form.querySelector('label');
  const errorFeedbackEl = document.querySelector('.feedback');

  function render() {
    if (!this.isValid()) {
      userInputEl.classList.remove('is-valid');
      userInputEl.classList.add('is-invalid');
      errorFeedbackEl.textContent = this.errorsList.join('. ');
    } else {
      userInputEl.classList.remove('is-invalid');
      userInputEl.classList.add('is-valid');
      userInputEl.textContent = '';
      userInputEl.focus();
    }
  }

  const watchedState = onChange(state, render);

  userLabel.textContent = i18n.t('rssForm.name');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    errorFeedbackEl.textContent = '';
    watchedState.errorsList = [];
    watchedState.rss = userInputEl.value;

    const schema = yup.string()
      .required(i18n.t('rssForm.errors.notEmpty'))
      .url(i18n.t('rssForm.errors.notUrl'))
      .notOneOf(watchedState.rssList, i18n.t('rssForm.errors.noDuplication'));

    schema.validate(watchedState.rss)
      .then(() => {
        watchedState.rssList.push(watchedState.rss);
      })
      .catch((error) => {
        watchedState.errorsList.push(error.message);
      });
  });
};
