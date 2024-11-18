import { API_URL, REULTS_PER_PAGE, LOCAL_KEY, KEY } from './config.js';
// import { getJson, sendJson } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: REULTS_PER_PAGE,
  },
  bookmarks: [],
};
const createRecipeObject = function (data) {
  const { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    ingredients: recipe.ingredients,
    imageUrl: recipe.image_url,
    servings: recipe.servings,
    sourceUrl: recipe.source_url,
    cookingTime: recipe.cooking_time,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);
    console.log(state.recipe);
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    // Temp err Handling
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        imageUrl: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};

export const getSearchResultsPage = function (page = 1) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9
  return state.search.results.slice(start, end);
};

export const updateServing = function (newServing) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity * (newServing / state.recipe.servings);
    // NewQun = OldQun * NewServing / OldSering
  });

  state.recipe.servings = newServing;
};

const persistBookmarks = function (localKey) {
  localStorage.setItem(localKey, JSON.stringify(state.bookmarks));
};

export const addBookMark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe  as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks(LOCAL_KEY);
};

export const deleteBookMark = function (id) {
  // Add bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as Not bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks(LOCAL_KEY);
};

const init = function () {
  const storage = localStorage.getItem(LOCAL_KEY);
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear(LOCAL_KEY);
};

// clearBookmarks()

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(ing => ing[0].startsWith('ingredient') && ing[1] !== '')
      .map(ing => {
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use the correct format ;)'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);

    state.recipe = createRecipeObject(data);
    addBookMark(state.recipe);
  } catch (err) {
    throw err;
  }
};
