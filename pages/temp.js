// Hosts the noindex temporary three-year exterior editor used to collect final view settings.
import dynamic from 'next/dynamic';
import Head from 'next/head';

const TempCityStudio=dynamic(()=>import('../components/workbench/TempCityStudio'),{ssr:false});

export default function TempPage() {
  return <>
    <Head><title>Three-year city editor</title><meta name="robots" content="noindex"/></Head>
    <TempCityStudio/>
  </>;
}
