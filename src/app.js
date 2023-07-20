import * as yup from 'yup';
import onChange from 'on-change';
import parse from './parser.js';

export default (i18n) => {
  const state = {
    rss: '',
    errorsList: [],
    rssList: [],
    isValid() {
      return this.errorsList.length === 0;
    },
    feeds: [],
    posts: [],
    modalData: null,
  };

  const form = document.querySelector('.rss-form');
  const userInputEl = form.querySelector('input');
  const userLabel = form.querySelector('label');
  const feedbackEl = document.querySelector('.feedback');
  const feedsEl = document.querySelector('.feeds');
  const postsEl = document.querySelector('.posts');
  const modalEl = document.querySelector('.modal');
  const modalCloseBtns = modalEl.querySelectorAll('button');

  function render(path, value) {
    if (!this.isValid()) {
      userInputEl.classList.remove('is-valid');
      userInputEl.classList.add('is-invalid');
      feedbackEl.textContent = this.errorsList.join('. ');
      feedbackEl.classList.remove('text-success');
      feedbackEl.classList.add('text-danger');
    } else {
      if (path === 'feeds') {
        feedsEl.innerHTML = `<div class="card border-0">
          <div class="card-body">
            <h2 class="card-title h4">Фиды</h2>
          </div>
          <ul class="list-group border-0 rounded-0">
            ${value.map((feed) => `<li class="list-group-item border-0 border-end-0">
            <h3 class="h6 m-0">${feed.title}</h3>
            <p class="m-0 small text-black-50">${feed.description}</p>
          </li>`).join('')}        
          </ul>
        </div>`;
        feedbackEl.textContent = 'RSS успешно загружен';
        feedbackEl.classList.add('text-success');
        feedbackEl.classList.remove('text-danger');
        userInputEl.classList.remove('is-invalid');
        userInputEl.classList.add('is-valid');
        userInputEl.value = '';
        userInputEl.focus();
      }

      if (path === 'posts') {
        postsEl.innerHTML = `<div class="card border-0">
          <div class="card-body">
            <h2 class="card-title h4">Посты</h2>
          </div>
        </div>`;
        const postsListEl = document.createElement('ul');
        postsListEl.classList.add('list-group', 'border-0', 'rounded-0');
        value.forEach((post) => {
          const postItemEl = document.createElement('li');
          postItemEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
          postItemEl.innerHTML = `<a href="${post.href}" class="fw-normal link-secondary" data-id="${post.postId}" target="_blank" rel="noopener noreferrer">
            ${post.title}
          </a>`;

          const buttonPostPreviewEl = document.createElement('button');
          buttonPostPreviewEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
          buttonPostPreviewEl.setAttribute('type', 'button');
          buttonPostPreviewEl.setAttribute('data-id', post.postId);
          buttonPostPreviewEl.setAttribute('data-bs-toggle', 'modal');
          buttonPostPreviewEl.setAttribute('data-bs-target', '#modal');
          buttonPostPreviewEl.textContent = 'Просмотр';

          buttonPostPreviewEl.addEventListener('click', (e) => {
            e.preventDefault();
            this.modalData = post;
          });

          postItemEl.appendChild(buttonPostPreviewEl);
          postsListEl.appendChild(postItemEl);
        });

        postsEl.appendChild(postsListEl);
      }

      if (path === 'modalData') {
        if (value) {
          modalEl.querySelector('.modal-title').textContent = value.title;
          modalEl.querySelector('.modal-body').textContent = value.description;
          modalEl.querySelector('.modal-footer a').href = value.href;
        } else {
          modalEl.querySelector('.modal-title').textContent = '';
          modalEl.querySelector('.modal-body').textContent = '';
          modalEl.querySelector('.modal-footer a').href = '';
        }
      }
    }
  }

  const watchedState = onChange(state, render);

  Array.from(modalCloseBtns).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      watchedState.modalData = null;
    });
  });

  userLabel.textContent = i18n.t('rssForm.name');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    feedbackEl.textContent = '';
    watchedState.errorsList = [];
    watchedState.rss = userInputEl.value;

    const schema = yup.string()
      .required(i18n.t('rssForm.errors.notEmpty'))
      .url(i18n.t('rssForm.errors.notUrl'))
      .notOneOf(watchedState.rssList, i18n.t('rssForm.errors.noDuplication'));

    schema
      .validate(watchedState.rss)
      .then(() => {
        watchedState.rssList.push(watchedState.rss);
      })
      .then(() => {
        parse(watchedState.rss).then((data) => {
          watchedState.feeds.unshift(data.feed);
          watchedState.posts = [...data.posts, ...watchedState.posts];
        });

        watchedState.rssList.push(watchedState.rss);
      })
      .catch((error) => {
        watchedState.errorsList.push(error.message);
      });
  });
};
