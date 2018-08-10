console.log("here");
const LOCAL = location.href.includes('http://localhost');

//const API_URL = '/api/markov_produce_post';
const API_URL = LOCAL ? 'https://totes-not-amazon.com/api/markov_produce_post' : '/api/markov_produce_post';

const params = new URLSearchParams(location.search.slice(1));
let seed = params.get('s')
if (seed == null || seed == '') {
  console.log("generating random seed");
  seed = btoa(Math.random().toString().slice(2,-1))
}

function getRandomInt(min, max) {
  return min + Math.floor(Math.random() * (max + 1 - min));
}

console.log("seed = ", seed);

function updateContent(content) {
  console.log("content = ", content);
  const year = getRandomInt(2010, (new Date()).getFullYear());
  const month = getRandomInt(1, 12);
  const day = getRandomInt(0, 28); // Tooooo lazy for date math.

  const monthString = (new Date(year, month - 1, day)).toLocaleString('en-us', { month: "short" });
  // Jul 31, 2018
  const postedOn = monthString + ' ' + day + ', ' + year;
  const dateElement = document.getElementsByClassName('date')[0]

  // Update post date
  dateElement.innerText = postedOn

  // Insert title in a few spots
  const title_swap_elements = [].slice.call(document.getElementsByClassName('title_swap'))
  for (let element of title_swap_elements) {
    element.innerText = content['title']
  }
  const title_swap_content_elements = [].slice.call(document.getElementsByClassName('title_swap_content'))
  for (let element of title_swap_content_elements) {
    element.setAttribute('content', content['title'])
  }

  // Insert body paragraphs
  const bodyContainer = document.getElementsByClassName('insert_post_here')[0];
  bodyContainer.innerHTML = '';
  const moreLink = ' For further details, please refer <a href="http://kevinkuchta.com">here</a>.';
  content['paragraphs'][content['paragraphs'].length - 1] += moreLink;
  paragraphs = content['paragraphs'].map((paragraph) => {
    const paragraphElement = document.createElement('div');
    paragraphElement.setAttribute('class', 'aws-text-box');
    paragraphElement.innerHTML = paragraph;
    bodyContainer.appendChild(paragraphElement);
  })

  // make-title-like-this
  const urlTitle = content['title'].toLowerCase().replace(/[^a-z ]/, '').replace(/ +/g,'-')

  for (let element of title_swap_elements) {
    element.innerText = content['title']
  }


  const newPath = [
    'about-aws',
    'whats-new',
    year,
    month,
    urlTitle
  ].join('/') + '?s=' + seed


  window.history.pushState({}, 'push state title', newPath);
  console.log("newpath = ", newPath);
}

if (LOCAL) {
  updateContent({
    title: "Some title here",
    paragraphs: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mi lectus, mollis id cursus in, blandit id leo. Sed et eros volutpat, sollicitudin erat tristique, pretium urna. Nulla euismod nunc risus, semper sollicitudin felis congue ut. In eu imperdiet risus, tristique ultrices mauris. Praesent sit amet lacus nec nunc aliquet molestie. Nulla rhoncus velit ac consectetur tristique. Morbi aliquam dui tristique tortor consequat vulputate. Praesent consectetur neque vel sem tempor lobortis. Sed non posuere quam, vitae faucibus ipsum. Duis commodo ex lectus, vel lacinia ligula posuere id.",
      "In rutrum fringilla quam, ut facilisis mi gravida aliquet. Vestibulum sapien diam, maximus vel ipsum ut, vulputate commodo erat. Praesent at eros tellus. Sed ut pulvinar tellus, id convallis nisl. Cras consectetur velit in ex maximus sodales. Quisque sed porta augue, a tincidunt mauris. Nulla facilisi. Pellentesque condimentum sodales mauris, ac sodales nisi consectetur id. In aliquet, nunc non volutpat ullamcorper, orci lacus scelerisque mi, quis porta arcu turpis eget quam. Nunc nisl metus, egestas vitae elit id, pretium tristique nunc. Maecenas ut arcu viverra, dapibus odio sed, ullamcorper tellus. Donec scelerisque mollis erat, in ultrices neque cursus sit amet. Sed blandit libero at enim vestibulum, quis placerat nibh malesuada.",
      "Duis scelerisque nulla in lacus egestas blandit. Quisque lobortis convallis justo ut porta. Suspendisse fermentum rutrum arcu eget efficitur. Phasellus at commodo neque. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque volutpat nulla a massa tincidunt, id ullamcorper lorem lacinia. Ut non eros vel leo pellentesque convallis eu sed risus. Donec a odio a metus tristique convallis elementum ut nisl. Donec congue massa vel magna varius lacinia. Maecenas pulvinar velit vulputate pharetra varius. Maecenas porta tortor vel libero gravida semper.",
    ]
  })
} else {
  fetch(API_URL + '?seed=' + seed)
    .then(function(response) { return response.json(); })
    .then(function(myJson) { updateContent(myJson); });
}
