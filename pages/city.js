import dynamic from 'next/dynamic';
import Head from 'next/head';
const CityStudio = dynamic(() => import('../components/workbench/CityStudio'), { ssr: false });

export default function CityPage() {
  return <>
    <Head><title>City workspace</title><meta name="robots" content="noindex" /></Head>
    <CityStudio />
  </>;
}
