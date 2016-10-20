const _ = require('lodash');

class WorkingListSet {

  constructor(elements, eq) {
    this.eq = eq;
    this.elements = elements.map(e => ({
      checked: false,
      item: e
    }));
  }

  contains(elem) {
    return this.elements.find(e => this.eq(e.item, elem)) !== undefined;
  }

  add(elem) {
    if (!this.contains(elem)) {
      this.elements.push({
        checked: false,
        item: elem
      });
    }
  }

  next() {
    return this.elements.find(e => e.checked === false);
  }

}

const closure = (states, fn, eq = (a, b) => a === b) => {
  const set = new WorkingListSet(states, eq);
  let next = set.next();
  while (next) {
    fn(next.item).forEach(e => set.add(e));
    next.checked = true;
    next = set.next();
  }
  return set.elements.map(e => e.item);
}


const epsilonTransitions = nfa => state => nfa[state].filter(t => t[1] === '').map(t => t[0]);

const epsilonClosure = (nfa, states) => closure(states, epsilonTransitions(nfa));

const move = (nfa, alphabet) => state => _.range(0, alphabet).map(c => epsilonClosure(nfa, _.flatMap(state, s => nfa[s].filter(t => t[1] === c).map(t => t[0]))));

const dfa = (nfa, alphabet) => {
  const startState = epsilonClosure(nfa.states, [0]);
  const m = move(nfa.states, alphabet);
  const states = closure([startState], s => m(s).filter(s => s.length > 0), (a, b) => _.isEqual(a, b));
  const transitions = states.map(s =>
    m(s)
      .map(s => states.findIndex(t => _.isEqual(s, t)))
  );
  return minimize({
    alphabet,
    states: transitions,
    acceptingStates: states.map(s => _.compact(s.map(i => nfa.acceptingStates[i])))
  });
}

const minimize = dfa => {
  let checked = [false, false];
  let x = 0;
  const groups = dfa.acceptingStates.map(a => a.length > 0 ? ++x : 0);

  const states = group => groups.reduce((arr, g, i) => g === group ? arr.concat(i) : arr, []);

  const split = group => {
    const st = states(group);
    const statesToGroups = st.map(s => ({ index: s, transitions: dfa.states[s].map(t => groups[t]) }));
    const newGroups = _.values(_.groupBy(statesToGroups, s => 'T' + s.transitions.join(''))).map(s => s.map(s => s.index));
    if (newGroups.length === 1) {
      // a single group:
      checked[group] = true;
    } else {
      // create new groups:
      _.tail(newGroups).forEach((g, i) => g.forEach(s => groups[s] = i + checked.length));
      checked = checked.concat(new Array(newGroups.length - 1).fill(false));
    }
  }

  let i = checked.indexOf(false);
  while (i >= 0) {
    split(i);
    i = checked.indexOf(false);
  }

  const minimizedStates = groups.reduce((res, g, s) => {
    if (res[g] === undefined) {
      res[g] = dfa.states[s].map(t => groups[t])
    }
    return res;
  }, []);
  return {
    alphabet: dfa.alphabet,
    states: minimizedStates,
    acceptingStates: groups.reduce((res, g, s) => { 
      res[g] = res[g].concat(dfa.acceptingStates[s]);
      return res;
    }, new Array(minimizedStates.length).fill([]))
  }

}

module.exports = {
  epsilonClosure,
  move,
  dfa
};