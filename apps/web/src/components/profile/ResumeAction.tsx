'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink } from 'lucide-react';

function inferFilename(url: string, fallback = 'Rohan_Kumar_Resume_2025.pdf') {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop() || '';
    return last.toLowerCase().endsWith('.pdf') ? last : fallback;
  } catch {
    return fallback;
  }
}

async function downloadFromUrl(url: string, filename: string) {
  const res = await fetch(url, { cache: 'no-store', mode: 'cors' });
  if (!res.ok) throw new Error(`Failed to fetch resume: ${res.status}`);
  const blob = await res.blob();

  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export function ResumeActions({ url }: { url: string }) {
  const [downloading, setDownloading] = React.useState(false);

  const onDownload = async () => {
    try {
      setDownloading(true);
      await downloadFromUrl(url, inferFilename(url));
    } catch (e) {
      console.error(e);
      alert('Sorry, the download failed. Try opening the PDF and saving it.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button asChild className="w-full sm:w-auto">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          View Resume
        </a>
      </Button>
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={onDownload}
        disabled={downloading}
      >
        {downloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Downloading…
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download
          </>
        )}
      </Button>
    </div>
  );
}
