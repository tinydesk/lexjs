const _ = require('lodash');
const RegexBuilder = require('../../lexjs/regex');

const characterClasses = new Array(256*256).fill(0);
_.range(0, 127).forEach(d => characterClasses[d] = d + 1);
const r = new RegexBuilder(characterClasses);

module.exports = {
  characterClasses: characterClasses,
  tokens: [
    {
      label: 'number',
      regex: r.atLeastOne(['0123456789'])
    },
    {
      label: 'space',
      regex: r.atLeastOne([' \n\r\f'])
    }
  ]
};