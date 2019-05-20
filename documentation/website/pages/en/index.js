/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/chart.gif`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={docUrl('about')}>Introduction</Button>
            <Button href={docUrl('installation')}>Get Started</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = (doc, hash) => `${baseUrl}${docsPart}${langPart}${doc}${hash ? `#${hash}` : ''}`;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const LearnHow = () => (
      <Block background="light">
        {[
          {
            content:
              'Each new Docusaurus project has **randomly-generated** theme colors.',
            image: `${baseUrl}img/undraw_youtube_tutorial.svg`,
            imageAlign: 'right',
            title: 'Randomly Generated Theme Colors',
          },
        ]}
      </Block>
    );

    const MainFeatures = () => (
      <Block layout="threeColumn" background="light">
        {[
          {
            content: 'Via Google OAuth',
            image: `${baseUrl}img/undraw_team.svg`,
            imageAlign: 'top',
            title: 'Multi-user web app',
          },
          {
            content: `<a href="${docUrl('about', 'organize')}">Organize</a> your notebooks in folders`,
            image: `${baseUrl}img/undraw_folder.svg`,
            imageAlign: 'top',
            title: 'Organize queries',
          },
          {
            content: `<a href="${docUrl('about', 'execute')}">Harness</a> the power of <a href="https://github.com/prestosql/presto" target="_blank">Presto</a>`,
            image: `${baseUrl}img/undraw_media_player.svg`,
            imageAlign: 'top',
            title: 'Execute queries',
          },
        ]}
      </Block>
    );

    const MoreFeatures = () => (
      <Block layout="fourColumn">
        {[
          {
            content: `Use the DB tree to <a href="${docUrl('about', 'explore')}">explore</a> your data sources`,
            image: `${baseUrl}img/undraw_server_status.svg`,
            imageAlign: 'top',
            title: 'Explore',
          },
          {
            content: `Quickly <a href="${docUrl('about', 'visualize')}">plot</a> time and bar series <br> (more visualizations to follow)`,
            image: `${baseUrl}img/undraw_visual_data.svg`,
            imageAlign: 'top',
            title: 'Visualize',
          },
          {
            content: 'Search queries accross all users',
            image: `${baseUrl}img/undraw_search.svg`,
            imageAlign: 'top',
            title: 'Search',
          },
          {
            content: 'Share folders, notebooks and notes',
            image: `${baseUrl}img/undraw_live_collaboration.svg`,
            imageAlign: 'top',
            title: 'Share',
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who is Using This?</h2>
          <p>This project is used by all these people</p>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl('users.html')}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <MainFeatures />
          <MoreFeatures />
        </div>
      </div>
    );
  }
}

module.exports = Index;
