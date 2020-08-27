var pages = PAGES;

var textEl = document.querySelector(".content");
var choicesEl = document.querySelector(".choices");
var invEl = document.querySelector(".supply");
var pageEl = document.querySelector("#pageNo");

// GAME DATA
function readGameData() {
  var gameData;

  try {
    gameData = JSON.parse(localStorage.getItem('THE_BOOK_OF_PAGES_NOT_FOUND_DATA'));
  } catch(e) {
    // ignore and return default
  }

  return gameData || { found: [], current: 'intro', supply: [] };
}

function saveGameData(data) {
  try {
    localStorage.setItem('THE_BOOK_OF_PAGES_NOT_FOUND_DATA', JSON.stringify(data));
  } catch (e) {
    // silently ignore
  }
}

var data = readGameData();
var current = data.current;
var found = data.found;
var supply = data.supply;

function renderPage(page) {
  current = page;
  found.push(page);

  var pageNo = Object.keys(pages).indexOf(page);
  if (pageNo > 0) {
    pageEl.innerHTML = pageNo;
  }

  var isToc = page == 'toc';
  if (isToc) {
    page = {
      next: Object.keys(pages)
    }
  } else {
    page = pages[page];
  }

  var theEnd = !page.next;

  if (page.text) {
    textEl.innerHTML = '<p>' + page.text.replace(/\n/g,'<p>');

    if (theEnd) {
      textEl.innerHTML += "<p><a href='#' data-next='toc'>THE END</a>";
    }
  } else {
    textEl.innerHTML = "";
  }

  if (page.next) {
    choicesEl.innerHTML = page.next.map(function(id) {
      var link = pages[id];
      var page = Object.keys(pages).indexOf(id);
      var isAvailable = !link.need || supply.indexOf(link.need) >= 0;
      var isFound = found.indexOf(id) >= 0;

      if (isToc && !isFound) {
        return '<li>Page not found' + '... [' + page + ']</a></li>';
      } else if (isAvailable || isToc) {
        return '<li><a href="#" data-next="' + id +'">' + link.clip + '... [' + page + ']</a></li>';
      } else {
        return '<li>' + link.clip + '...</li>'
      }
    }).join("");
  } else {
    choicesEl.innerHTML = "";
  }

  if (page.gain) {
    supply.push(page.gain)
  }
  if (page.lose) {
    page.lose.forEach(function(item) {
      var index = supply.indexOf(item);
      if (index > -1) {
        supply.splice(index, 1);
      }
    })
  }
  if (theEnd) {
    supply = [];
  }

  if (supply.length) {
    invEl.innerHTML = "ITEMS: " + supply.join();
  } else {
    invEl.innerHTML = "";
  }

  saveGameData({ current: current, supply: supply, found: found });
}

renderPage(current);

document.addEventListener('click', function(event) {
	var target = event.target;
  if (target.dataset.next) {
    renderPage(target.dataset.next)
  }
});
