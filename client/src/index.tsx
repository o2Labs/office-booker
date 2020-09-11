// Polyfills for IE11
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import Root from './components/Root';

ReactDOM.render(<Root />, document.getElementById('root'));
