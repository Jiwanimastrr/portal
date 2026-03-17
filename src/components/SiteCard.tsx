export interface SiteInfo {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  tag: string;
}

interface SiteCardProps {
  site: SiteInfo;
}

export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  return (
    <a href={site.url} className="site-card" target="_blank" rel="noopener noreferrer">
      <div className="site-card-image-wrap">
        <img src={site.imageUrl} alt={site.title} className="site-card-image" />
      </div>
      <div className="site-card-content">
        <h3 className="site-card-title">{site.title}</h3>
        <p className="site-card-desc">{site.description}</p>
        <div className="site-card-footer">
          <span className="site-tag">{site.tag}</span>
          <span className="site-arrow">➔</span>
        </div>
      </div>
    </a>
  );
};
