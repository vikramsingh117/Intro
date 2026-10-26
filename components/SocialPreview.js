import Head from 'next/head';

const ORIGIN = 'https://vikram-singh.vercel.app';
const IMAGE = `${ORIGIN}/images/portfolio-social.png`;

export default function SocialPreview({ title, description, path = '/' }) {
  return <Head>
    <link rel="canonical" href={`${ORIGIN}${path}`} key="canonical" />
    <meta property="og:type" content="website" key="og:type" />
    <meta property="og:site_name" content="Vikram Singh" key="og:site_name" />
    <meta property="og:title" content={title} key="og:title" />
    <meta property="og:description" content={description} key="og:description" />
    <meta property="og:url" content={`${ORIGIN}${path}`} key="og:url" />
    <meta property="og:image" content={IMAGE} key="og:image" />
    <meta property="og:image:type" content="image/png" key="og:image:type" />
    <meta property="og:image:width" content="2864" key="og:image:width" />
    <meta property="og:image:height" content="1508" key="og:image:height" />
    <meta property="og:image:alt" content="Vikram’s cozy interactive workspace, with a monitor, notebook, city window, and upliance appliance." key="og:image:alt" />
    <meta name="twitter:card" content="summary_large_image" key="twitter:card" />
    <meta name="twitter:title" content={title} key="twitter:title" />
    <meta name="twitter:description" content={description} key="twitter:description" />
    <meta name="twitter:image" content={IMAGE} key="twitter:image" />
    <meta name="twitter:image:alt" content="Vikram’s cozy interactive workspace." key="twitter:image:alt" />
  </Head>;
}
