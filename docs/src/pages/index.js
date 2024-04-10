import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

const FrameworkList = [
  {
    image: "/img/logos/panel.png",
    title: "Panel",
    description: (
      <>
        Powerful data exploration & web app framework for Python
      </>
    ),
  },
  {
    image: "/img/logos/bokeh.png",
    title: "Bokeh",
    description: (
      <>
        Python library for creating interactive visualizations for modern web browsers
      </>
    ),
  },
  {
    image: "/img/logos/streamlit.png",
    title: "Streamlit",
    description: (
      <>
        Python framework for data scientists and AI/ML engineers
        to deliver dynamic data apps with only a few lines of code
      </>
    ),
  },
  {
    image: "/img/logos/plotly-dash.png",
    title: "Plotly Dash",
    description: (
      <>
        Low-code framework for rapidly building data apps in Python
      </>
    ),
  },
  {
    image: "/img/logos/voila.png",
    title: "Voila",
    description: (
      <>
        Convert a Jupyter Notebook into an interactive dashboard
      </>
    ),
  },
  {
    image: "/img/logos/gradio.png",
    title: "Gradio",
    description: (
      <>
        Quickly build a demo or web application
        for your machine learning model, API, or any Python function
      </>
    ),
  },
  {
    image: "/img/logos/jupyter.png",
    title: "JupyterLab",
    description: (
      <>
        Highly extensible, feature-rich notebook authoring application and editing environment
      </>
    ),
  },
  {
    image: "/img/logos/custom.png",
    title: "Generic Python Command",
    description: (
      <>
        Python Server, Flask API, and more!
      </>
    ),
  },
];


function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

function Framework({ image, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center padding--md">
        <img
          alt={`${title} logo`}
          src={image}
        />
        {/* <h3>{title}</h3> */}
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFrameworks() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <section className={clsx(styles.framework, "hero hero--secondary")}>
      <div className="container">
        <h2 className="text--center padding--md">
          Supported frameworks
        </h2>
        <div className="row">
          {FrameworkList.map((props, idx) => (
            <Framework key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="JupyterHub Apps Launcher">
      <HomepageHeader />
      <main>
        <HomepageFrameworks />
      </main>
    </Layout>
  );
}
