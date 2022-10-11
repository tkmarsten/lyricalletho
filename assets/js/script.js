let targetEl = document.getElementById('modalEl');

let button = document.getElementById('show-modal')

button.addEventListener('click', function () {
  targetEl.style.display = 'block'
})

let closeButton = document.getElementById('close-button')

closeButton.addEventListener('click', function () {
  targetEl.style.display = 'none'
})