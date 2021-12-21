const videoRequestFormEl = document.getElementById('video-request');
const listOfRequestsEl = document.getElementById('list-of-requests');
const videoRequestCardTemplate = document.getElementById('card-template');

const addCardToView = (...vidReq) => {
  const containerFragment = document.createDocumentFragment();
  vidReq.forEach((el) => {
    const cardEl = document.importNode(videoRequestCardTemplate.content, true);
    cardEl.querySelector('.card__title').textContent = el.topic_title;
    cardEl.querySelector('.card__desc').textContent = el.topic_details;
    cardEl.querySelector('.card__expected-res').textContent =
      el.expected_result;
    cardEl.querySelector('.card__status').textContent = el.status;
    cardEl.querySelector('.card__author').textContent = el.author_name;
    cardEl.querySelector('.card__date').textContent = new Date(
      el.submit_date
    ).toLocaleDateString();
    cardEl.querySelector('.card__level').textContent = el.target_level;

    containerFragment.append(cardEl);
  });
  listOfRequestsEl.append(containerFragment);
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

fetchVideoRequest();
videoRequestFormEl.addEventListener('submit', formSubmitHandler);
