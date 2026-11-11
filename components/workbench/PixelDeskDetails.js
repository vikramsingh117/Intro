// Small, grid-aligned highlights, seams and surface details for the desk artwork.
export function ComputerDetails({ laptop = false }) {
  if (laptop) return <g>
    <path fill="#c2c9b5" d="M224 119h71v1h-71zM218 162h82v1h-82z"/>
    <path fill="#46534b" d="M258 119h3v1h-3zM224 164h66v1h-66z"/>
    <path fill="#d6debb" d="M229 124h61v3h-61z"/><path fill="#667e67" d="M230 128h12v25h-12z"/>
    <path fill="#d3dac2" d="M246 130h31v2h-31zm0 5h42v1h-42zm0 4h35v1h-35zm0 4h39v1h-39zm0 5h18v3h-18z"/>
    <path fill="#adb99d" d="M232 131h7v1h-7zm0 4h5v1h-5zm0 4h7v1h-7z"/>
    {Array.from({length:13},(_,i)=><path key={i} fill="#4c5952" d={`M${225+i*5} 162h3v1h-3z`}/>)}
    <path fill="#cbcbbb" d="M251 165h15v2h-15z"/>
  </g>;
  return <g>
    <path fill="#88988a" d="M217 94h87v1h-87zM218 96h1v54h-1z"/><path fill="#101f1c" d="M217 151h87v2h-87z"/>
    <path fill="#b8c895" d="M293 151h3v1h-3z"/><path fill="#435a50" d="M225 102h71v5h-71z"/>
    <path fill="#c3b88b" d="M228 104h2v1h-2zm4 0h2v1h-2zm4 0h2v1h-2z"/>
    <path fill="#334e44" d="M225 108h12v34h-12z"/><path fill="#6d8d78" d="M228 112h6v1h-6zm0 5h5v1h-5zm0 5h7v1h-7zm0 5h5v1h-5z"/>
    <path fill="#8ea88d" d="M241 111h24v2h-24zm0 6h44v1h-44zm0 4h33v1h-33zm0 4h40v1h-40z"/>
    <path fill="#b0a575" d="M241 131h19v8h-19z"/><path fill="#5d8573" d="M263 131h29v8h-29z"/>
    <path fill="#a1b89a" d="M266 134h14v1h-14zm0 2h22v1h-22z"/>
    <path fill="#899382" d="M256 156h2v7h-2zM240 166h39v1h-39z"/>
    {Array.from({length:2},(_,row)=>Array.from({length:15},(_,col)=><rect key={`${row}-${col}`} x={221+col*4.8} y={171+row*1.5} width="3.5" height="1" fill="#667264"/>))}
  </g>;
}

export function NotebookDetails() {
  return <g>
    <path fill="#746744" d="M141 172h47v2h-47z"/><path fill="#efe2b9" d="M144 155h17v1h-17zm23 0h18v1h-18zM144 170h17v1h-17zm23 0h18v1h-18z"/>
    <path stroke="#5f6750" strokeWidth=".6" fill="none" d="M146 158h9m-9 3h13m-13 3h9m13-6h12m-12 3h8m-8 3h13M164 156l1 14"/>
    <path fill="#b47754" d="M178 168h2v9h-2z"/><path fill="#d5ad63" d="M190 154h2v15h-2z"/><path fill="#514e3c" d="M190 169h2l-1 3z"/>
  </g>;
}

export function ApplianceDetails() {
  return <g>
    <path fill="#e4e3cb" d="M395 155h2v17h-2zM400 132h3v19h-3zM399 128h27v1h-27z"/>
    <path fill="#788e85" d="M420 132h4v20h-4zM402 151h20v2h-20z"/>
    <path fill="#b4c8bb" d="M405 135h1v12h-1zm3 0h1v9h-1z"/>
    <path fill="#4d655c" d="M395 178h40v2h-40zM397 183h6v2h-6zm29 0h6v2h-6z"/>
    <path fill="#c7e0cf" d="M409 165h11v1h-11zM409 168h6v1h-6z"/><path fill="#e4d3a3" d="M428 162h3v3h-3z"/>
    <path fill="#b6bda6" d="M397 157h33v1h-33z"/>
    <path stroke="#6d563d" strokeWidth="1" d="M386 188h56m-49 14h42M390 193v28m46-28v28"/>
  </g>;
}

export function ChairDetails() {
  return <g>
    <path fill="#71856a" d="M231 189h52v2h-52zM231 191h2v16h-2z"/>
    <path fill="#374e3e" d="M236 194h42v1h-42zm0 6h42v1h-42zm0 6h42v1h-42z"/>
    <path fill="#1d2d25" d="M224 199h4v17h8v3h-12zm62 0h4v20h-12v-3h8zM251 218h12v3h-12z"/>
    <path fill="#52664e" d="M234 213h47v2h-47zM255 222h3v8h-3z"/>
    <path fill="#15241e" d="M231 233h7v4h-7zm45 0h7v4h-7z"/>
  </g>;
}

export function PlantDetails() {
  return <g>
    <path fill="#a3b575" d="M58 132h3v9h-3zm9-7h2v17h-2zm12 8h3v9h-3z"/>
    <path fill="#516c40" d="M63 138h2v10h-2zm9-6h3v16h-3z"/>
    <path fill="#c2986c" d="M58 148h25v3H58zM61 153h2v10h-2z"/>
    <path fill="#7a543e" d="M61 164h19v2H61z"/>
  </g>;
}

export function RadioDetails() {
  return <g>
    <path fill="#d4bc8e" d="M30 165h37v1H30zM30 166h1v11h-1z"/>
    {Array.from({length:3},(_,r)=>Array.from({length:8},(_,c)=><rect key={`${r}-${c}`} x={34+c*2} y={168+r*3} width="1" height="1" fill="#83917b"/>))}
    <path fill="#ead8b1" d="M57 168h4v1h-4z"/><path fill="#6d725c" d="M59 169h1v3h-1z"/>
    <path fill="#795d41" d="M53 166h1v11h-1zM32 179h5v2h-5zm29 0h5v2h-5z"/>
  </g>;
}
