import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export default (urlRss) => axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(urlRss)}`)
  .then((response) => {
    // console.log(response);
    if (response.status === 200) {
      return response.data.contents;
    }
    throw new Error('Network response was not ok.');
  })
  .then((data) => {
    const parser = new DOMParser();
    const rssDocument = parser.parseFromString(data, 'application/xml');

    const feed = {
      id: uuidv4(),
      url: urlRss,
      title: rssDocument.documentElement.querySelector('channel title').textContent,
      description: rssDocument.documentElement.querySelector('channel description').textContent,
    };

    const posts = Array
      .from(rssDocument.documentElement.children[0].children)
      .filter((el) => el.tagName === 'item')
      .map((item) => ({
        feedId: feed.id,
        postId: uuidv4(),
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        href: item.querySelector('link').textContent,
      }));
    return { feed, posts };
  });
