import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Gallery from "@/components/Gallery";
import Playground from "@/components/Playground";
import Contact from "@/components/Contact";
import ScrollExperience from "@/components/ScrollExperience";
import { person } from "@/data/site";

export default function Home() {
  return <>
    <Nav />
    <ScrollExperience>
      <Hero />
      <Gallery />
      <section className="section about" id="about" data-scroll-scene>
        <div>
          <h2 className="split-heading"><span>Still learning.</span><span><em>Still building.</em></span></h2>
          <p>I'm Rishi, a first-year B.Tech student. {person.about}</p>
          <small>Languages I know</small>
          <div className="pills">{person.languages.map(language => <span key={language}>{language}</span>)}</div>
        </div>
        <div className="map">
          <small>What I'm exploring</small>
          {person.interests.map(interest => <div key={interest}>{interest}</div>)}
        </div>
      </section>
      <Playground />
      <Contact />
    </ScrollExperience>
  </>;
}
