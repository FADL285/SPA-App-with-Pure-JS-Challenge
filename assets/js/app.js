const videoRequestFormEl = document.getElementById('video-request');
const listOfRequestsEl = document.getElementById('list-of-requests');
const videoRequestCardTemplate = document.getElementById('card-template');

const addCardToView = (...vidReq) => {
  console.log(vidReq);
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
  listOfRequestsEl.prepend(containerFragment);
};

const fetchVideoRequest = async () => {
  try {
    const response = await fetch('http://localhost:7777/video-request');
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    addCardToView(...data);
  } catch (err) {
    console.log(err.message);
  }
};

const formSubmitHandler = async (event) => {
  event.preventDefault();
  const formData = new FormData(videoRequestFormEl);
  videoRequestFormEl.querySelector('button').disabled = true;
  try {
    const response = await fetch('http://localhost:7777/video-request', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    addCardToView(data);
    videoRequestFormEl.reset();
  } catch (err) {
    console.log(err.message);
  }
  videoRequestFormEl.querySelector('button').disabled = false;
};

const makeVoteHandler = async (event) => {
  if (!event.target.classList.contains('vote-btn')) return;
  const cardId = event.target.closest('.card').id.slice(3, -3);
  const voteType = event.target.dataset.voteType;
  const response = await fetch('http://localhost:7777/video-request/vote', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: cardId,
      vote_type: voteType,
    }),
  });
  const data = await response.json();
  event.target.parentElement.querySelector('.card__votes-count').textContent =
    data.ups - data.downs;
};

fetchVideoRequest();
videoRequestFormEl.addEventListener('submit', formSubmitHandler);
listOfRequestsEl.addEventListener('click', makeVoteHandler);
