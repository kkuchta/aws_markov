console.log("here");

//const API_URL = '/api/markov_produce_post';
const API_URL = 'https://totes-not-amazon.com/api/markov_produce_post';

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

  // make-title-like-this
  const urlTitle = content['title'].toLowerCase().replace(/[^a-z ]/, '').replace(/ +/g,'-')

  // Update page content
  const newPath = [
    'about-aws',
    'whats-new',
    year,
    month,
    urlTitle
  ].join('/') + '?s=' + seed
  window.history.pushState({}, 'push state title', newPath);
  console.log("newpath = ", newPath);
  // Update url
}

if (location.href.includes('http://localhost')) {
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
