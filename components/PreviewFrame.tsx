import React, { useEffect, useRef } from 'react';
import { DeviceView } from '../types';

interface PreviewFrameProps {
  html: string;
  device: DeviceView;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({ html, device }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      // Direct write to allow scripts to execute properly
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <div className={`transition-all duration-300 ease-in-out h-full mx-auto bg-white shadow-2xl overflow-hidden rounded-md border border-gray-700 ${device}`}>
      <iframe
        ref={iframeRef}
        title="Website Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
};
