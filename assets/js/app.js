const videoRequestForm = document.getElementById('video-request');

const formSubmitHandler = async (event) => {
  event.preventDefault();
  const formData = new FormData(videoRequestForm);
  videoRequestForm.querySelector('button').disabled = true;
  const response = await fetch('http://localhost:7777/video-request', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  console.log(data);
  videoRequestForm.querySelector('button').disabled = false;
  videoRequestForm.reset();
};

videoRequestForm.addEventListener('submit', formSubmitHandler);
