var pages = PAGES;

var textEl = document.querySelector("#t");
var choicesEl = document.querySelector("ul");
var supplyEl = document.querySelector("#s");
var pageEl = document.querySelector("b");

// GAME DATA
function readGameData() {
  try {
    return JSON.parse(localStorage.getItem('THE_BOOK_OF_PAGES_NOT_FOUND_DATA'));
  } catch(e) {
    // ignore and return default
  }
  return { found: {}, current: 'intro', supply: [] };
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

  if (page.text) {
    textEl.innerHTML = '<p>' + page.text.replace(/\n/g,'<p>');

    if (theEnd) {
      textEl.innerHTML += "<p><a data-next=toc>THE END</a>";
    }
  } else {
    textEl.innerHTML = "";
  }

  if (page.next) {
    choicesEl.innerHTML = page.next.map(function(nextPageId) {
      var nextPage = pages[nextPageId];
      var nextPageNo = Object.keys(pages).indexOf(nextPageId);
      var isAvailable = !nextPage.need || supply.indexOf(nextPage.need) >= 0;

      if (isToc && !found[nextPageId]) {
        return '<li class=locked><span>Page not found</span><span>' + nextPageNo + '</span></li>';
      } else if (isAvailable || isToc) {
        return '<li data-next=' + nextPageId +'><span>' + nextPage.clip + '</span><span>' + nextPageNo + '</span></li>';
      } else {
        return '<li class=locked title="Requires a ' + nextPage.need + '"><span>' + nextPage.clip + '</span><span>???</span></li>'
      }
    }).join("");
  } else {
    choicesEl.innerHTML = "";
  }

  if (page.gain && !isInit) {
    // TODO: to replace crossed item when gaining it again ~20B
    // var index = supply.indexOf('<s>' + item + '</s>');
    // if (index) {
    //   supply[index] = item;
    // } else {
      supply.push(page.gain)
    // }
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

  if (supply.length) {
    supplyEl.innerHTML = supply.map(function(item){ return "<span>" + item + "</span>" }).join("");
  } else {
    supplyEl.innerHTML = "";
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
