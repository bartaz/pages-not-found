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

function renderPage(page, isInit) {
  current = page;
  found.push(page);

  var pageNo = Object.keys(pages).indexOf(page);
  if (pageNo > 0) {
    pageEl.innerHTML = pageNo;
  } else {
    pageEl.innerHTML = ""
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
        return '<li class="locked"><span>Page not found</span><span>' + page + '</span></li>';
      } else if (isAvailable || isToc) {
        return '<li><a href="#" data-next="' + id +'"><span>' + link.clip + '</span><span>' + page + '</span></a></li>';
      } else {
        return '<li class="locked" title="Requires a ' + link.need + '"><span>' + link.clip + '</span><span>???</span></li>'
      }
    }).join("");
  } else {
    choicesEl.innerHTML = "";
  }

  if (page.gain && !isInit) {
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
    invEl.innerHTML = supply.map(function(item){ return "<span>" + item + "</span>" }).join("");
  } else {
    invEl.innerHTML = "";
  }

  saveGameData({ current: current, supply: supply, found: found });
}

renderPage(current, true);

document.addEventListener('click', function(event) {
	var target = event.target;
  if (target.dataset.next) {
    renderPage(target.dataset.next)
  }
});
