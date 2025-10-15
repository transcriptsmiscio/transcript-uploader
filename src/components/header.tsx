import React from 'react'
import Image from 'next/image'
import miscioLogo from '../../public/miscio.png'

type HeaderProps = {
  accent?: 'brand-teal' | 'brand-red' | 'brand-coral' | 'brand-gold' | 'brand-beige' | 'brand-navy';
}

const Header: React.FC<HeaderProps> = ({ accent = 'brand-navy' }) => (
  <div className="flex flex-col items-center mb-8 mt-4">
    {(() => {
      const accentToBg: Record<Required<HeaderProps>['accent'], string> = {
        'brand-navy': 'bg-brand-navy',
        'brand-teal': 'bg-brand-teal',
        'brand-red': 'bg-brand-red',
        'brand-coral': 'bg-brand-coral',
        'brand-gold': 'bg-brand-gold',
        'brand-beige': 'bg-brand-beige',
      };
      const cls = accentToBg[accent] || 'bg-brand-navy';
      return (
        <div className={`rounded-full p-4 mb-2 border ${cls}`}>
          <Image src={miscioLogo} alt="Miscio Logo" width={48} height={48} />
        </div>
      );
    })()}
    <h1 className="text-3xl font-semibold mb-2 text-center text-brand-navy">
      Miscio Transcript Uploader
    </h1>
    <p className="text-center text-brand-navy/70">
      Securely submit your Personal Information, ID, and Transcripts.
    </p>
  </div>
)

export default Header
