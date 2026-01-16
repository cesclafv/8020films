import './globals.css';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <head>
        <title>Page Not Found | 8020 Films</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </head>
      <body className="bg-[#0a0a0a] min-h-screen flex flex-col items-center justify-center px-6">
        <main className="text-center max-w-xl">
          {/* Logo */}
          <Link href="/en" className="inline-block mb-12">
            <Image
              src="/img/logo-8020Films-horizontal_white_1000px.png"
              alt="8020 Films"
              width={200}
              height={57}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Message */}
          <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8">
            Whatever you were looking for doesn&apos;t currently exist at this address...
            <br />
            <span className="text-white/60">
              Unless you were looking for the error page, in which case: Congrats! You totally found it.
            </span>
          </p>

          {/* Back to home button */}
          <Link
            href="/en"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
