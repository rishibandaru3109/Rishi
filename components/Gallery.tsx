"use client";

import { projects } from "@/data/site";
import ProjectDemo from "./ProjectDemo";
import { ProjectArt } from "./VisualEffects";

const phases = {
  stereo: ["Track search", "Mini player", "Background playback"],
  "viral-machine": ["Idea", "Script", "Media", "Render", "Review", "Publish"],
  airupi: ["Offline exchange", "Local check", "Later sync"],
};

export default function Gallery() {
  return <section id="projects" className="project-worlds" aria-labelledby="projects-title">
    <h2 className="sr-only" id="projects-title">Selected projects</h2>
    {projects.map(project => {
      const id = project.id as keyof typeof phases;
      return <article id={id} className={`project-world ${id}`} key={id}>
        <div className="project-reel" data-scroll-scene data-pinned>
          <div className="project-stage">
            <div className="project-light" aria-hidden="true" />
            <div className="project-props" aria-hidden="true"><i /><i /><i /></div>
            <a className="project-portal" href={`#${id}-details`} aria-label={`Explore ${project.name}`}
              onPointerMove={event => {
                if (event.pointerType !== "mouse") return;
                const bounds = event.currentTarget.parentElement!.getBoundingClientRect();
                event.currentTarget.style.setProperty("--tilt-x", `${((event.clientX - bounds.left) / bounds.width - .5) * 13}deg`);
                event.currentTarget.style.setProperty("--tilt-y", `${(event.clientY - bounds.top) / bounds.height * -12 + 6}deg`);
              }}
              onPointerLeave={event => {
                event.currentTarget.style.removeProperty("--tilt-x");
                event.currentTarget.style.removeProperty("--tilt-y");
              }}>
              <div className="cover"><ProjectArt src={project.art} alt={`${project.name} conceptual artwork`} /></div>
            </a>
            <div className="project-caption">
              <small>{project.category}</small>
              <h3>{project.name}</h3>
              <a className="world-link" href={`#${id}-details`}>Explore project <span aria-hidden="true">↓</span></a>
            </div>
            <div className="project-phases" aria-hidden="true">
              {phases[id].map((phase, index, all) =>
                <span key={phase} style={{ "--phase": index / all.length } as React.CSSProperties}>{phase}</span>)}
            </div>
          </div>
        </div>
        <section className="project-details section" id={`${id}-details`} aria-label={`${project.name} project details`}>
          <div className="world-copy">
            <p className="world-lead">{project.concept}</p>
            <details>
              <summary>Project details</summary>
              <h4>My role</h4><p>{project.role}</p>
              <h4>Implemented features</h4><ul>{project.features.map(item => <li key={item}>{item}</li>)}</ul>
              <h4>Project technologies</h4><div className="pills">{project.tech.map(item => <span key={item}>{item}</span>)}</div>
              <h4>Current limits</h4><p>{project.limit}</p>
            </details>
            {project.repo && <a href={project.repo} className="world-link">Project repository ↗</a>}
          </div>
          <ProjectDemo id={id} />
        </section>
      </article>;
    })}
  </section>;
}
