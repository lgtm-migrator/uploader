// setup JSDOM
require('jsdom-global')()
window.Date = Date

// make expect available globally
global.expect = require('chai').expect
