// Draws the interactive SVG desk across the About Me timeline's historical states.
// It supplies object hotspots and BUILD / WORK imagery to AboutJourney.
import { ComputerDetails, NotebookDetails, ApplianceDetails, ChairDetails, PlantDetails, RadioDetails } from './PixelDeskDetails';
import { objectsAt, seasonAt } from './journeyTimeline.mjs';
import styles from '../../styles/AboutJourney.module.css';

function Presence({ visible, before, transitioning, delay = 0, replay = false, children }) {
  if (!visible && !(transitioning && before)) return null;
  const motion = transitioning && (visible !== before || (visible && replay)) ? (visible ? styles.itemIn : styles.itemOut) : undefined;
  return <g className={motion} style={{ '--drop-delay': `${Math.round(delay / 5)}ms` }}>{children}</g>;
}

function Weather({ season }) {
  const sky = { Winter: '#536c80', Spring: '#8cae9c', Monsoon: '#536c70', Autumn: '#bd9272', Night: '#101b30' }[season];
  return <><path fill={sky} d="M32 31h115v88H32z"/>
      {season !== 'Monsoon' && <path fill={season === 'Autumn' ? '#f1c58c' : '#d4d5ac'} d="M116 43h13v13h-13z"/>}
      <path fill={season === 'Night' ? '#29374b' : '#b0b8aa'} d="M42 49h24v5H37v5h40v-6H66v-7H48v3m42 25h24v5H85v5h40v-5h-11v-9H96v4"/>
      <path fill={season === 'Night' ? '#1a2939' : '#52645c'} d="M32 90h15V76h15v20h12V84h19v15h10V88h22V78h12v19h10v22H32z"/>
      <path fill={season === 'Night' ? '#142331' : '#344c49'} d="M32 106h22V94h17v25h8V99h20v20h13v-16h21v-9h14v25H32z"/>
      <path fill="#d6bc7e" d="M58 99h4v5h-4zm25 6h4v5h-4zm34 2h4v5h-4zm20-7h4v5h-4z"/>
      {season === 'Monsoon' && <path stroke="#98b2b3" strokeWidth="2" d="M40 40v7m22 19v9m19-35v8m24 9v8m24-28v9M39 79v8m47-10v8m48-11v8"/>}</>;
}

