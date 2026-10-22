import { ReportIssueButton } from './ReportIssueButton'

interface AttributionChipProps {
  source: string
  url?: string
  page?: string
  onReport?: () => void
}

export function AttributionChip({ source, url, page: pageName, onReport }: AttributionChipProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-8 pt-4 border-t border-hairline">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-deep rounded text-xs text-stone">
        Source:{' '}
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
            {source}
          </a>
        ) : (
          source
        )}
        {url && <span className="material-symbols-outlined text-sm">open_in_new</span>}
      </span>
      {pageName ? (
        <ReportIssueButton page={pageName} />
      ) : onReport ? (
        <button type="button" onClick={onReport} className="text-xs text-stone hover:text-error transition-colors">
          Report an issue
        </button>
      ) : (
        <ReportIssueButton page={source} />
      )}
    </div>
  )
}
