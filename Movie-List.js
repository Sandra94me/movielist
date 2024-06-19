const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    // 需要title 跟image 兩個item
    rawHTML +=
      ` <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top"
              alt="Movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">more</button>
              <button class="btn btn-info btn-add-favorite"  data-id="${item.id}">+</button>
            </div>
          </div>          
        </div> 
      </div>`
    // console.log(item)
  })

  dataPanel.innerHTML = rawHTML
}

//重整顯示頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}



//處理分頁數量的部分
function getMoviesByPage(page) {
  // page 1 → movies 0 - 11
  // page 2 → movies 12 - 23
  // page 3 → movies 24 - 35
  // ...

  const data = filteredMovies.length ? filteredMovies : movies


  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)

}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    //response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = ' Release date：' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}"
                alt="movie-poster" class="img-fluid">`

  })
}

searchForm.addEventListener('submit', function onSearchFormSumitted(event) {
  event.preventDefault()
  console.log(searchInput)
  console.log(searchInput.value)
  const keyword = searchInput.value.trim().toLowerCase()

  // if(!keyWord.length){
  //   return alert('Please enter valid string !')
  // }

  // 方法一:使用迴圈
  // for (const movie of movies){
  //   if(movie.title.toLowerCase().includes(keyWord)){
  //     filteredMovies.push(movie)
  //   }
  // }
  // renderMovieList(filteredMovies)

  //方法二:使用filter
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert('Cannot find movie with keyword:' + keyword)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

function addToFavorite(id) {
  function isMovieIdMatched(movie) {
    return movie.id === id
  }

  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(isMovieIdMatched)

  if (list.some((movie) => movie.id === id)) {
    return alert('已經加過最愛囉!')
  }

  list.push(movie)

  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
    console.log(event.target.dataset)

  }
})

//依照分頁器典籍事件id 決定顯示渲染該頁顯示畫面
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})


axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
  console.log(response.data.results)
})
  .catch((err) => console.log(err))

