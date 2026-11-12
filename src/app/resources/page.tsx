import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Green Resources',
  description: 'Sustainability guides, tools and resources to help your organisation go green.',
};

const groups: Array<{ title: string; links: Array<[string, string, string]> }> = [
  {
    title: '🌍 United Nations SDG Resources',
    links: [
      ['fa-leaf', 'https://sdgs.un.org/goals', 'UN Sustainable Development Goals'],
      ['fa-globe', 'https://www.globalgoals.org/', 'The Global Goals Overview'],
      [
        'fa-file-pdf',
        'https://sdgs.un.org/sites/default/files/publications/21252030%20Agenda%20for%20Sustainable%20Development%20web.pdf',
        'SDG Agenda 2030 (PDF)',
      ],
    ],
  },
  {
    title: '📁 Downloadable Guides',
    links: [
      ['fa-book', '/assets/documents/green_tips_guide.pdf', 'Green Living Tips Guide (PDF)'],
      ['fa-list-check', '/assets/documents/carbon_reduction_checklist.pdf', 'Carbon Reduction Checklist (PDF)'],
    ],
  },
  {
    title: '🧠 Educational & Research Platforms',
    links: [
      ['fa-recycle', 'https://www.epa.gov/sustainability', 'EPA: Learn About Sustainability'],
      ['fa-satellite', 'https://climate.nasa.gov/', 'NASA Climate Data'],
      ['fa-flask', 'https://www.carbontrust.com/resources', 'Carbon Trust Resource Hub'],
    ],
  },
  {
    title: '🏛️ Government & NGO Initiatives',
    links: [
      ['fa-flag', 'https://www.gov.uk/government/publications/net-zero-strategy', 'UK Gov: Net Zero Strategy'],
      ['fa-globe-europe', 'https://climate.ec.europa.eu/', 'EU Climate Action'],
      ['fa-paw', 'https://footprint.wwf.org.uk/', 'WWF Carbon Footprint Guide'],
    ],
  },
];

export default function ResourcesPage() {
  return (
    <PageShell className="page-resources">
      <div className="container content-wrapper">
        <h1 className="text-white text-center mb-5">📚 Green Resources</h1>
        <div className="row gy-4">
          {groups.map((group) => (
            <div className="col-md-6" key={group.title}>
              <div className="resource-card h-100">
                <h2 className="h3 resource-title">{group.title}</h2>
                {group.links.map(([icon, href, label]) => (
                  <a className="resource-link" href={href} target="_blank" rel="noopener noreferrer" key={href}>
                    <i className={`fas ${icon}`} aria-hidden="true" /> {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
