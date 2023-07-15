import * as yup from 'yup';
import onChange from 'on-change';

export default () => {
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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    errorFeedbackEl.textContent = '';
    watchedState.errorsList = [];
    watchedState.rss = userInputEl.value;

    const schema = yup.string()
      .required('This field can not be empty')
      .url('Value must be a valid URL')
      .notOneOf(watchedState.rssList, 'Value is already in the RSS list');

    schema.validate(watchedState.rss)
      .then(() => {
        watchedState.rssList.push(watchedState.rss);
      })
      .catch((error) => {
        watchedState.errorsList.push(error.message);
      });
  });
};
