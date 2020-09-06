// Pages data is built from book.yml file
var pages = PAGES;

// DOM elements
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

// string id of the current page
var current = data.current;

// list of found pages
// to avoid duplicates and keep code shorts it's an object with found pages as keys: { page: 1 }
var found = data.found;

// array of gained items (as strings), used/lost items are kept in the array as <s>item</s> (so they are crossed out when rendered)
var supply = data.supply;

// Main functionality of the game.
// Updates the game state according to provided page id. Renders given page, available choices and 'items' in the supply.
// @param page   - string id of page to go to (from book.yml) or 'toc' for table of contents
// @param isInit - boolean, defaults to false, is set to true on initial load of the page to avoid duplicated state updates
function gotoPage(page, isInit) {
  current = page;
  document.body.className = page;
  found[page] = 1;

  // get page number (based on order in the data)
  var pageNo = Object.keys(pages).indexOf(page);
  if (pageNo > 0) {
    pageEl.innerHTML = pageNo;
  } else {
    pageEl.innerHTML = ""
  }

  // toc (table of contents) is a page with empty text and full list of pages as choices
  var isToc = page == 'toc';
  if (isToc) {
    page = {
      next: Object.keys(pages)
    }
    // you only get to toc after finishing the story, so we clear the supply list
    supply = [];
  } else {
    page = pages[page];
  }

  // if page doesn't link to any other pages, it's considered the end
  var theEnd = !page.next;

  textEl.classList.remove('q');
  if (page.text) {
    var text = page.text;

    // :first-letter CSS selector used for drop caps matches quote characters as well
    // so we need to hack around it by removing starting quote from the page text
    // and adding it back via CSS and 'q' class
    if (text.indexOf('“') == 0) {
      text = text.substr(1);
      textEl.classList.add('q');
    }

    // short'n'dirty conversion of new lines into paragraphs
    // closing </p> tags omitted to save couple bytes
    textEl.innerHTML = '<p>' + text.replace(/\n/g,'<p>');
  } else {
    textEl.innerHTML = '';
  }

  // if given page gives any items, add them to supply list
  if (page.gain && !isInit) {
    // Supply array contains both available items (as strings) and also used ones (wrapped in <s> element)
    // and we also want to avoid gaining duplicates of the same items when story is replayed (thanks to magic of wishes!).
    // We need a bit convoluted way of updating the supply list to make sure that items are not added again, if they are
    // already on the list (available or not), but also we want to be able to gain multiples of the same item at once
    // as we need it to gain three wishes...
    //
    // The method below quite likely only works when you only add one type of item at once, but that's enough for out cases.

    var startIndex = 0; // starting index for searching in the supply list
    var index;          // index of current item found in the supply array

    // for every item that we gain on the page, we need to check if we already have it on the list
    [].concat(page.gain).forEach(function(item) {
      // search if the item is already used (wrapped in <s>)
      index = supply.indexOf('<s>' + item + '</s>', startIndex);
      if (index > -1) {
        // if found, replace it with available item (remove <s>)
        supply[index] = item;
        // update startIndex to skip it in next iteration
        startIndex = index + 1;
      } else {
        // otherwise, try to find it as available item
        index = supply.indexOf(item, startIndex);
        if (index > -1) {
          // if found, don't add it again, just update startIndex to skip it in next iteration
          startIndex = index + 1;
        } else {
          // otherwise (the item was not on the list at all), add it to the end of the list
          supply.push(item);
          startIndex = supply.length + 1;
        }
      }
    });
  }

  // when items is used/lost we want to render it crossed out, so we just wrap it with <s>
  if (page.lose && !isInit) {
    page.lose.forEach(function(item) {
      var index = supply.indexOf(item);
      if (index > -1) {
        supply[index] = '<s>' + item + '</s>'
      }
    })
  }

  if (theEnd) {
    // if the page is ending the story, we add a link to the table of contents
    choicesEl.innerHTML = '<li data-next="toc"><span>THE END</span><span></span></li>'
  } else {
    // render the list of all available choices of pages
    choicesEl.innerHTML = page.next.map(function(nextPageId) {
      var nextPage = pages[nextPageId];
      var nextPageNo = Object.keys(pages).indexOf(nextPageId);
      var isAvailable = !nextPage.need || supply.indexOf(nextPage.need) >= 0; // check if supply contains item required by linked page

      if (isToc && !found[nextPageId]) {
        // pages that haven't been found yet are visible in table of contents, but not linked
        return '<li class=l><span>Page not found</span><span>' + nextPageNo + '</span></li>';
      } else if (isAvailable || isToc) {
        // available pages are linked
        return '<li data-next=' + nextPageId +'><span>' + nextPage.clip + '</span><span>' + nextPageNo + '</span></li>';
      } else {
        // links to unavailable pages (with unfullfiled item requirements) are disabled
        return '<li class=l><span>' + nextPage.clip + '</span><span>' + nextPageNo + '</span></li>'
      }
    }).join("");

    // Had an idea for little easter egg with 404 page not found in the table of contents
    // but it could be a bit confusing and was taking precious ~20B
    // if (isToc) {
    //   choicesEl.innerHTML += '<li class=l><span>Page not found</span><span>404</span></li>';
    // }
  }

  // render supply list (if it contains any items)
  // each item is a span, used/lost items will be crossed out because they are already wrapped in <s>
  if (supply.length) {
    supplyEl.innerHTML = supply.map(function(item){ return "<span>" + item + "</span>" }).join("");
  } else {
    supplyEl.innerHTML = "";
  }

  // when the 'book' page is unlocked, magically all the pages are found
  if (current === 'book') {
    Object.keys(pages).forEach(function(page) {
      found[page] = 1;
    })
  }

  saveGameData({ current: current, supply: supply, found: found });
}

// initial render on page load
gotoPage(current, true);

// event handler for clicks on section links
document.addEventListener('click', function(event) {
  var next = event.target.dataset.next;

  if (event.target.dataset.next) {
    gotoPage(next)
  }
});
