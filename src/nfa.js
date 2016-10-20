const _ = require('lodash');

const offset = (states, offset) => states.map(ts => ts.map(([t, c]) => [t !== null ? t + offset : null, c]));

const connect = (states, target) => states.map(ts => ts.map(([t, c]) => [t === null ? target : t, c]));

const combine = (nfas, process) => nfas.reduce((res, nfa, i) => { 
  const start = _.get(_.last(res.ranges), 'end', -1) + 1;
  const end = start + nfa.length - 1;
  return {
    states: res.states.concat(process(offset(nfa, start), i, start, end)),
    ranges: res.ranges.concat({ start, end })
  };
}, { states: [], ranges: [] });

const regexHandlers = {
  character: node => [[[null, node.character]]],
  concatenation: node => 
    combine(node.children.map(fromRegex), (nfa, i, s, e) => connect(nfa, i < node.children.length - 1 ? e + 1 : null)).states,
  alternative: node => {
    const combined = combine(node.children.map(fromRegex), nfa => connect(offset(nfa, 2), 1));
    return [ 
      [...combined.ranges.map(r => [r.start + 2, ''])],
      [[null, '']],
      ...combined.states
    ];
  },
  star: node => {
    const nfa = connect(offset(node.child, 1), 0);
    return [
      [[null, ''], [1, '']],
      ...nfa
    ];
  },
  plus: node => {
    const nfa = connect(offset(fromRegex(node.child), 2), 1);
    return [
      [[2, '']],
      [[null, ''], [0, '']],
      ...nfa
    ];
  },
  characterClass: node => [
    node.characters.map(c => [1, c]),
    [[null, '']]
  ]
};

const fromRegex = node => regexHandlers[node.type](node);

module.exports = tokenDefinitions => {
  const nfas = tokenDefinitions.map(td => fromRegex(td.regex));
  const combined = combine(nfas, (nfa, i) => connect(offset(nfa, nfas.length + 1), i + 1));
  return {
    states: [
      [...combined.ranges.map(r => [r.start + nfas.length + 1, ''])],
      ...new Array(nfas.length).fill([]),
      ...combined.states
    ],
    acceptingStates: _.range(0, nfas.length + combined.states.length + 1).map(i => _.get(tokenDefinitions[i - 1], 'label'))
  };
};