const linksDiv = document.querySelector('#link');

for (let i = 0; i < linksDiv.children.length; i++) {
  const link = linksDiv.children[i];
  const text = link.innerText;

  link.querySelector('pre').style.display = 'inline-block';
  const checkboxEl = document.createElement('span');
  checkboxEl.innerHTML = `<span style="cursor: pointer;"><input type="checkbox" id=${i}></input><label style="cursor: pointer;" for=${i}>(CLICK TO IGNORE)</label>&nbsp;</span>`;
  link.insertBefore(checkboxEl, link.children[0]);
  const checkbox = checkboxEl.querySelector('input');

  const onChecked = function() {
    console.info('checked');
    checkbox.checked = true;
    link.style.opacity = '0.3';
    localStorage.setItem(text, 1);

  };
  const onUnchecked = function() {
    console.info('nope');
    checkbox.checked = false;
    link.style.opacity = '1.0';
    localStorage.removeItem(text);
  }

  if (localStorage.getItem(text)) {
    onChecked()
  } else {
    onUnchecked();
  }

  checkbox.addEventListener('change', function() {
    setTimeout(function() {
    console.info('change');
    if (checkbox.checked) {
      onChecked();
    } else {
      onUnchecked();
    }
    });
  });
}

