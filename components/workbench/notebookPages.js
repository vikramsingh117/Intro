// Defines year-specific scratch-work and sketchbook content painted into the physical room notebook.
// Every year keeps eight pages and the shared tear/doodle tail at identical indices so saved state remains compatible.
const CURRENT_SCRATCH_PAGES=[
  {
    title:'upliance / bits to check',subtitle:'SCRATCH WORK',doodle:'loop',
    text:'Rough notes on diet changes, pruning incompatible allergens, unset versus saved preferences, restoring scroll after rendering, and device-aware recipe filtering.',
    question:'',
    notes:['Chat sketch: show Generate recipe only when the backend action exists.','Archived session: hide input. Otherwise show allowed actions.','Test empty state.'],
    caption:'Crossed-out ideas, a quick chat wireframe, conditional pseudocode and a small paper-plane doodle.',
  },
  {
    title:'fib / rough',subtitle:'SCRATCH WORK',doodle:'recursion',
    text:'Fibonacci scratch work: f(4) = f(3) + f(2) = 2 + 1 = 3. A table of values from n = 0 to 7, crossed-out complexity, and a small lc ~600 margin note.',
    question:'',
    notes:['memo = {}','fib(n): if n <= 1, return n; if n is in memo, return memo[n]. Otherwise memo[n] = fib(n-1) + fib(n-2); return memo[n].'],
    caption:'A loosely drawn recursion tree with repeated f(2) calls circled, pseudocode underneath, and an unrelated little cat doodle.',
  },
  {
    title:'harness? / reading notes',subtitle:'SCRATCH WORK',doodle:'harness',
    text:'Agent-harness learning notes: model, tools, loop, state and limits. Context might include instructions, task and tool results; question marks around history and summarization.',
    question:'',
    notes:['Loop sketch: while budget remains, call the model; stop if done; check tool permission; run the tool; append results and save the trace.','Cap retries and record errors.','Todo: try a tiny evaluation. Timeout, bad arguments, denied permission.'],
    caption:'Loose arrows, crossed-out assumptions, pseudocode and a tiny ringed-planet doodle. Learning scratch work, not a shipped implementation.',
  },
];

const YEAR_SCRATCH_PAGES={
  '2021':[
    {
      title:'before the first semester',subtitle:'MUMBAI → CHENNAI / 2021',doodle:'education',
      text:'10th at SNPS School and 12th at MNR College in Mumbai, followed by JEE and VITEEE before starting Computer Science at VIT Chennai.',
      question:'',
      notes:['VITEEE: AIR under 10,000.','A new chapter: B.Tech Computer Science at VIT Chennai.'],
      caption:'School-to-college arrows, a circled entrance rank, trophy, certificate and star doodles from the 2021 field-notes spread.',
    },
    {
      title:'pokemon modding / side quest',subtitle:'IDEAS · SKETCHES · 2021',doodle:'pokemon',
      text:'Games were something to explore, not only something to play. Active in Pokémon modding in 2021 and curious about changing the game itself.',
      question:'What if I could change the game myself?',
      notes:['Creature sketch + Pokéball study.','Handheld screen, direction pad and a tiny map path.'],
      caption:'An abstract creature, Pokéball, handheld console and star copied from the 2021 illustrated notebook language.',
    },
    {
      title:'map → new idea',subtitle:'FIRST EXPERIMENTS',doodle:'first-builds',
      text:'Small maps, patches and experiments turned playing into making. Follow an idea, change one thing, test it, then try another route.',
      question:'',
      notes:['[ map ] → [ new idea ]','explore → change → test','keep the weird side quests'],
      caption:'A rough map grid, branching route, patch notes and small spark marks extend the 2021 side-quest doodles.',
    },
  ],
  '2025':[
    {
      title:'four years later',subtitle:'VIT CHENNAI / 2025',doodle:'graduation',
      text:'B.Tech in Computer Science at VIT Chennai, 2021–2025. Graduated with an 8.4/10 CGPA and placed first on campus in Google Hash Code among 50+ teams.',
      question:'',
      notes:['CGPA 8.4 / 10','Google Hash Code: campus #1','50+ teams'],
      caption:'Graduation cap, trophy, certificate and score marks reflect the achievement doodles in the 2025 spread.',
    },
    {
      title:'practice → build → repeat',subtitle:'PROBLEMS · CODE · SYSTEMS',doodle:'systems',
      text:'LeetCode practice, Linux commands and Git workflows beside a client-to-service-to-storage architecture sketch.',
      question:'',
      notes:['LeetCode: two pointers / graphs','Linux: ps · grep · shell','GitHub: branch → commit → merge','Spring Boot · Redis · SQL · Go · MongoDB · Git'],
      caption:'Client, service and storage blocks with terminal marks, database layers and edge-case arrows mirror the 2025 systems doodle.',
    },
    {
      title:'20+ projects / shipped',subtitle:'BUILD LOG / 2025',doodle:'projects',
      text:'More than twenty Vercel projects by 2025, including the evolving portfolio, a Go web crawler and the path from Cribble to Office Solutions.',
      question:'',
      notes:['portfolio → keep iterating','Go crawler → MongoDB Atlas','Cribble → Office Solutions','check the edge cases'],
      caption:'Deployment boxes, a crawler path, commit branches and a compact project stack continue the 2025 build notes.',
    },
  ],
  '2026':CURRENT_SCRATCH_PAGES,
};

const TEAR_PAGE={
  title:'Tear this page by dragging it',subtitle:'MAKE SOMETHING OF IT',doodle:'tear',
  text:'Tear this page by dragging it. Keep tearing to collect paper balls, then go back to the desk to flick them one after another.',
  question:'',notes:[],caption:'My doodle pages follow. Take as many as you like.',
};

const DOODLE_PAGES=[
  {caption:'Cats, music, little characters and pen sketches.',paperColor:'#c5c5c9',crop:[0,138,738,1240]},
  {caption:'Portraits and figure studies in blue ink.',paperColor:'#bcbcb7',crop:[0,138,738,1160]},
  {caption:'Pencil sketches of a character, a car, a cat and a hand.',paperColor:'#e2e2e2',crop:[0,138,738,1240]},
  {caption:'A bird, figures and expressive faces on ruled paper.',paperColor:'#c9c9c9',crop:[0,138,738,1240]},
].map((drawing,index)=>({
  title:`My doodles / ${index+1}`,subtitle:'SKETCHBOOK',doodle:'photo',
  image:`/images/notebook/doodles-${index+1}.png`,...drawing,
  text:drawing.caption,question:'',notes:[],
}));

const SHARED_TAIL=[TEAR_PAGE,...DOODLE_PAGES];

export const NOTEBOOK_PAGES_BY_YEAR=Object.fromEntries(
  Object.entries(YEAR_SCRATCH_PAGES).map(([year,pages])=>[year,[...pages,...SHARED_TAIL]])
);

export const NOTEBOOK_PAGES=NOTEBOOK_PAGES_BY_YEAR['2026'];
export const notebookPagesForYear=year=>NOTEBOOK_PAGES_BY_YEAR[year]||NOTEBOOK_PAGES;
