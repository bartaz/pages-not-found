var pages = PAGES;

var currentPage = 'intro';
var inventory = [];

var textEl = document.querySelector(".content");
var choicesEl = document.querySelector(".choices");
var invEl = document.querySelector(".inventory");

var pagesFound = [];

function renderPage(page) {
  pagesFound.push(page);
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
      var isAvailable = !link.need || inventory.indexOf(link.need) >= 0;
      var isFound = pagesFound.indexOf(id) >= 0;

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
    inventory.push(page.gain)
  }
  if (page.lose) {
    page.lose.forEach(function(item) {
      var index = inventory.indexOf(item);
      if (index > -1) {
        inventory.splice(index, 1);
      }
    })
  }
  if (theEnd) {
    inventory = [];
  }

  if (inventory.length) {
    invEl.innerHTML = "ITEMS: " + inventory.join();
  } else {
    invEl.innerHTML = "";
  }

}

renderPage('intro');

document.addEventListener('click', function(event) {
	var target = event.target;
  if (target.dataset.next) {
    renderPage(target.dataset.next)
  }
});
