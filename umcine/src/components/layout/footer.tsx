export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-end gap-3 px-10">
        <img src="/images/logos/tmdb-logo.svg" alt="TMDB" className="h-3" />
        <p className="text-xs text-gray-500">
          This product uses the TMDB API but is not endorsed or certified by{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-gray-900"
          >
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
};
