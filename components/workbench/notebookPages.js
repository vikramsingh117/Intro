export const NOTEBOOK_PAGES = [
  {
    title: 'upliance / bits to check', subtitle: 'SCRATCH WORK', doodle: 'loop',
    text: 'Rough notes on diet changes, pruning incompatible allergens, unset versus saved preferences, restoring scroll after rendering, and device-aware recipe filtering.',
    question: '',
    notes: ['Chat sketch: show Generate recipe only when the backend action exists.', 'Archived session: hide input. Otherwise show allowed actions.', 'Test empty state.'],
    caption: 'Crossed-out ideas, a quick chat wireframe, conditional pseudocode and a small paper-plane doodle.',
  },
  {
    title: 'fib / rough', subtitle: 'SCRATCH WORK', doodle: 'recursion',
    text: 'Fibonacci scratch work: f(4) = f(3) + f(2) = 2 + 1 = 3. A table of values from n = 0 to 7, crossed-out complexity, and a small lc ~600 margin note.',
    question: '',
    notes: ['memo = {}', 'fib(n): if n <= 1, return n; if n is in memo, return memo[n]. Otherwise memo[n] = fib(n-1) + fib(n-2); return memo[n].'],
    caption: 'A loosely drawn recursion tree with repeated f(2) calls circled, pseudocode underneath, and an unrelated little cat doodle.',
  },
  {
    title: 'harness? / reading notes', subtitle: 'SCRATCH WORK', doodle: 'harness',
    text: 'Agent-harness learning notes: model, tools, loop, state and limits. Context might include instructions, task and tool results; question marks around history and summarization.',
    question: '',
    notes: ['Loop sketch: while budget remains, call the model; stop if done; check tool permission; run the tool; append results and save the trace.', 'Cap retries and record errors.', 'Todo: try a tiny evaluation. Timeout, bad arguments, denied permission.'],
    caption: 'Loose arrows, crossed-out assumptions, pseudocode and a tiny ringed-planet doodle. Learning scratch work, not a shipped implementation.',
  },
  {
    title: 'Tear this page by dragging it', subtitle: 'MAKE SOMETHING OF IT', doodle: 'tear',
    text: 'Tear this page by dragging it. Keep tearing to collect paper balls, then go back to the desk to flick them one after another.',
    question: '', notes: [], caption: 'My doodle pages follow. Take as many as you like.',
  },
  ...[
    { caption: 'Cats, music, little characters and pen sketches.', paperColor: '#c5c5c9', crop: [0, 138, 738, 1240] },
    { caption: 'Portraits and figure studies in blue ink.', paperColor: '#bcbcb7', crop: [0, 138, 738, 1160] },
    { caption: 'Pencil sketches of a character, a car, a cat and a hand.', paperColor: '#e2e2e2', crop: [0, 138, 738, 1240] },
    { caption: 'A bird, figures and expressive faces on ruled paper.', paperColor: '#c9c9c9', crop: [0, 138, 738, 1240] },
  ].map((drawing, index) => ({
    title: `My doodles / ${index + 1}`, subtitle: 'SKETCHBOOK', doodle: 'photo',
    image: `/images/notebook/doodles-${index + 1}.png`, ...drawing,
    text: drawing.caption, question: '', notes: [],
  })),
];
