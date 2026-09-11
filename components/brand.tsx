import Image from 'next/image';

export function Brand() {
  return (
    <a href="/" className="brand" aria-label="UtiliCrate home">
      <span className="brand-logo"><Image src="/utilicrate-logo.png" alt="" width={36} height={36} priority /></span>
      <span className="wordmark"><b>Utili</b><i>Crate</i></span>
    </a>
  );
}
