var pages = PAGES;

var currentPage = 'intro';
var inventory = [];

var textEl = document.querySelector(".content");
var choicesEl = document.querySelector(".choices");
var invEl = document.querySelector(".inventory");

function renderPage(page) {
  page = pages[page];
	textEl.innerHTML = '<p>' + page.text.replace(/\n/g,'<p>');

  var theEnd = !page.choices;

  if (theEnd) {
    textEl.innerHTML += "THE END";
  }

  if (page.choices) {
    choicesEl.innerHTML = page.choices.map(function(choice) {
      var id = "" + choice;
      var link = pages[id];
      var page = Object.keys(pages).indexOf(id);
      var isAvailable = !link.requires || inventory.indexOf(link.requires) >= 0;

      if (isAvailable) {
        return '<li><a href="#" data-link="' + id +'">' + link.title + '... [' + page + ']</a></li>';
      } else {
        return '<li>' + link.title + '...</li>'
      }
    }).join("");
  } else {
    choicesEl.innerHTML = "";
  }

  if (page.add) {
    inventory.push(page.add)
  }
  if (page.remove) {
    page.remove.forEach(function(item) {
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
    invEl.innerHTML = "ITEMS:" + inventory.join();
  } else {
    invEl.innerHTML = "";
  }

}

renderPage('intro');

document.addEventListener('click', function(event) {
	var target = event.target;
  if (target.dataset.link) {
    renderPage(target.dataset.link)
  }
});