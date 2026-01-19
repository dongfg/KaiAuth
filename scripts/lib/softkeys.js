const softkeysEl = document.getElementById('softkeys');

function hideSoftkeys() {
  softkeysEl.classList.add('hidden');
}

function showSoftkeys() {
  softkeysEl.classList.remove('hidden');
}