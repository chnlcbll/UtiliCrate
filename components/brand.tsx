import Image from 'next/image';
import Link from 'next/link';

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="UtiliCrate home">
      <span className="brand-logo"><Image src="/utilicrate-logo.png" alt="" width={36} height={36} priority /></span>
      <span>UtiliCrate</span>
    </Link>
  );
}
