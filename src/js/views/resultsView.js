import View from './view.js';
import previewView from './previewView.js';

class ResultsView extends View {
  _parentEl = document.querySelector('.results');
  _errorMessage = 'No recipes found for your query! Please try again ;)';
  _message = '';

  _generateMarkup() {
    if (this._data.length === 0) {
      return this._errorMessage;
    }
    return this._data.map(result => previewView.render(result, false)).join('');
  }
}

export default new ResultsView();
