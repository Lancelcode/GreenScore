/* eslint-disable @next/next/no-img-element -- local logos shown at their natural size */
import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Green Partnerships',
  description: 'GreenScore partners with leading sustainability organisations including the UN, WWF, Greenpeace and more.',
};

const logos: Array<[string, string]> = [
  ['un', 'United Nations'],
  ['greenpeace', 'Greenpeace'],
  ['defra', 'Department for Environment, Food & Rural Affairs'],
  ['wwf', 'WWF'],
  ['ukgov', 'UK Government'],
  ['oxfam', 'Oxfam'],
  ['edincol', 'Edinburgh College'],
];

const supporters: Array<[string, string, string]> = [
  ['🌍', 'https://www.un.org/', 'United Nations (UN)'],
  ['🌿', 'https://www.greenpeace.org/', 'Greenpeace'],
  ['🌳', 'https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs', 'DEFRA'],
  ['🐼', 'https://www.worldwildlife.org/', 'WWF'],
  ['🇬🇧', 'https://www.gov.uk/government/topical-events/the-uks-green-industrial-revolution', 'UK Government Initiatives'],
  ['🤝', 'https://www.oxfam.org/', 'Oxfam'],
  ['🎓', 'https://www.edinburghcollege.ac.uk/', 'Edinburgh College Sustainability Hub'],
];

export default function PartnersPage() {
  return (
    <PageShell className="page-partners">
      <div className="container content-wrapper text-center">
        <h1 className="text-white display-4 mb-4">🌍 GreenScore Partnerships</h1>
        <p className="text-white fs-5 mb-5">We collaborate with some of the most trusted eco-leaders and institutions around the world.</p>

        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-4 justify-content-center logo-grid mb-5">
          {logos.map(([file, name]) => (
            <div className="col" key={file}>
              <img src={`/assets/images/logos/${file}.png`} className="img-fluid p-2 bg-white shadow-sm rounded" alt={`${name} logo`} />
            </div>
          ))}
        </div>

        <div className="card card-bg shadow-sm p-4" style={{ color: '#333' }}>
          <h2 className="mb-3 text-success">Why Partner With GreenScore?</h2>
          <p className="lead mb-3">
            We are building a cleaner future, together. Every logo above represents a verified sustainability effort and
            a shared mission to reduce carbon emissions globally.
          </p>
          <div className="mt-4 text-start">
            <h3 className="text-success mb-3">Our Supporters:</h3>
            <ul className="list-group list-group-flush">
              {supporters.map(([emoji, href, name]) => (
                <li className="list-group-item" key={href}>
                  {emoji}{' '}
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
