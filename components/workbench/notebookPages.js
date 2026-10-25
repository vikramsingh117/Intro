export const NOTEBOOK_PAGES = [
  {
    title: 'frodo / bits to check', subtitle: 'SCRATCH WORK', doodle: 'loop',
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
];
