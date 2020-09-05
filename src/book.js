var pages = PAGES;

var textEl = document.querySelector("#t");
var choicesEl = document.querySelector("ul");
var supplyEl = document.querySelector("#s");
var pageEl = document.querySelector("b");

// GAME DATA
function readGameData() {
  var data;
  try {
    data = JSON.parse(localStorage.getItem('THE_BOOK_OF_PAGES_NOT_FOUND_DATA'));
  } catch(e) {
    // ignore and return default
  }
  return data || { found: {}, current: 'intro', supply: [] };
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
  found[page] = 1;

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

  document.body.className = current;

  if (page.text) {
    textEl.innerHTML = '<p>' + page.text.replace(/\n/g,'<p>');
  } else {
    textEl.innerHTML = '';
  }

  if (page.gain && !isInit) {
    // supply = supply.concat(page.gain)
    //
    // gain items in a way that makes sure you don't get duplicates when starting again
    // adds ~65B
    var startIndex = 0;
    var index;
    [].concat(page.gain).forEach(function(item) {
      index = supply.indexOf('<s>' + item + '</s>', startIndex);
      if (index > -1) {
        supply[index] = item;
        startIndex = index + 1;
      } else {
        index = supply.indexOf(item, startIndex);
        if (index > -1) {
          startIndex = index + 1;
        } else {
          supply.push(item);
          startIndex = supply.length + 1;
        }
      }
    });
  }

  if (page.lose) {
    page.lose.forEach(function(item) {
      var index = supply.indexOf(item);
      if (index > -1) {
        supply[index] = '<s>' + item + '</s>'
      }
    })
  }
  if (theEnd) {
    supply = [];
  }

  if (theEnd) {
    choicesEl.innerHTML = '<li data-next="toc"><span>THE END</span><span></span></li>'
  } else {
    choicesEl.innerHTML = page.next.map(function(nextPageId) {
      var nextPage = pages[nextPageId];
      var nextPageNo = Object.keys(pages).indexOf(nextPageId);
      var isAvailable = !nextPage.need || supply.indexOf(nextPage.need) >= 0;

      if (isToc && !found[nextPageId]) {
        return '<li class=locked><span>Page not found</span><span>' + nextPageNo + '</span></li>';
      } else if (isAvailable || isToc) {
        return '<li data-next=' + nextPageId +'><span>' + nextPage.clip + '</span><span>' + nextPageNo + '</span></li>';
      } else {
        // tooltip with requirement (~20B)
        return '<li class=locked title="Requires a ' + nextPage.need + '"><span>' + nextPage.clip + '</span><span>???</span></li>'
      }
    }).join("");

    if (isToc) {
      choicesEl.innerHTML += '<li class=locked><span>Page not found</span><span>404</span></li>';
    }
  }

  if (supply.length) {
    supplyEl.innerHTML = supply.map(function(item){ return "<span>" + item + "</span>" }).join("");
  } else {
    supplyEl.innerHTML = "";
  }

  // when the book is unlocked, find all pages
  if (current === 'book') {
    Object.keys(pages).forEach(function(page) {
      found[page] = 1;
    })
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
