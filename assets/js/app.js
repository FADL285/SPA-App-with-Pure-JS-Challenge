const videoRequestFormEl = document.getElementById('video-request');
const listOfRequestsEl = document.getElementById('list-of-requests');
const videoRequestCardTemplate = document.getElementById('card-template');
const sortElements = document.querySelectorAll('#filters button[id^=sort_by]');
let sortBy = '';
const searchBox = document.getElementById('search_box');
let searchTerm = '';

// !! HELPERS !! \\
// //__//==//__// //__//==//__// //__//==//__// //__//==//__// //

/**
 * debounce function delays the processing of the input event until the user has stopped typing for a predetermined amount of time (delay).
 * @param {Function} fn callback function that will be called after delay time expires.
 * @param {number} delay delay time in milliseconds to delay the processing of the callback function
 * @returns {Function}
 */
const debounce = (fn, delay) => {
  let timer;
  return function (...arg) {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(null, ...arg), delay);
  };
};

/**
 * Clear Any cards in list if requests div
 */
const clearListOfRequestsEl = () => {
  listOfRequestsEl.innerHTML = '';
};

// !! MAIN FUNCs !! \\
// //__//==//__// //__//==//__// //__//==//__// //__//==//__// //

/**
 * Take array of video requests and append them in dom.
 * @param  {Array} vidReq array of video requests.
 * @param {boolean} clean remove any cards in video requests list
 */
const addCardToView = (vidReq, clean = false) => {
  // console.log(vidReq);
  const containerFragment = document.createDocumentFragment();
  vidReq.forEach((el) => {
    const cardEl = document.importNode(videoRequestCardTemplate.content, true);
    cardEl.querySelector('.card').id = `id_${el._id}285`;
    cardEl.querySelector('.card__title').textContent = el.topic_title;
    cardEl.querySelector('.card__desc').textContent = el.topic_details;
    if (!el.expected_result)
      cardEl
        .querySelector('.card__expected-res_container')
        .classList.add('d-none');
    cardEl.querySelector('.card__expected-res').textContent =
      el.expected_result;
    cardEl.querySelector('.card__votes-count').textContent =
      el.votes.ups - el.votes.downs;
    cardEl.querySelector('.card__status').textContent = el.status;
    cardEl.querySelector('.card__author').textContent = el.author_name;
    cardEl.querySelector('.card__date').textContent = new Date(
      el.submit_date
    ).toLocaleString();
    cardEl.querySelector('.card__level').textContent = el.target_level;

    containerFragment.append(cardEl);
  });
  // console.log(containerFragment.content);
  if (clean) clearListOfRequestsEl();
  listOfRequestsEl.prepend(containerFragment);
};

/**
 * Fetch video requests from the server.
 * @param {{sortBy: string, filterBy: string, searchTerm: string}} modifyObject modify the request by sorting, filtering and/or searching.
 */
const fetchVideoRequest = async ({ sortBy, filterBy, searchTerm } = {}) => {
  try {
    const response = await fetch(
      `http://localhost:7777/video-request${
        searchTerm ? '?searchTerm=' + searchTerm : ''
      }`
    );
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    if (sortBy === 'topVotedFirst')
      data.sort(
        (a, b) => b.votes.ups - b.votes.downs - (a.votes.ups - a.votes.downs)
      );
    addCardToView(data, true);
  } catch (err) {
    console.log(err.message);
  }
};

/**
 * Create new Video Request by submitting the form.
 */
const formSubmitHandler = async (event) => {
  event.preventDefault();
  const formData = new FormData(videoRequestFormEl);
  videoRequestFormEl.querySelector('button').disabled = true;
  try {
    const response = await fetch('http://localhost:7777/video-request', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    addCardToView([data]);
    videoRequestFormEl.reset();
  } catch (err) {
    console.log(err.message);
  }
  videoRequestFormEl.querySelector('button').disabled = false;
};

/**
 * Make Vote Handler
 */
const makeVoteHandler = async (event) => {
  if (!event.target.classList.contains('vote-btn')) return;
  const cardId = event.target.closest('.card').id.slice(3, -3);
  const voteType = event.target.dataset.voteType;
  const response = await fetch('http://localhost:7777/video-request/vote', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: cardId,
      vote_type: voteType
    })
  });
  const data = await response.json();
  event.target.parentElement.querySelector('.card__votes-count').textContent =
    data.ups - data.downs;
};

/**
 * Sort video requests based on sort type {newFirst - topVotedFirst}
 */
const sortResponsesHandler = (event) => {
  sortBy = event.target.dataset.type;
  fetchVideoRequest({ sortBy, searchTerm });
  event.target.classList.add('active');
  const sibling =
    event.target.previousElementSibling || event.target.nextElementSibling;
  sibling.classList.remove('active');
};

/**
 * Handle users searching.
 */
const searchHandler = debounce(fetchVideoRequest, 550);

// //__//==//__// //__//==//__// //__//==//__// //__//==//__// //

fetchVideoRequest();
videoRequestFormEl.addEventListener('submit', formSubmitHandler);
listOfRequestsEl.addEventListener('click', makeVoteHandler);
sortElements.forEach((element) => {
  element.addEventListener('click', sortResponsesHandler);
});
searchBox.addEventListener('input', (event) => {
  searchTerm = event.target.value;
  searchHandler({ sortBy, searchTerm });
});
