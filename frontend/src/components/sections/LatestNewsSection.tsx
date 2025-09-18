import { NewsHeadline } from '../../services/api';
import HeadlineItem from '../HeadlineItem';

interface LatestNewsSectionProps {
  headlines: NewsHeadline[];
  maxVisible?: number;
}

const LatestNewsSection = ({ headlines, maxVisible = 12 }: LatestNewsSectionProps) => {
  if (headlines.length === 0) {
    return null;
  }

  const limited = headlines.slice(0, maxVisible);

  return (
    <div className="mb-6">
      <div className="bg-[#0b0f10] rounded-md border border-[#1f2a32] px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#f4f7fb]">Latest in the Past 2 Hours</h2>
          <span className="mt-2 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#152028] text-[#a9b1b7] border border-[#23303a]">
            {headlines.length} headline{headlines.length === 1 ? '' : 's'}
          </span>
        </div>
        <div>
          {limited.map((headline, index) => (
            <HeadlineItem key={`${headline.link}-${index}`} headline={headline} className="last:border-b-0" />
          ))}
          {headlines.length > maxVisible && (
            <p className="mt-2 text-xs text-[#7a8288]">Showing the {maxVisible} most recent headlines.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestNewsSection;
