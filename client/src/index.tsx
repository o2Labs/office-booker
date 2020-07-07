// Polyfills for IE11
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import Root from './components/Root';

ReactDOM.render(<Root />, document.getElementById('root'));