export default function PixelDeskScene({ month, previousMonth = month, transitioning = false, disabled = false, radioPlaying = false, ceilingOn = true, onSelect, objectRefs }) {
  const season = month >= 60 ? 'Night' : seasonAt(month), current = month >= 60, upgraded = month >= 50;
  return <div className={styles.sceneFrame}>
    <svg className={styles.art} viewBox="0 0 480 240" shapeRendering="crispEdges" role="img" aria-label={`${season} outside a pixel desk room. ${current ? 'A monitor and upliance fill the workspace. Height: 5 feet 6 inches.' : upgraded ? 'An upgraded monitor sits on the desk. Height: 5 feet 4 inches.' : 'A plain laptop and notebook sit on the desk. Height: 5 feet 2 inches.'}`}>
      <path fill="#40483a" d="M0 0h480v185H0z"/><path fill="#354033" d="M360 0h120v185H360z"/>
      <path fill="#30392f" d="M0 181h480v7H0z"/><path fill="#685340" d="M0 188h480v52H0z"/>
      <path stroke="#574836" strokeWidth="2" d="M0 207h480M0 229h480M62 188v19m114 0v22m-74 0v11m201-52v19m97 0v22m-69 0v11"/>
      {/* Six-foot chalk scale: floor at 180, six feet at 20. */}
      <g aria-hidden="true" opacity=".25" fill="#c2c2af" stroke="#c2c2af" shapeRendering="geometricPrecision" strokeLinecap="round">
        <path fill="none" strokeWidth=".65" strokeDasharray="2.5 1 .6 1.2" d="M472 20l.3 41-.5 39 .4 40-.2 40"/>
        {Array.from({length:13},(_,i)=><path key={i} opacity={i%2 ? .5 : .8} strokeWidth=".6" d={`M${i%2 ? 470 : 468} ${180-i*160/12}h${i%2 ? 2 : 4}`}/>)}
        <text x="469" y="17" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive">6′</text>
        <path fill="none" strokeWidth=".8" strokeDasharray="3 1 2 .6" d="M465 42.2l9-.3"/>
        <text x="464" y="46" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive" transform="rotate(-3 464 46)">5′2″</text>
        {month >= 48 && <><path fill="none" strokeWidth=".8" strokeDasharray="2 .6 3 1" d="M465 37.8l9 .2"/><text x="464" y="39" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive">5′4″</text></>}
        {current && <><path fill="none" strokeWidth=".8" strokeDasharray="3 .7 1 1" d="M465 33.3l9-.2"/><text x="464" y="32" textAnchor="end" stroke="none" fontSize="5" fontFamily="'Bradley Hand', cursive" transform="rotate(2 464 32)">5′6″</text></>}
      </g>
      <g transform="translate(36 0) scale(.8 1)">
      <path fill="#7d7153" d="M22 21h135v111H22z"/><path fill="#202f2e" d="M27 26h125v99H27z"/>{transitioning && (previousMonth >= 60 ? 'Night' : seasonAt(previousMonth)) !== season && <g className={styles.weatherOut}><Weather season={(previousMonth >= 60 ? 'Night' : seasonAt(previousMonth))}/></g>}
      <g key={season} className={transitioning && (previousMonth >= 60 ? 'Night' : seasonAt(previousMonth)) !== season ? styles.weatherIn : undefined}><Weather season={season}/></g>
      <path fill="#776b50" d="M87 27h5v97h-5zM27 78h125v5H27zM17 125h145v7H17z"/>
      </g>
      {current && ceilingOn && <path fill="#efd297" opacity=".07" d="M395 37h36l23 149h-82z"/>}
      <path fill="#b28b5e" d="M94 165h273v9H94z"/><path fill="#76533c" d="M98 174h265v10H98z"/><path fill="#302f28" d="M103 184h9v43h-9zm245 0h9v43h-9z"/>
      {[false, true].map(left => <Presence key={String(left)} visible={current === left} before={(previousMonth >= 60) === left} transitioning={transitioning}>
        <g transform={left ? 'translate(-205 0)' : undefined}>
          <path fill="#8f6846" d="M313 184h35v28h-35z"/><path fill="#c0a277" d="M325 194h10v3h-10z"/>
          <path stroke="#936d4b" strokeWidth=".7" fill="none" d="M316 186h29v23h-29zM325 199h10"/>
          <path fill="#c6a779" d="M324 194h11v1h-11z"/>
        </g>
      </Presence>)}
      <path fill="#d1a875" d="M96 166h269v1H96z"/>
      <path stroke="#936d4b" strokeWidth=".7" fill="none" d="M100 170h32m60 0h20m98 0h51"/>
      {/* Notebook, drawn as two stepped paper blocks. */}
      <path fill="#d7cba4" d="M142 155h20v-2h5v2h20v17h-45z"/><path stroke="#8c8969" d="M164 155v16m-17-10h12m10 0h12m-34 5h12m10 0h12"/>
      <NotebookDetails/>
      <Presence visible={upgraded} before={previousMonth >= 50} transitioning={transitioning} delay={450}><path fill="#202d2c" d="M215 92h91v63h-91z"/><path fill="#6c8378" d="M220 97h81v51h-81z"/><path fill="#263c38" d="M224 101h73v43h-73z"/><path fill="#677366" d="M254 155h13v9h14v4h-42v-4h15z"/><path fill="#c4b59a" d="M218 170h79v5h-79z"/><path fill="#91b4a0" d="M232 110h16v3h-16zm0 7h38v3h-38zm0 7h27v3h-27z"/><ComputerDetails/></Presence><Presence visible={!upgraded} before={previousMonth < 50} transitioning={transitioning} delay={450}><path fill="#272e2d" d="M222 117h75v44h-75z"/><path fill="#92a99b" d="M227 122h65v34h-65z"/><path fill="#3f5b50" d="M232 130h22v3h-22zm0 8h42v3h-42z"/><path fill="#b0aea0" d="M216 161h87v7h-87z"/><path fill="#616e63" d="M247 162h24v3h-24z"/><ComputerDetails laptop/></Presence>
      <Presence visible={month >= 48} before={previousMonth >= 48} transitioning={transitioning} delay={100}>
        <path fill="#25382f" d="M313 94h57v69h-57z"/><path fill="#7e8c6c" d="M313 94h57v2h-57zM313 94h2v69h-2z"/>
        <text x="319" y="103" fill="#bbc5a5" fontSize="4" fontFamily="MascotPixel, monospace">BUILD / WORK</text>
        <path fill="#d9d7c6" d="M318 108h20v20h-20zM344 108h20v20h-20z"/>
        <image href="/images/journey/github.svg" x="320" y="110" width="16" height="16"/>
        <image href="/images/journey/leetcode.svg" x="346" y="110" width="16" height="16"/>
        <path fill="#a6b494" d="M318 135h20v24h-20z"/>
        <image href="/images/journey/cribble.png" x="319" y="136" width="18" height="18"/>
        <path fill="#647e64" d="M321 156h14v1h-14z"/>
      </Presence>
      <Presence visible={upgraded} before={previousMonth >= 50} transitioning={transitioning} delay={300}>
        <path fill="#bb957d" d="M344 135h20v24h-20z"/>
        <image href="/images/journey/office-solutions.png" x="345" y="136" width="18" height="18"/>
        <path fill="#917259" d="M347 156h14v1h-14z"/>
      </Presence>

      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={250}>
        <path fill="#9c8156" d="M382 186h65v7h-65z"/><path fill="#35372d" d="M388 193h6v32h-6zm46 0h6v32h-6z"/>
        <path fill="#c4c5ad" d="M393 154h43v29h-43z"/><path fill="#979e8c" d="M390 174h49v9h-49z"/><path fill="#a3b4ac" d="M399 130h27v25h-27z"/><path fill="#d8d6bd" d="M397 126h31v6h-31z"/><path fill="#2d3935" d="M400 123h26v4h-26zm5 38h21v13h-21z"/><path fill="#78a6a2" d="M408 164h15v6h-15z"/><path fill="#677d73" d="M427 134h8v17h-8v-4h4v-9h-4z"/><ApplianceDetails/>
      </Presence>
      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={350}><g transform="translate(-7 -68)">
        <path fill="#d8be79" d="M320 103h16v19h-16z"/><path fill="#b2bd94" d="M340 106h16v18h-16z"/><path stroke="#847956" d="M323 109h10m-10 4h7m13 0h10m-10 4h7"/>
      </g></Presence>
      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={100}><g transform="translate(-42 -114) scale(1.6 2)">
        <path fill="#778651" d="M54 140h9v-16h7v16h8v-9h7v16H58v-7z"/><path fill="#a77551" d="M58 148h25v18H58z"/><PlantDetails/>
      </g></Presence>



      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={80}><g transform="translate(154 0)">
        <path fill="#252d29" d="M258 0h3v23h-3z"/><path fill="#b9a275" d="M244 22h31v5h-31zm-8 5h47v7h-47z"/><path fill={ceilingOn ? '#e7ce8c' : '#686d55'} d="M240 34h39v3h-39z"/><path fill="#d6bc86" d="M246 23h27v1h-27zM239 28h41v2h-41z"/><path fill="#6e6548" d="M238 32h43v1h-43z"/>
      </g></Presence>
      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={200}><g transform="translate(-235.4 20) scale(.62)">
        <path fill="#bda981" d="M391 29h54v40h-54z"/><path fill="#e1d3b2" d="M395 33h46v32h-46z"/><path fill="none" stroke="#a75c3f" strokeWidth="2" d="M409 47h18v14h-18zM403 65h31"/>
        <path fill="none" stroke="#c5c1a5" strokeWidth="1.5" d="M405 68l4 17h19l4-17m-22 0l4 17m12-17l-4 17m-15-11h24m-22 6h20"/>
      </g></Presence>

      <Presence visible={current} before={previousMonth >= 60} transitioning={transitioning} delay={320}><g transform="translate(72 -15)">
        <path fill="#b29a70" d="M29 164h40v16H29z"/><path fill="#343e32" d="M33 167h18v9H33z"/><path fill="#d0c09a" d="M56 167h7v7h-7z"/><path fill={radioPlaying ? '#a5cf80' : '#5a6249'} d="M64 176h3v2h-3z"/><path stroke="#a7a68a" d="M35 169h14m-14 3h14M61 164v-18"/><RadioDetails/>

      </g></Presence>
      <Presence visible={month < 48} before={previousMonth < 48} transitioning={transitioning}>
        <path fill="#5b412e" d="M241 187h5v44h-5zm29 0h5v44h-5z"/>
        <path fill="#a78256" d="M239 186h38v5h-38zm0 10h38v4h-38zm-2 13h42v6h-42z"/>
        <path fill="#d0ac75" d="M240 187h35v1h-35zm-1 23h38v1h-38z"/>
        <path fill="#72513a" d="M244 224h28v3h-28z"/>
      </Presence><Presence visible={month >= 48} before={previousMonth >= 48} transitioning={transitioning}>
      <path fill="#293b35" d="M231 190h52v27h-52z"/><path fill="#4f6250" d="M228 187h58v24h-58z"/><path fill="#27362f" d="M253 213h8v19h-8zm-20 18h48v4h-48z"/>
      <ChairDetails/>
      </Presence>
    </svg>
    {objectsAt(month).map(object => <button key={object.id} ref={node => { objectRefs.current[object.id] = node; }} className={styles.hotspot} disabled={transitioning || disabled} aria-label={object.id === 'radio' ? `Radio · ${radioPlaying ? 'turn music off' : 'play music'}` : object.id === 'ceiling' ? `Ceiling light · turn ${ceilingOn ? 'off' : 'on'}` : `Explore ${object.label}`} aria-pressed={object.id === 'radio' ? radioPlaying : object.id === 'ceiling' ? ceilingOn : undefined} title={object.label} onClick={() => onSelect(object.id)} style={{ left: `${object.box[0] / 4.8}%`, top: `${object.box[1] / 2.4}%`, width: `${object.box[2] / 4.8}%`, height: `${object.box[3] / 2.4}%` }}><span>{object.label}</span></button>)}
  </div>;
}
